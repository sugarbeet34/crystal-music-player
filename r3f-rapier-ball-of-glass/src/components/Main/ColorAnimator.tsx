import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import { Color } from 'three';

import { material } from './Model/material';

interface IProps {
  targetColor: number;
}

export const ColorAnimator = ({ targetColor }: IProps) => {
  const target = useRef(new Color(targetColor));

  target.current.setHex(targetColor);

  useFrame((_, delta) => {
    // lerp speed: roughly reaches target in ~2s
    const speed = 1 - Math.pow(0.001, delta / 2);
    material.color.lerp(target.current, speed);
  });

  return null;
};
