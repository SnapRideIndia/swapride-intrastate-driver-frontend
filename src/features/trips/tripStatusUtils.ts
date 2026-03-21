import type { BackendTripStatus } from './types';

/**
 * Trip list API returns formatted labels, e.g. "In Progress", "Scheduled".
 */
export function listTripStatusAllowsBoarding(status: string): boolean {
  return /in\s*progress/i.test(status.trim());
}

/** Show passenger manifest on trip detail (read-only or pre-start). */
export function detailTripAllowsManifest(status: BackendTripStatus, isCancelled: boolean): boolean {
  if (isCancelled) return false;
  return status !== 'CANCELLED';
}

/** Driver may mark passengers boarded only while trip is live. */
export function detailTripAllowsBoarding(status: BackendTripStatus): boolean {
  return status === 'IN_PROGRESS';
}
