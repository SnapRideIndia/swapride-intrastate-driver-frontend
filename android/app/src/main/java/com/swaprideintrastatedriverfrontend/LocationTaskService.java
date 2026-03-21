package com.swaprideintrastatedriverfrontend;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import javax.annotation.Nullable;

public class LocationTaskService extends HeadlessJsTaskService {
    @Nullable
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        return new HeadlessJsTaskConfig(
                "LocationUpdateTask", // This must match the name registered in AppRegistry.registerHeadlessTask
                extras != null ? Arguments.fromBundle(extras) : Arguments.createMap(),
                5000, // timeout for the task
                true // allowed in foreground
        );
    }
}
