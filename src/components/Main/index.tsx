'use client';

import { FC, useRef, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { WebGPURenderer } from 'three/webgpu';

import { AudioUploader } from '../AudioUploader';
import { ColorPicker } from '../ColorPicker';
import { SciFiCursor } from '../SciFiCursor';
import { AudioReactive } from './AudioReactive';
import { ColorAnimator } from './ColorAnimator';
import fpsStyles from './fps.module.css';
import { FpsMeasurer } from './FpsMeasurer';
import { Scene } from './Scene';
import styles from './styles.module.css';
import { WebGPUPostProcessing } from './WebGPUPostProcessing';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';

const DEFAULT_COLOR = 0xeeeeff;

export const Main: FC = () => {
  const [frameloop, setFrameloop] = useState<'never' | 'always'>('never');
  const [activeColor, setActiveColor] = useState(DEFAULT_COLOR);
  const [showMs, setShowMs] = useState(false);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const msRef = useRef<HTMLSpanElement>(null);

  const audioControls = useAudioAnalyser();

  return (
    <div className={styles.scene}>
      <div
        className={`${fpsStyles.fpsPanel} ${showMs ? fpsStyles.fpsPanelMs : ''}`}
        onMouseEnter={() => setShowMs(true)}
        onMouseLeave={() => setShowMs(false)}
      >
        <span
          className={`${fpsStyles.fpsValue} ${showMs ? fpsStyles.fpsValueHidden : ''}`}
          ref={fpsRef}
        >--</span>
        <span
          className={`${fpsStyles.fpsValue} ${fpsStyles.msValue} ${showMs ? '' : fpsStyles.fpsValueHidden}`}
          ref={msRef}
        >--</span>
        <span className={fpsStyles.fpsLabel}>{showMs ? 'MS' : 'FPS'}</span>
      </div>

      <Canvas
        dpr={[0.8, 3]}
        gl={async ({ canvas }) => {
          const renderer = new WebGPURenderer({
            canvas: canvas as any,
            alpha: false,
            stencil: false,
            antialias: false,
          });

          renderer
            .init()
            .then(() => setFrameloop('always'))
            .catch(null);

          return renderer;
        }}
        camera={{ fov: 60 }}
        frameloop={frameloop}
      >
        <FpsMeasurer fpsRef={fpsRef} msRef={msRef} />

        <WebGPUPostProcessing />

        <AudioReactive />

        <ColorAnimator targetColor={activeColor} />

        <Scene activeColor={activeColor} />
      </Canvas>

      <AudioUploader controls={audioControls} />

      <ColorPicker onColorChange={setActiveColor} activeColor={activeColor} />

      <SciFiCursor />
    </div>
  );
};
