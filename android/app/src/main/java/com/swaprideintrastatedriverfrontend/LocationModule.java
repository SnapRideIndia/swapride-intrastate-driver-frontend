package com.swaprideintrastatedriverfrontend;

import android.content.Intent;
import android.os.Build;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import javax.annotation.Nonnull;

/**
 * Native module to control the Location Foreground Service from React Native.
 */
public class LocationModule extends ReactContextBaseJavaModule {
    public static final String MODULE_NAME = "LocationModule";
    private static ReactApplicationContext reactContext;

    public LocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        LocationModule.reactContext = reactContext;
    }

    public static ReactApplicationContext getReactContext() {
        return reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void startLocationService(String tripId, String token) {
        Intent intent = new Intent(reactContext, LocationService.class);
        intent.setAction("START_LOCATION_SERVICE");
        intent.putExtra("tripId", tripId);
        intent.putExtra("token", token);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent);
        } else {
            reactContext.startService(intent);
        }
    }

    @ReactMethod
    public void stopLocationService() {
        Intent intent = new Intent(reactContext, LocationService.class);
        intent.setAction("STOP_LOCATION_SERVICE");
        reactContext.stopService(intent);
    }
}
