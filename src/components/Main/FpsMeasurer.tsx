import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';

interface IProps {
  fpsRef: React.RefObject<HTMLSpanElement | null>;
  msRef: React.RefObject<HTMLSpanElement | null>;
}

export const FpsMeasurer = ({ fpsRef, msRef }: IProps) => {
  const frames = useRef(0);
  const bucketStart = useRef(performance.now());
  const frameStart = useRef(performance.now());
  const msAccum = useRef(0);
  const msCount = useRef(0);

  useFrame(() => {
    const now = performance.now();

    // per-frame delta for MS
    const frameDelta = now - frameStart.current;
    frameStart.current = now;
    msAccum.current += frameDelta;
    msCount.current++;

    frames.current++;

    const bucketDelta = now - bucketStart.current;
    if (bucketDelta >= 1000) {
      // FPS — plain update, no animation
      const fps = Math.round((frames.current * 1000) / bucketDelta);
      if (fpsRef.current) fpsRef.current.textContent = String(fps);

      // MS — average frame time with flip animation
      const avgMs = (msAccum.current / msCount.current).toFixed(1);
      if (msRef.current) {
        msRef.current.classList.remove('flip');
        void msRef.current.offsetWidth;
        msRef.current.classList.add('flip');
        msRef.current.textContent = avgMs;
      }

      frames.current = 0;
      msAccum.current = 0;
      msCount.current = 0;
      bucketStart.current = now;
    }
  });

  return null;
};
