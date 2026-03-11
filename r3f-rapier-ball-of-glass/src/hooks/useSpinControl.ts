import { useEffect, useRef } from 'react';

import { Group } from 'three';
import { Raf } from 'vevet';

import { audioReactiveState } from '@/store/audioReactiveState';

const BASE_SPEED    = 0.004;
const DRAG_STRENGTH = 1.2;
const DAMPING       = 0.94;
const EASE          = 0.018;

export function useSpinControl(groupRef: React.RefObject<Group | null>) {
  const velRef          = useRef(BASE_SPEED);
  const angleRef        = useRef(0);
  const displayAngleRef = useRef(0);

  const isDragging = useRef(false);
  const lastX      = useRef(0);

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
      // speed multiplier from audio reactive (0 = paused, >1 = music-driven)
      const mul = audioReactiveState.targetSpeedMultiplier;
      const effectiveBase = BASE_SPEED * mul;

      velRef.current *= DAMPING;
      velRef.current += effectiveBase * (1 - DAMPING);

      angleRef.current += velRef.current;

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
