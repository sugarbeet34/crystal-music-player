'use client';

import { useCallback, useRef, useState } from 'react';

import { audioData } from '@/store/audioStore';

// Smaller FFT = fewer bins to process, lower CPU cost
const FFT_SIZE = 512; // 256 bins, ~86 Hz per bin at 44100 Hz

// bin ranges for FFT_SIZE=512 (256 bins, ~172 Hz/bin)
const BASS_END = 3; // 0~516 Hz → kick/bass
const MID_END = 23; // ~3956 Hz → midrange

// throttle React state (progress bar) to this interval ms
const UI_UPDATE_MS = 250;

function getBandAverage(
  data: Uint8Array<ArrayBuffer>,
  start: number,
  end: number,
): number {
  let sum = 0;
  for (let i = start; i < end; i++) sum += data[i];

  return sum / ((end - start) * 255);
}

// Only use first 64 bins for RMS — enough signal, 4x cheaper
function getFastRMS(data: Uint8Array<ArrayBuffer>): number {
  let sum = 0;
  const len = Math.min(64, data.length);
  for (let i = 0; i < len; i++) {
    const v = data[i] / 255;
    sum += v * v;
  }

  return Math.sqrt(sum / len);
}

export interface AudioAnalyserControls {
  isPlaying: boolean;
  isLoaded: boolean;
  fileName: string;
  duration: number;
  currentTime: number;
  loadFile: (file: File) => Promise<void>;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

export function useAudioAnalyser(): AudioAnalyserControls {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const lastUiUpdateRef = useRef(0); // timestamp of last setCurrentTime call

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  const startLoop = useCallback(() => {
    const tick = (now: number) => {
      const analyser = analyserRef.current;
      const freqData = freqDataRef.current;
      const ctx = ctxRef.current;
      if (!analyser || !freqData || !ctx) return;

      analyser.getByteFrequencyData(freqData);

      // audio data — every frame, no React state
      audioData.bass = getBandAverage(freqData, 0, BASS_END);
      audioData.mid = getBandAverage(freqData, BASS_END, MID_END);
      audioData.treble = getBandAverage(
        freqData,
        MID_END,
        Math.min(128, freqData.length),
      );
      audioData.rms = getFastRMS(freqData);

      // progress bar — throttled to 250ms to avoid constant React re-renders
      if (now - lastUiUpdateRef.current >= UI_UPDATE_MS) {
        lastUiUpdateRef.current = now;
        const elapsed = ctx.currentTime - startTimeRef.current;
        setCurrentTime(
          Math.min(
            offsetRef.current + elapsed,
            bufferRef.current?.duration ?? 0,
          ),
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      const analyser = ctxRef.current.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.75;
      analyser.connect(ctxRef.current.destination);
      analyserRef.current = analyser;
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
  }, []);

  const loadFile = useCallback(
    async (file: File) => {
      ensureContext();
      const ctx = ctxRef.current!;

      stopLoop();
      sourceRef.current?.stop();
      sourceRef.current?.disconnect();
      sourceRef.current = null;
      offsetRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      audioData.isPlaying = false;

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      bufferRef.current = audioBuffer;
      setFileName(file.name.replace(/\.[^.]+$/, ''));
      setDuration(audioBuffer.duration);
      setIsLoaded(true);
    },
    [ensureContext, stopLoop],
  );

  const play = useCallback(() => {
    const ctx = ctxRef.current;
    const buffer = bufferRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !buffer || !analyser) return;

    if (ctx.state === 'suspended') ctx.resume();

    sourceRef.current?.stop();
    sourceRef.current?.disconnect();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    source.start(0, offsetRef.current);
    source.onended = () => {
      if (audioData.isPlaying) {
        offsetRef.current = 0;
        setCurrentTime(0);
        setIsPlaying(false);
        audioData.isPlaying = false;
        stopLoop();
      }
    };

    sourceRef.current = source;
    startTimeRef.current = ctx.currentTime;
    setIsPlaying(true);
    audioData.isPlaying = true;
    startLoop();
  }, [startLoop, stopLoop]);

  const pause = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    offsetRef.current += ctx.currentTime - startTimeRef.current;
    sourceRef.current?.stop();
    sourceRef.current?.disconnect();
    sourceRef.current = null;

    setIsPlaying(false);
    audioData.isPlaying = false;
    audioData.bass = audioData.mid = audioData.treble = audioData.rms = 0;
    stopLoop();
  }, [stopLoop]);

  const seek = useCallback(
    (time: number) => {
      const wasPlaying = isPlaying;
      if (wasPlaying) {
        sourceRef.current?.stop();
        sourceRef.current?.disconnect();
        stopLoop();
      }
      offsetRef.current = time;
      setCurrentTime(time);
      if (wasPlaying) play();
    },
    [isPlaying, play, stopLoop],
  );

  return {
    isPlaying,
    isLoaded,
    fileName,
    duration,
    currentTime,
    loadFile,
    play,
    pause,
    seek,
  };
}
