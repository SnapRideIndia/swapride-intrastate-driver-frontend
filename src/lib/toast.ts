/**
 * Singleton toast event emitter.
 * Usable from anywhere — React components, API interceptors, hooks.
 *
 * Usage:
 *   toast.success('Saved!');
 *   toast.error('Failed', 'Could not connect to server');
 *   toast.network();
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'network';

export type ToastOptions = {
  type: ToastType;
  title: string;
  message?: string;
  /** Auto-dismiss duration in ms. Defaults to 3500. */
  duration?: number;
};

export type ToastItem = ToastOptions & { id: string };

type Listener = (item: ToastItem) => void;

const listeners = new Set<Listener>();

const emit = (options: ToastOptions): void => {
  const item: ToastItem = {
    ...options,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
  listeners.forEach(l => l(item));
};

export const toast = {
  show: emit,
  success: (title: string, message?: string) => emit({ type: 'success', title, message }),
  error: (title: string, message?: string) => emit({ type: 'error', title, message }),
  warning: (title: string, message?: string) => emit({ type: 'warning', title, message }),
  info: (title: string, message?: string) => emit({ type: 'info', title, message }),
  network: () =>
    emit({
      type: 'network',
      title: 'No Internet Connection',
      message: 'Check your network and try again.',
    }),
};

export const subscribeToast = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
