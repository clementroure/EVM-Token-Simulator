import { useEffect, useState } from 'react';

function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true); // Default to true

  useEffect(() => {
    if (typeof navigator !== "undefined") { // Ensure navigator is not being accessed during SSR
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return isOnline;
}

export default useNetworkStatus;