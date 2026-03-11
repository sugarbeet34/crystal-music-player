import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import { Color } from 'three';

import { audioReactiveState } from '@/store/audioReactiveState';

import { material } from './Model/material';

interface IProps {
  targetColor: number;
}

export const ColorAnimator = ({ targetColor }: IProps) => {
  const target = useRef(new Color(targetColor));
  const shifted = useRef(new Color(targetColor));

  useFrame((_, delta) => {
    target.current.setHex(targetColor);

    // apply treble hue shift toward cool colors
    const hueShift = audioReactiveState.trebleHueShift;
    if (hueShift > 0.001) {
      const hsl = { h: 0, s: 0, l: 0 };
      target.current.getHSL(hsl);
      shifted.current.setHSL(
        (hsl.h + hueShift + 1) % 1,
        Math.min(1, hsl.s + hueShift * 0.5),
        hsl.l,
      );
    } else {
      shifted.current.copy(target.current);
    }

    const speed = 1 - Math.pow(0.001, delta / 2);
    material.color.lerp(shifted.current, speed);
  });

  return null;
};
