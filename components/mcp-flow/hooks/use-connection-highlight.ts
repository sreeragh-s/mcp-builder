import { useCallback } from 'react';

export function useConnectionHighlight(isValidConnection: (connection: any) => boolean) {
  const onConnectStart = useCallback(() => {
    // Add connection highlighting logic here if needed
  }, []);

  const onConnectEnd = useCallback(() => {
    // Remove connection highlighting logic here if needed
  }, []);

  return {
    onConnectStart,
    onConnectEnd,
  };
} 