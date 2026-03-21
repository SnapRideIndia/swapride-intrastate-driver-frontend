import type { ApiTripSummary } from './types';

/**
 * Sorts trips chronologically by date and scheduled start time.
 * Date format: YYYY-MM-DD
 * Time format: hh:mm aa (e.g., "08:30 AM")
 */
export const sortTripsByScheduledTime = (trips: ApiTripSummary[]): ApiTripSummary[] => {
  return [...trips].sort((a, b) => {
    // 1. Sort by date first
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    // 2. Sort by time if dates are the same
    const parseTime = (timeStr: string) => {
      if (!timeStr) return 0;
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    };

    return parseTime(a.scheduledStartTime) - parseTime(b.scheduledStartTime);
  });
};
