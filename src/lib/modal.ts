/**
 * Singleton modal event emitter.
 * Usable from anywhere — API interceptors, hooks, screens.
 *
 * Usage:
 *   modal.confirm('End Trip?', 'This will complete the current trip.', onConfirm);
 *   modal.error('Server Error', 'Something went wrong.');
 */

export type ModalType = 'error' | 'warning' | 'info' | 'success';

export type ModalOptions = {
  type?: ModalType;
  title: string;
  message?: string;
  confirmLabel?: string;

  cancelLabel?: string | null;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type Listener = (options: ModalOptions | null) => void;

const listeners = new Set<Listener>();

const emit = (options: ModalOptions | null): void => {
  listeners.forEach(l => l(options));
};

export const modal = {
  show: (options: ModalOptions) => emit(options),

  error: (title: string, message?: string, onOk?: () => void) =>
    emit({
      type: 'error',
      title,
      message,
      confirmLabel: 'OK',
      cancelLabel: null,
      onConfirm: onOk,
    }),

  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ) =>
    emit({
      type: 'warning',
      title,
      message,
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      onConfirm,
      onCancel,
    }),

  dismiss: () => emit(null),
};

export const subscribeModal = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
