import { FC, useRef } from 'react';

import { Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Group, Vector3 } from 'three';

import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';
import { useScreenPositionDelta } from '@/hooks/useScreenPositionDelta';
import { useSpinControl } from '@/hooks/useSpinControl';

import { Model } from './Model';
import { OrbitingOrbs } from './OrbitingOrbs';
import { Pointer } from './Pointer';

const tilt = Math.PI * 0.3;

export const Scene: FC<{ activeColor: number }> = ({ activeColor }) => {
  const groupRef = useRef<Group>(null);

  useSpinControl(groupRef);

  const { iterateTarget: iteratePositionTarget } = useAnimatableVec3(
    ({ x, y }) => {
      const group = groupRef.current!;
      group.position.set(x, -y, 0);
    },
    0.02,
    0.1,
  );

  // X-tilt only (no Y — spin hook owns Y)
  const { iterateTarget: iterateTiltTarget } = useAnimatableVec3(
    ({ x, y }) => {
      const group = groupRef.current!;
      group.rotation.x = y * tilt;
      group.rotation.z = x * tilt * 0.3;
    },
    0.02,
    0.1,
  );

  useMouseMoveDelta(({ x, y }) => {
    iteratePositionTarget(new Vector3(x, y, 0));
    iterateTiltTarget(new Vector3(x, y, 0));
  });

  useScreenPositionDelta(({ x, y }) => {
    const strength = 5;
    iteratePositionTarget(new Vector3(-x * strength, -y * strength, 0));
    iterateTiltTarget(new Vector3(-x * strength, -y * strength, 0));
  });

  useDeviceOrientationDelta(({ gamma, beta }) => {
    const rs = 0.05;
    const ps = 0.075;
    iterateTiltTarget(new Vector3(gamma * rs, beta * rs, 0));
    iteratePositionTarget(new Vector3(gamma * ps, beta * ps, 0));
  });

  return (
    <>
      <Environment files="env/warehouse.hdr" environmentIntensity={1} />

      <OrbitingOrbs targetColor={activeColor} />

      <Physics gravity={[0, 0, 0]} colliders="hull">
        <group ref={groupRef} scale={1}>
          <Pointer />
          <Model />
        </group>
      </Physics>
    </>
  );
};
