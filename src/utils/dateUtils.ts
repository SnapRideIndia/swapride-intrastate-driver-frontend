import {
  format,
  parseISO,
  differenceInMinutes,
  differenceInHours,
  isYesterday,
  isValid,
} from 'date-fns';

/** Returns today's date as a YYYY-MM-DD string (local timezone). */
export const todayISO = (): string => format(new Date(), 'yyyy-MM-dd');

/** Time-based greeting for the current hour. */
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

const FALLBACK = '—';

function safeParse(iso: string | null | undefined): Date | null {
  if (iso == null || String(iso).trim() === '') return null;
  const d = parseISO(iso);
  return isValid(d) ? d : null;
}

/** Formats an ISO date-time string to "12:30 PM". */
export const formatTime = (iso: string | null | undefined): string => {
  const d = safeParse(iso);
  return d ? format(d, 'hh:mm aa') : FALLBACK;
};

/** Formats an ISO date-time for boarding: "18 Mar 2026, 2:30 PM". */
export const formatBoardedDateTime = (iso: string | null | undefined): string => {
  const d = safeParse(iso);
  if (!d) return typeof iso === 'string' && iso.trim() ? iso : FALLBACK;
  return format(d, 'd MMM yyyy, h:mm aa');
};

/** Formats an ISO date string to "18 March 2026". */
export const formatDate = (iso: string | null | undefined): string => {
  const d = safeParse(iso);
  return d ? format(d, 'd MMMM yyyy') : FALLBACK;
};

/** Formats an ISO date string to "Mar 2026". */
export const formatMonthYear = (iso: string | null | undefined): string => {
  const d = safeParse(iso);
  return d ? format(d, 'MMM yyyy') : FALLBACK;
};

/**
 * Formats an ISO date string as a relative human-readable time:
 * "Just now", "5m ago", "3h ago", "Yesterday", or "18 Mar".
 */
export const formatRelativeTime = (iso: string | null | undefined): string => {
  const date = safeParse(iso);
  if (!date) return FALLBACK;
  const now = new Date();
  const diffMins = differenceInMinutes(now, date);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = differenceInHours(now, date);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'd MMM');
};

/** Formats the current date as "Tue, 18 Mar" for compact display headers. */
export const formatHeaderDate = (): string =>
  format(new Date(), 'EEE, d MMM');

/** Formats the current date as "Friday, 20 March" for full display headers. */
export const formatFullDate = (): string =>
  format(new Date(), 'EEEE, d MMMM');

/** Formats a Date object as a YYYY-MM-DD string. */
export const dateToISO = (date: Date): string => format(date, 'yyyy-MM-dd');

/** Formats an ISO date string to Indian style "18-03-2026". */
export const formatIndianDate = (iso: string | null | undefined): string => {
  const d = safeParse(iso);
  return d ? format(d, 'dd-MM-yyyy') : FALLBACK;
};

/** Formats a YYYY-MM-DD string as "20 Mar" for button labels. */
export const formatShortDate = (iso: string | null | undefined): string => {
  const d = safeParse(iso);
  return d ? format(d, 'd MMM') : FALLBACK;
};
