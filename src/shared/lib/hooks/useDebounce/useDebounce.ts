import { useCallback, useRef } from 'react';

export const useDebounce = (
  callback: (...args: unknown[]) => void,
  delayInMS: number
) => {
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  return useCallback(
    (...args: unknown[]) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        callback(...args);
      }, delayInMS);
    },
    [callback, delayInMS]
  );
};
