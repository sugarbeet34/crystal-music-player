import { FC, PropsWithChildren, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import { RapierRigidBody, RigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

import { audioReactiveState } from '@/store/audioReactiveState';

export const ModelRigidBody: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<RapierRigidBody>(null);
  const vec = useMemo(() => new Vector3(), []);
  const explodingFrames = useRef(0);

  useFrame(() => {
    const body = ref.current;
    if (!body) return;

    const pos = body.translation();
    const impulse = audioReactiveState.explosionImpulse;

    if (impulse > 0) {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      const len = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z) || 1;
      vec
        .set(pos.x / len, pos.y / len, pos.z / len)
        .multiplyScalar(impulse * 0.4);
      body.applyImpulse(vec, true);
      explodingFrames.current = 5; // fly freely for ~5 frames, then snap back
    }

    // low damping while exploding, high damping on return for quick snap-back
    const damping = explodingFrames.current > 0 ? 0.1 : 3.5;
    body.setLinearDamping(damping);
    if (explodingFrames.current > 0) explodingFrames.current--;

    // attraction toward center
    vec
      .set(pos.x, pos.y, pos.z)
      .negate()
      .multiplyScalar(audioReactiveState.attractForce);
    body.applyImpulse(vec, true);
  });

  return (
    <RigidBody
      ref={ref}
      lockRotations
      linearDamping={1}
      angularDamping={1}
      friction={1}
      restitution={0.5}
    >
      {children}
    </RigidBody>
  );
};
