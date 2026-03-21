import { createContext } from 'react';
import type { DriverProfile } from '../features/driver/types';

/**
 * Context instance lives in its own module so Fast Refresh / HMR does not call
 * `createContext()` again when editing `DriverContext.tsx` (re-renders the tree).
 */
export type DriverContextValue = {
  driver: DriverProfile | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export const DriverContext = createContext<DriverContextValue | null>(null);

DriverContext.displayName = 'DriverContext';
