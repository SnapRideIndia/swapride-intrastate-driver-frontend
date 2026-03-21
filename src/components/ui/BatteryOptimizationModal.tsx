import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BatteryWarning, Settings, RefreshCw } from 'lucide-react-native';
import { colors } from '../../theme/colors';

type Props = {
  visible: boolean;
  onRetry: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
};

const BatteryOptimizationModal = ({ visible, onRetry, onOpenSettings, onClose }: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.centeredView}>
        <View style={styles.card}>
          <View style={styles.iconBadge}>
            <BatteryWarning size={32} color={colors.warning} strokeWidth={2.5} />
          </View>

          <Text style={styles.title}>Battery Optimization Restricted</Text>
          <Text style={styles.message}>
            To keep tracking your location reliably in the background, please disable battery optimization for SwapRide.
          </Text>
          <Text style={styles.subMessage}>
            Without this, your trip might stop updating when you minimize the app.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.7}>
              <RefreshCw size={18} color={colors.textPrimary} style={styles.btnIcon} />
              <Text style={styles.retryText}>Retry Dialog</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={onOpenSettings}
              activeOpacity={0.8}
            >
              <Settings size={18} color={colors.surface} style={styles.btnIcon} />
              <Text style={styles.settingsText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>I'll do it later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warningTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  retryBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingsBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  btnIcon: {
    marginRight: 8,
  },
  closeBtn: {
    marginTop: 20,
    padding: 10,
  },
  closeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default BatteryOptimizationModal;
