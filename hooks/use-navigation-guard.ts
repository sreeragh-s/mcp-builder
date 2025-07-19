import { useState, useEffect } from 'react';

interface UseNavigationGuardProps {
  enabled: boolean;
}

export function useNavigationGuard({ enabled }: UseNavigationGuardProps) {
  const [active, setActive] = useState(false);

  const accept = () => setActive(false);
  const reject = () => setActive(false);

  useEffect(() => {
    if (enabled) {
      // Add beforeunload listener if needed
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        return (e.returnValue = '');
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [enabled]);

  return {
    active,
    accept,
    reject,
  };
} 