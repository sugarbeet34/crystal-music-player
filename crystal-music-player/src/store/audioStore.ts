/**
 * Global audio data shared between the analyser hook and the Canvas reactive component.
 * Using a plain object with refs avoids React re-renders on every audio frame.
 */
export interface AudioData {
  bass: number;      // 0~1, sub-bass + bass frequencies (20~250 Hz)
  mid: number;       // 0~1, midrange frequencies (250~4000 Hz)
  treble: number;    // 0~1, high frequencies (4000~20000 Hz)
  rms: number;       // 0~1, overall loudness
  isPlaying: boolean;
}

export const audioData: AudioData = {
  bass: 0,
  mid: 0,
  treble: 0,
  rms: 0,
  isPlaying: false,
};
