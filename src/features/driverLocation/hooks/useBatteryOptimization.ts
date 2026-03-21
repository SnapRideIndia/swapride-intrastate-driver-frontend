import { useState, useCallback, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';

const { BatteryOptimization } = NativeModules;

export const useBatteryOptimization = () => {
  const [isIgnoring, setIsIgnoring] = useState<boolean | null>(null);

  const checkStatus = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setIsIgnoring(true);
      return true;
    }
    try {
      const status = await BatteryOptimization.isIgnoringBatteryOptimizations();
      setIsIgnoring(status);
      return status;
    } catch (e) {
      console.error('[BatteryOptimization] Error checking status:', e);
      return false;
    }
  }, []);

  const requestExemption = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const result = await BatteryOptimization.requestIgnoreBatteryOptimizations();
      // Re-check after a short delay
      setTimeout(checkStatus, 2000);
      return result;
    } catch (e) {
      console.error('[BatteryOptimization] Error requesting exemption:', e);
      return false;
    }
  }, [checkStatus]);

  const openSettings = useCallback(() => {
    if (Platform.OS !== 'android') return;
    BatteryOptimization.openBatterySettings();
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isIgnoring,
    checkStatus,
    requestExemption,
    openSettings,
  };
};
