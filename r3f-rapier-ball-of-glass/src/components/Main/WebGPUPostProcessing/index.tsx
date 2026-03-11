import { useEffect, useRef } from 'react';

import { useThree, useFrame } from '@react-three/fiber';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { pass, uniform } from 'three/tsl';
import { PostProcessing } from 'three/webgpu';

import { audioReactiveState } from '@/store/audioReactiveState';

export const bloomUniforms = {
  strength:  uniform(0.1),
  radius:    uniform(0.5),
  threshold: uniform(0.5),
};

export const WebGPUPostProcessing = () => {
  const { gl: renderer, scene, camera } = useThree();
  const postProcessingRef = useRef<PostProcessing>(null);

  useEffect(() => {
    if (!renderer || !scene || !camera) return undefined;

    const postProcessing = new PostProcessing(renderer as any);
    postProcessingRef.current = postProcessing;

    const scenePass      = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');

    const bloomPass      = bloom(scenePassColor);
    bloomPass.strength   = bloomUniforms.strength;
    bloomPass.radius     = bloomUniforms.radius;
    bloomPass.threshold  = bloomUniforms.threshold;

    postProcessing.outputNode = scenePassColor.add(bloomPass);

    return () => { postProcessing.dispose(); };
  }, [renderer, scene, camera]);

  useFrame(() => {
    // update bloom strength from audio reactive state
    bloomUniforms.strength.value = audioReactiveState.bloomStrength;
    postProcessingRef.current?.render();
  }, 1);

  return null;
};
