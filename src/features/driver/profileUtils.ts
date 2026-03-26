import type { DriverProfile, DriverStatus } from './types';

const STATUSES: DriverStatus[] = [
  'AVAILABLE',
  'ON_TRIP',
  'OFF_DUTY',
  'ON_LEAVE',
  'BLOCKED',
];

export function normalizeDriverProfile(raw: unknown): DriverProfile {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid driver profile response');
  }
  const o = raw as Record<string, unknown>;
  const mobileNumber = String(o.mobileNumber ?? '').trim();
  const rawName = typeof o.name === 'string' ? o.name.trim() : '';
  const name = rawName || mobileNumber || 'Driver';

  const status = STATUSES.includes(o.status as DriverStatus) ? (o.status as DriverStatus) : 'AVAILABLE';

  let profileUrl: string | null = null;
  if (typeof o.profileUrl === 'string' && o.profileUrl.length > 0) {
    profileUrl = o.profileUrl;
  }

  return {
    id: String(o.id ?? ''),
    name,
    mobileNumber,
    licenseNumber: String(o.licenseNumber ?? ''),
    rating: Number(o.rating ?? 0),
    rating_count: Number(o.rating_count ?? 0),
    status,
    profileUrl,
    lastLogin: typeof o.lastLogin === 'string' ? o.lastLogin : null,
    createdAt: String(o.createdAt ?? ''),
    updatedAt: String(o.updatedAt ?? ''),
  };
}

export function getDriverDisplayName(driver: DriverProfile | null | undefined): string {
  if (!driver) return '—';
  const n = driver.name?.trim();
  if (n) return n;
  const m = driver.mobileNumber?.trim();
  if (m) return m;
  return '—';
}
