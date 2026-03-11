import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';

import { audioData } from '@/store/audioStore';
import { audioReactiveState } from '@/store/audioReactiveState';
import { material } from './Model/material';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const AudioReactive = () => {
  const smoothBass    = useRef(0);
  const smoothRms     = useRef(0);
  const smoothTreble  = useRef(0);
  const smoothSpeed   = useRef(1);
  const smoothBloom   = useRef(0.1);
  const smoothAttract = useRef(0.02);
  const smoothDispersion = useRef(2.5);
  const smoothHueShift   = useRef(0);
  const prevBass      = useRef(0);
  const lastCheckTime = useRef(0);

  useFrame((_, delta) => {
    const { bass, treble, rms, isPlaying } = audioData;

    const fast   = 1 - Math.pow(0.001, delta / 0.3);
    const medium = 1 - Math.pow(0.001, delta / 1.0);
    const slow   = 1 - Math.pow(0.001, delta / 2.5);

    smoothBass.current   = lerp(smoothBass.current,   bass,   fast);
    smoothTreble.current = lerp(smoothTreble.current, treble, fast);
    smoothRms.current    = lerp(smoothRms.current,    rms,    medium);

    // ── spin speed — bass only, no mid ──
    const targetSpeed = isPlaying ? 1 + smoothBass.current * 1.5 : 0;
    smoothSpeed.current = lerp(smoothSpeed.current, targetSpeed, slow);
    audioReactiveState.targetSpeedMultiplier = smoothSpeed.current;

    // ── onset detection ~100ms ──
    lastCheckTime.current += delta;
    if (lastCheckTime.current >= 0.1) {
      lastCheckTime.current = 0;
      const bassRise = bass - prevBass.current;
      prevBass.current = bass;
      if (isPlaying && bass > 0.45 && bassRise > 0.08) {
        audioReactiveState.explosionImpulse = (0.024 + bass * 0.048) * 1.6;
      } else {
        audioReactiveState.explosionImpulse = 0;
      }
    }

    // ── attract force ──
    const targetAttract = isPlaying
      ? Math.max(0.002, 0.02 - smoothBass.current * 0.018)
      : 0.02;
    smoothAttract.current = lerp(smoothAttract.current, targetAttract, medium);
    audioReactiveState.attractForce = smoothAttract.current;

    // ── bloom ──
    const targetBloom = isPlaying ? 0.1 + smoothRms.current * 1.2 : 0.1;
    smoothBloom.current = lerp(smoothBloom.current, targetBloom, fast);
    audioReactiveState.bloomStrength = smoothBloom.current;

    // ── treble → cool hue shift ──
    const targetHue = isPlaying ? smoothTreble.current * 0.18 : 0;
    smoothHueShift.current = lerp(smoothHueShift.current, targetHue, medium);
    audioReactiveState.trebleHueShift = smoothHueShift.current;

    // ── dispersion ──
    const targetDispersion = isPlaying ? 2.5 + smoothTreble.current * 4.0 : 2.5;
    smoothDispersion.current = lerp(smoothDispersion.current, targetDispersion, medium);
    material.dispersion = smoothDispersion.current;
  });

  return null;
};
