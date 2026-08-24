import { useEffect, useRef } from "react";

export function useLongPress(
  callback: () => void,
  { threshold = 500, onStart, onEnd }: { threshold?: number; onStart?: () => void; onEnd?: () => void } = {}
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  const start = () => {
    isLongPressActive.current = false;
    if (onStart) onStart();
    timerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      callback();
    }, threshold);
  };

  const stop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (onEnd) onEnd();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
}
