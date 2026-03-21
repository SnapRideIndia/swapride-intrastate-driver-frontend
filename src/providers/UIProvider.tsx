import React from 'react';
import { View, StyleSheet } from 'react-native';
import ToastContainer from '../components/ui/ToastContainer';
import ModalContainer from '../components/ui/ModalContainer';

/**
 * Mounts the global overlay layer (toasts + modals) above all screens.
 * Place this as the outermost wrapper in App.tsx.
 */
type Props = { children: React.ReactNode };

const UIProvider = ({ children }: Props) => (
  <View style={styles.root}>
    {children}
    <ToastContainer />
    <ModalContainer />
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default UIProvider;
