"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Hook that animates a number from 0 to `end` over `duration` ms.
 * Triggers when the element enters the viewport.
 * If `fluctuate` is true, the number will continuously change slightly after reaching the end value.
 */
export function useCountUp(end: number, duration: number = 2000, decimals: number = 0, fluctuate: boolean = false) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let fluctuationInterval: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(parseFloat((eased * end).toFixed(decimals)));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else if (fluctuate) {
              // Start continuous fluctuation once count up is done
              // We want it to update constantly to look alive
              fluctuationInterval = setInterval(() => {
                const changePcnt = (Math.random() - 0.5) * 0.04; // +/- 2%
                const newValue = Math.max(0, end + (end * changePcnt));
                
                const formattedValue = decimals === 0 
                  ? Math.round(newValue) 
                  : parseFloat(newValue.toFixed(decimals));
                
                setValue(formattedValue);
              }, 1500 + Math.random() * 1000); // Random interval between 1.5s and 2.5s
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (fluctuationInterval) clearInterval(fluctuationInterval);
    };
  }, [end, duration, decimals, fluctuate]);

  return { value, ref };
}
