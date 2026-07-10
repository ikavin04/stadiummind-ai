import { useState, useEffect, useRef } from 'react';

/**
 * Animates a numeric value from its previous state to a new target value.
 * Uses requestAnimationFrame for a smooth 600ms ease-out transition so stat
 * cards count up/down rather than snapping on data refresh.
 */
export function useCountUp(target: number, duration = 600): number {
  const [displayed, setDisplayed] = useState(target);
  const prevRef = useRef(target);
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to   = target;
    if (from === to) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return displayed;
}
