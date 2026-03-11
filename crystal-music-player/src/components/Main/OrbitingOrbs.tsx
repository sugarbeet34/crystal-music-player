import { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  PointLight,
  Sprite,
  SpriteMaterial,
} from 'three';

import { audioData } from '@/store/audioStore';

interface OrbConfig {
  orbitRadius: number;
  orbitSpeed: number;
  phase: number;
  tiltX: number;
  tiltZ: number;
  scale: number;
  breathSpeed: number;
  breathPhase: number;
  breathMin: number;
  breathMax: number;
  hueShift: number; // HSL hue offset from base color, -0.12 ~ +0.12
  satBoost: number; // saturation boost, 0 ~ 0.2
  lightIntensity: number;
}

const ORBS: OrbConfig[] = [
  {
    orbitRadius: 4.2,
    orbitSpeed: 0.18,
    phase: 0.0,
    tiltX: 0.5,
    tiltZ: 0.2,
    scale: 3.2,
    breathSpeed: 0.7,
    breathPhase: 0.0,
    breathMin: 0.2,
    breathMax: 0.7,
    hueShift: 0.0,
    satBoost: 0.05,
    lightIntensity: 1.8,
  },
  {
    orbitRadius: 3.8,
    orbitSpeed: 0.13,
    phase: 1.2,
    tiltX: -0.4,
    tiltZ: 0.6,
    scale: 2.6,
    breathSpeed: 0.5,
    breathPhase: 1.0,
    breathMin: 0.15,
    breathMax: 0.6,
    hueShift: 0.08,
    satBoost: 0.15,
    lightIntensity: 1.4,
  },
  {
    orbitRadius: 4.5,
    orbitSpeed: 0.22,
    phase: 2.5,
    tiltX: 0.8,
    tiltZ: -0.3,
    scale: 2.2,
    breathSpeed: 0.9,
    breathPhase: 2.2,
    breathMin: 0.25,
    breathMax: 0.75,
    hueShift: -0.06,
    satBoost: 0.1,
    lightIntensity: 1.2,
  },
  {
    orbitRadius: 3.5,
    orbitSpeed: 0.15,
    phase: 3.8,
    tiltX: -0.6,
    tiltZ: -0.5,
    scale: 2.8,
    breathSpeed: 0.6,
    breathPhase: 0.7,
    breathMin: 0.15,
    breathMax: 0.65,
    hueShift: 0.12,
    satBoost: 0.18,
    lightIntensity: 1.6,
  },
  {
    orbitRadius: 4.8,
    orbitSpeed: 0.1,
    phase: 5.0,
    tiltX: 0.3,
    tiltZ: 0.8,
    scale: 3.8,
    breathSpeed: 0.4,
    breathPhase: 3.1,
    breathMin: 0.1,
    breathMax: 0.55,
    hueShift: -0.1,
    satBoost: 0.08,
    lightIntensity: 2.0,
  },
  {
    orbitRadius: 4.0,
    orbitSpeed: 0.25,
    phase: 0.8,
    tiltX: -0.2,
    tiltZ: -0.7,
    scale: 2.4,
    breathSpeed: 1.1,
    breathPhase: 1.8,
    breathMin: 0.2,
    breathMax: 0.72,
    hueShift: 0.05,
    satBoost: 0.12,
    lightIntensity: 1.3,
  },
  {
    orbitRadius: 3.6,
    orbitSpeed: 0.17,
    phase: 4.2,
    tiltX: 0.7,
    tiltZ: 0.1,
    scale: 2.0,
    breathSpeed: 0.8,
    breathPhase: 4.5,
    breathMin: 0.12,
    breathMax: 0.58,
    hueShift: -0.04,
    satBoost: 0.06,
    lightIntensity: 1.1,
  },
  {
    orbitRadius: 5.2,
    orbitSpeed: 0.12,
    phase: 1.8,
    tiltX: -0.3,
    tiltZ: 0.4,
    scale: 4.2,
    breathSpeed: 0.35,
    breathPhase: 2.8,
    breathMin: 0.08,
    breathMax: 0.45,
    hueShift: 0.09,
    satBoost: 0.14,
    lightIntensity: 1.5,
  },
  {
    orbitRadius: 4.6,
    orbitSpeed: 0.2,
    phase: 3.3,
    tiltX: 0.6,
    tiltZ: -0.6,
    scale: 2.5,
    breathSpeed: 0.65,
    breathPhase: 0.4,
    breathMin: 0.18,
    breathMax: 0.65,
    hueShift: -0.08,
    satBoost: 0.09,
    lightIntensity: 1.7,
  },
  {
    orbitRadius: 3.9,
    orbitSpeed: 0.14,
    phase: 5.5,
    tiltX: -0.5,
    tiltZ: 0.3,
    scale: 3.0,
    breathSpeed: 0.55,
    breathPhase: 5.0,
    breathMin: 0.2,
    breathMax: 0.7,
    hueShift: 0.11,
    satBoost: 0.16,
    lightIntensity: 1.4,
  },
  {
    orbitRadius: 4.3,
    orbitSpeed: 0.23,
    phase: 2.1,
    tiltX: 0.2,
    tiltZ: -0.8,
    scale: 1.8,
    breathSpeed: 1.0,
    breathPhase: 3.6,
    breathMin: 0.15,
    breathMax: 0.6,
    hueShift: -0.03,
    satBoost: 0.07,
    lightIntensity: 1.2,
  },
  {
    orbitRadius: 5.0,
    orbitSpeed: 0.09,
    phase: 4.7,
    tiltX: -0.7,
    tiltZ: 0.5,
    scale: 3.5,
    breathSpeed: 0.3,
    breathPhase: 1.5,
    breathMin: 0.1,
    breathMax: 0.5,
    hueShift: 0.06,
    satBoost: 0.13,
    lightIntensity: 1.9,
  },
];

function makeGlowTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const center = size / 2;
  const grad = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center,
  );
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.15, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.3)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new CanvasTexture(canvas);
}

// derive per-orb color: shift hue + boost saturation from base
function deriveOrbColor(
  base: Color,
  hueShift: number,
  satBoost: number,
): Color {
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);
  const col = new Color();
  col.setHSL(
    (hsl.h + hueShift + 1) % 1,
    Math.min(1, hsl.s + satBoost),
    Math.max(0.4, Math.min(0.85, hsl.l + 0.1)),
  );

  return col;
}

interface IProps {
  targetColor: number;
}

export const OrbitingOrbs = ({ targetColor }: IProps) => {
  const texture = useMemo(() => makeGlowTexture(), []);
  const baseColor = useRef(new Color(targetColor));
  const targetColorObj = useRef(new Color(targetColor));

  // sprites
  const sprites = useMemo(
    () =>
      ORBS.map((cfg) => {
        const mat = new SpriteMaterial({
          map: texture,
          color: deriveOrbColor(
            new Color(targetColor),
            cfg.hueShift,
            cfg.satBoost,
          ),
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
          opacity: cfg.breathMin,
        });
        const sprite = new Sprite(mat);
        sprite.scale.setScalar(cfg.scale);

        return sprite;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture],
  );

  // point lights
  const lights = useMemo(
    () =>
      ORBS.map((cfg) => {
        const light = new PointLight(
          deriveOrbColor(new Color(targetColor), cfg.hueShift, cfg.satBoost),
          0, // start off, breath drives intensity
          12, // distance
          2, // decay
        );

        return light;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(
    () => () => {
      sprites.forEach((s) => s.material.dispose());
    },
    [sprites],
  );

  useFrame((_, delta) => {
    const t = performance.now() / 1000;
    const { bass, rms, isPlaying } = audioData;

    // lerp base color
    targetColorObj.current.setHex(targetColor);
    baseColor.current.lerp(
      targetColorObj.current,
      1 - Math.pow(0.001, delta / 2),
    );

    sprites.forEach((sprite, i) => {
      const cfg = ORBS[i];
      const light = lights[i];
      const angle = cfg.phase + t * cfg.orbitSpeed;

      // elliptical orbit base position
      const x = Math.cos(angle) * cfg.orbitRadius;
      const y = Math.sin(angle) * cfg.orbitRadius * 0.35;
      const z = Math.sin(angle) * cfg.orbitRadius;

      // tilt orbit plane
      const cosX = Math.cos(cfg.tiltX),
        sinX = Math.sin(cfg.tiltX);
      const cosZ = Math.cos(cfg.tiltZ),
        sinZ = Math.sin(cfg.tiltZ);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      const x2 = x * cosZ - y1 * sinZ;
      const y2 = x * sinZ + y1 * cosZ;

      // ── low-freq micro-vibration ──
      // each orb vibrates at a unique high-freq noise using its index as seed
      const vibAmp = isPlaying ? bass * 0.024 : 0;
      const seed = i * 1.7321;
      const vx = Math.sin(t * 72.5 + seed) * vibAmp;
      const vy = Math.sin(t * 81.3 + seed + 1.1) * vibAmp * 0.6;
      const vz = Math.sin(t * 68.7 + seed + 2.3) * vibAmp;

      sprite.position.set(x2 + vx, y2 + vy, z1 + vz);
      light.position.set(x2 + vx, y2 + vy, z1 + vz);

      // depth factor
      const depthFactor = (z1 + cfg.orbitRadius) / (cfg.orbitRadius * 2);

      // breath
      const breath = (Math.sin(t * cfg.breathSpeed + cfg.breathPhase) + 1) / 2;
      const baseOpacity =
        cfg.breathMin + breath * (cfg.breathMax - cfg.breathMin);

      // ── rms → scale + opacity boost ──
      const rmsBoost = isPlaying ? rms * 1.4 : 0;

      const depthOpacity = 0.15 + depthFactor * 0.85;
      const depthScale = 0.5 + depthFactor * 0.5;

      sprite.material.opacity = Math.min(
        1,
        (baseOpacity + rmsBoost * 0.4) * depthOpacity,
      );
      sprite.scale.setScalar(cfg.scale * depthScale * (1 + rmsBoost * 0.2));

      light.intensity =
        (breath + rmsBoost * 0.6) *
        cfg.lightIntensity *
        Math.max(0, depthFactor * 2 - 0.5);

      const orbColor = deriveOrbColor(
        baseColor.current,
        cfg.hueShift,
        cfg.satBoost,
      );
      sprite.material.color.copy(orbColor);
      light.color.copy(orbColor);
    });
  });

  return (
    <>
      {sprites.map((sprite, i) => (
        <primitive key={`orb-${i}`} object={sprite} />
      ))}

      {lights.map((light, i) => (
        <primitive key={`light-${i}`} object={light} />
      ))}
    </>
  );
};
