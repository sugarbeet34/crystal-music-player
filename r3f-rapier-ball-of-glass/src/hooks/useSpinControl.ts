import { useEffect, useRef } from 'react';

import { Group } from 'three';
import { Raf } from 'vevet';

const BASE_SPEED = 0.004;    // rad/frame — auto spin speed
const DRAG_STRENGTH = 1.2;    // impulse scale per drag (small = subtle influence)
const DAMPING = 0.94;         // velocity decay per frame — faster return to base
const EASE = 0.018;           // display lerp — low = heavy/sluggish feel, starts very slow

export function useSpinControl(groupRef: React.RefObject<Group | null>) {
  const velRef = useRef(BASE_SPEED);  // start at base speed
  const angleRef = useRef(0);
  const displayAngleRef = useRef(0);

  const isDragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastX.current = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      velRef.current += (dx / window.innerWidth) * DRAG_STRENGTH;
    };

    const onMouseUp = () => { isDragging.current = false; };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const raf = new Raf();
    raf.play();

    raf.on('frame', () => {
      // unified damping — velocity decays toward zero entirely
      // auto spin is a gentle nudge, not a floor
      velRef.current *= DAMPING;

      // always add a tiny base push so it never fully stops
      velRef.current += BASE_SPEED * (1 - DAMPING);

      angleRef.current += velRef.current;

      // heavy lerp — starts very slowly, eases in (feels massive/inertial)
      const lerpFactor = raf.lerpFactor(EASE);
      displayAngleRef.current +=
        (angleRef.current - displayAngleRef.current) * lerpFactor;

      if (groupRef.current) {
        groupRef.current.rotation.y = displayAngleRef.current;
      }
    });

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      raf.destroy();
    };
  }, [groupRef]);
}
