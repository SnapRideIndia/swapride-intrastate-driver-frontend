import React, { useContext } from 'react';
import { useDriverProfile } from '../features/driver/hooks/useDriverProfile';
import { tokenStorage } from '../api/tokenStorage';
import { storage } from '../storage/mmkv';
import { DriverContext, type DriverContextValue } from './driverContextInstance';

export type { DriverContextValue };

type Props = { children: React.ReactNode };

export const DriverProvider = ({ children }: Props) => {
  const [hasToken, setHasToken] = React.useState(tokenStorage.hasToken());

  // Watch for token changes (especially after login/logout)
  React.useEffect(() => {
    // Listen for changes to auth keys to update login state reactively
    const listener = storage.addOnValueChangedListener((key) => {
      if (key === 'auth_token') {
        setHasToken(tokenStorage.hasToken());
      }
    });
    return () => listener.remove();
  }, []);

  const { data, isLoading, isError, refetch: rqRefetch } = useDriverProfile(hasToken);
  
  const refetch = React.useCallback(() => {
    setHasToken(tokenStorage.hasToken());
    rqRefetch();
  }, [rqRefetch]);

  return (
    <DriverContext.Provider value={{ driver: data ?? null, isLoading, isError, refetch }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = (): DriverContextValue => {
  const ctx = useContext(DriverContext);
  if (!ctx) {
    throw new Error(
      'useDriver must be used inside <DriverProvider>. If this appeared right after editing context code, reload the app (Fast Refresh can desync context).',
    );
  }
  return ctx;
};
