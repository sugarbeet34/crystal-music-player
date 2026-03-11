'use client';

import { useEffect, useRef } from 'react';

import styles from './styles.module.css';

const RING_R = 18; // half of ring size

export const SciFiCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let mx = -200,
      my = -200; // actual mouse
    let rx = -200,
      ry = -200; // ring center (lerped)
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      // dot: instant
      dot.style.transform = `translate(${mx}px, ${my}px)`;

      // ring: lags behind — the faster you move, the farther it trails
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.transform = `translate(${rx - RING_R}px, ${ry - RING_R}px)`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={styles.cursorDot}>
        <div className={styles.cursorCross}>
          <span className={styles.crossH} />

          <span className={styles.crossV} />

          <span className={styles.crossCenter} />
        </div>
      </div>

      <div ref={ringRef} className={styles.cursorRing} />
    </>
  );
};
