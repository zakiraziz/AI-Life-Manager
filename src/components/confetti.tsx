"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (trigger && !hasFiredRef.current) {
      hasFiredRef.current = true;

      const duration = 2 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        const now = Date.now();
        if (now >= end) {
          hasFiredRef.current = false;
          onComplete?.();
          return;
        }

        // Launch confetti particles
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          decay: 0.9,
          startVelocity: 30 + Math.random() * 20,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          decay: 0.9,
          startVelocity: 30 + Math.random() * 20,
        });

        requestAnimationFrame(frame);
      };

      frame();
    }
  }, [trigger, onComplete]);

  return null;
}
