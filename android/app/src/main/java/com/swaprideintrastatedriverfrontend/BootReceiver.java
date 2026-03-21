package com.swaprideintrastatedriverfrontend;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

/**
 * BroadcastReceiver that listens for system boot to restart the LocationService.
 * This ensures that if a trip was active during a reboot, tracking resumes automatically.
 */
public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";
    private static final String PREFS_NAME = "LocationServicePrefs";
    private static final String KEY_TRIP_ID = "tripId";
    private static final String KEY_TOKEN = "token";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d(TAG, "Device rebooted, checking for active trip...");
            
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String tripId = prefs.getString(KEY_TRIP_ID, null);
            String token = prefs.getString(KEY_TOKEN, null);
            
            if (tripId != null && token != null) {
                Log.d(TAG, "Active trip found: " + tripId + ". Restarting location service.");
                Intent serviceIntent = new Intent(context, LocationService.class);
                serviceIntent.setAction("START_LOCATION_SERVICE");
                serviceIntent.putExtra("tripId", tripId);
                serviceIntent.putExtra("token", token);
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent);
                } else {
                    context.startService(serviceIntent);
                }
            }
        }
    }
}
