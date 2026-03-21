package com.swaprideintrastatedriverfrontend;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Background Foreground Service for high-accuracy driver location tracking.
 * 
 * Key Features:
 * - Persistent tracking even when the app is backgrounded or killed.
 * - Native API synchronization via OkHttp for reliability.
 * - Battery & Data optimization:
 *   - Smart Throttling: Limits backend updates to once every 15 seconds.
 *   - Idle Detection: Skips updates if the driver hasn't moved significantly.
 * - Network Resilience: Local retry queue for failed API calls.
 * - Boot Recovery: Automatically restarts tracking after device reboot.
 */
public class LocationService extends Service {
    private static final String TAG = "LocationService";
    private static final String CHANNEL_ID = "location_channel";
    private static final int NOTIFICATION_ID = 12345678;
    private static final String PREFS_NAME = "LocationServicePrefs";
    private static final String KEY_TRIP_ID = "tripId";
    private static final String KEY_TOKEN = "token";
    private static final String API_BASE_URL = "https://c847hsc39h.execute-api.ap-south-2.amazonaws.com";

    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private PowerManager.WakeLock wakeLock;
    private OkHttpClient httpClient;
    private String tripId;
    private String token;
    private long lastSentTime = 0;
    private Location lastLocation = null;
    private final List<JSONObject> failedQueue = new ArrayList<>();
    private static final int MAX_QUEUE_SIZE = 20;

    @Override
    public void onCreate() {
        super.onCreate();
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        httpClient = new OkHttpClient();
        createNotificationChannel();

        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SwapRide::LocationLock");
            wakeLock.acquire(); // Keep CPU alive for tracking
            Log.d(TAG, "WakeLock acquired");
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "START_LOCATION_SERVICE".equals(intent.getAction())) {
            tripId = intent.getStringExtra("tripId");
            token = intent.getStringExtra("token");
            
            // Persist parameters to handle service restarts by the OS
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            if (tripId != null) prefs.edit().putString(KEY_TRIP_ID, tripId).apply();
            if (token != null) prefs.edit().putString(KEY_TOKEN, token).apply();
        } else {
            // Restore parameters from storage if restarted after being killed
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            tripId = prefs.getString(KEY_TRIP_ID, null);
            token = prefs.getString(KEY_TOKEN, null);
        }

        if (tripId != null && token != null) {
            startForegroundService();
            requestLocationUpdates();
        } else {
            Log.w(TAG, "Missing credentials, stopping service.");
            stopSelf();
        }

