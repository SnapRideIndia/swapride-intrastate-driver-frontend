import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { ModalOptions, ModalType } from '../../lib/modal';

type Props = {
  visible: boolean;
  options: ModalOptions;
  onClose: () => void;
};

const TYPE_CONFIG: Record<
  NonNullable<ModalType>,
  { Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>; color: string; bg: string }
> = {
  error: { Icon: XCircle, color: colors.error, bg: colors.errorTint },
  warning: { Icon: AlertTriangle, color: colors.warning, bg: colors.warningTint },
  info: { Icon: Info, color: colors.primary, bg: colors.primaryTint },
  success: { Icon: CheckCircle2, color: colors.success, bg: colors.successTint },
};

const ConfirmModal = ({ visible, options, onClose }: Props) => {
  const cfg = TYPE_CONFIG[options.type ?? 'info'];

  const handleConfirm = () => {
    onClose();
    options.onConfirm?.();
  };

  const handleCancel = () => {
    onClose();
    options.onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.centeredView}>
        <View style={styles.card}>
          <View style={styles.iconBadge}>
            <cfg.Icon size={28} color={cfg.color} strokeWidth={2} />
          </View>

          <Text style={styles.title}>{options.title}</Text>
          {options.message ? (
            <Text style={styles.message}>{options.message}</Text>
          ) : null}

          <View style={styles.actions}>
            {options.cancelLabel !== null && (
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
                <Text style={styles.cancelText}>
                  {options.cancelLabel ?? 'Cancel'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: cfg.color }]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>
                {options.confirmLabel ?? 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.surface,
  },
});

export default ConfirmModal;
