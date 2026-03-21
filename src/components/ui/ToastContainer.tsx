import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from './Toast';
import { subscribeToast, type ToastItem } from '../../lib/toast';

const ToastContainer = () => {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsub = subscribeToast(item => {
      setQueue(prev => [...prev, item]);
    });
    return unsub;
  }, []);

  const remove = useCallback((id: string) => {
    setQueue(prev => prev.filter(t => t.id !== id));
  }, []);

  if (queue.length === 0) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { top: insets.top + 8 }]} pointerEvents="box-none">
      {queue.map(item => (
        <Toast key={item.id} item={item} onDismiss={remove} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});

export default ToastContainer;
