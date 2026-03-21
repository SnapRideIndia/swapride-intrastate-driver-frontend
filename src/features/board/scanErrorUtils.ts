import { isAxiosError } from 'axios';

/** User-facing message for scan/board API failures (no global toast — caller shows modal). */
export function getScanErrorMessage(err: unknown): string {
  if (!isAxiosError(err)) {
    if (err instanceof Error && err.message) return err.message;
    return 'Something went wrong. Please try again.';
  }

  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return 'Request timed out. Check your connection and try again.';
    }
    return 'No network connection. Try again when you are online.';
  }

  const data = err.response.data as Record<string, unknown> | undefined;
  const msg = data?.message;
  if (typeof msg === 'string' && msg.trim()) return msg;
  if (Array.isArray(msg) && msg.length > 0 && typeof msg[0] === 'string') {
    return msg[0];
  }

  const status = err.response.status;
  if (status === 404) {
    return 'Invalid ticket or booking was not found.';
  }
  if (status === 400) {
    return typeof msg === 'string' && msg.trim()
      ? msg
      : 'This QR code is not valid. Ask the passenger to refresh their ticket.';
  }
  if (status === 409) {
    return 'This ticket cannot be used right now. The passenger may already be boarded or the ticket is for another trip.';
  }
  if (status === 403) {
    return 'You are not allowed to board this ticket.';
  }

  return 'Could not complete boarding. Please try again.';
}