        return START_STICKY; // Tell system to restart service if it's killed
    }

    private void startForegroundService() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 
                0, notificationIntent, 
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Trip in Progress")
                .setContentText("SwapRide is sharing your live location.")
                .setSmallIcon(R.drawable.ic_notification)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .build();

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error starting foreground service", e);
            // Fallback for some OEMs
            try {
                startForeground(NOTIFICATION_ID, notification);
            } catch (Exception e2) {
                Log.e(TAG, "Critical failure starting foreground", e2);
            }
        }
    }

    private void requestLocationUpdates() {
        if (locationCallback != null) {
            Log.d(TAG, "Location updates already requested, skipping.");
            return;
        }

        LocationRequest locationRequest = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000)
                .setMinUpdateIntervalMillis(5000)
                .build();

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) return;
                for (Location location : locationResult.getLocations()) {
                    Log.d(TAG, "Native Location update: " + location.getLatitude() + ", " + location.getLongitude());

                    // 1. Smart Throttling: Max 1 update per 15 seconds
                    long currentTime = System.currentTimeMillis();
                    if (currentTime - lastSentTime < 15000) {
                        Log.d(TAG, "Throttling: Skipping update (too soon)");
                        emitLocationToJS(location); // Still sync UI
                        continue;
                    }

                    // 2. Idle Detection: Skip if moved < 5 meters and speed < 0.5 m/s
                    if (lastLocation != null) {
                        float distance = location.distanceTo(lastLocation);
                        if (distance < 5 && location.getSpeed() < 0.5) {
                            Log.d(TAG, "Idle Detection: Skipping update (not moved enough)");
                            emitLocationToJS(location); // Still sync UI
                            continue;
                        }
                    }

                    lastSentTime = currentTime;
                    lastLocation = location;

                    sendLocationToServer(location);
                    emitLocationToJS(location);
                }
            }
        };

        try {
            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
        } catch (SecurityException e) {
            Log.e(TAG, "Location permission not granted", e);
        }
    }

    private void sendLocationToServer(Location location) {
        if (tripId == null || token == null) return;

        try {
            JSONObject json = new JSONObject();
            json.put("latitude", location.getLatitude());
            json.put("longitude", location.getLongitude());

            String url = API_BASE_URL + "/drivers/trips/" + tripId + "/location";
            RequestBody body = RequestBody.create(
                json.toString(), 
                MediaType.get("application/json; charset=utf-8")
            );

            Request request = new Request.Builder()
                .url(url)
                .patch(body)
                .addHeader("Authorization", "Bearer " + token)
                .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.e(TAG, "Failed to send location to server, queuing for retry", e);
                    synchronized (failedQueue) {
                        if (failedQueue.size() < MAX_QUEUE_SIZE) {
                            failedQueue.add(json);
                        }
                    }
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (response.isSuccessful()) {
                        Log.d(TAG, "Native Backend update successful");
                        // 3. Network Resilience: Retry failed locations on success
                        retryFailedLocations();
                    } else {
                        Log.w(TAG, "Native Backend update failed: " + response.code() + " " + response.message());
                        if (response.code() == 401) {
                           Log.e(TAG, "401 Unauthorized - Propagating to JS");
                           emitAuthErrorToJS();
                        }
                    }
                    response.close();
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error building JSON/Request", e);
        }
    }

    private void retryFailedLocations() {
        List<JSONObject> toRetry;
        synchronized (failedQueue) {
            if (failedQueue.isEmpty()) return;
            toRetry = new ArrayList<>(failedQueue);
            failedQueue.clear();
        }

        Log.d(TAG, "Retrying " + toRetry.size() + " failed locations");
        for (JSONObject json : toRetry) {
            sendJsonToServer(json);
        }
    }

    private void sendJsonToServer(JSONObject json) {
        if (tripId == null || token == null) return;

        try {
            String url = API_BASE_URL + "/drivers/trips/" + tripId + "/location";
            RequestBody body = RequestBody.create(
                json.toString(), 
                MediaType.get("application/json; charset=utf-8")
            );

            Request request = new Request.Builder()
                .url(url)
                .patch(body)
                .addHeader("Authorization", "Bearer " + token)
                .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.e(TAG, "Retry failed, dropping location to avoid infinite loop", e);
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    response.close();
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error in retry request", e);
        }
    }

    private void emitLocationToJS(Location location) {
        ReactApplicationContext context = LocationModule.getReactContext();
        if (context != null && context.hasActiveReactInstance()) {
            try {
                WritableMap params = Arguments.createMap();
                params.putDouble("latitude", location.getLatitude());
                params.putDouble("longitude", location.getLongitude());
                params.putDouble("speed", location.getSpeed());
                params.putDouble("heading", location.getBearing());
                params.putDouble("accuracy", location.getAccuracy());
                params.putDouble("altitude", location.getAltitude());
                params.putDouble("timestamp", (double) location.getTime());

                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onLocationUpdate", params);
            } catch (Exception e) {
                Log.e(TAG, "Error emitting event to JS", e);
            }
        }
    }

    private void emitAuthErrorToJS() {
        ReactApplicationContext context = LocationModule.getReactContext();
        if (context != null && context.hasActiveReactInstance()) {
            try {
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onAuthError", null);
            } catch (Exception e) {
                Log.e(TAG, "Error emitting auth error to JS", e);
            }
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Location Service Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            Log.d(TAG, "WakeLock released");
        }
        stopForeground(true);
        Log.d(TAG, "Location service destroyed");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
