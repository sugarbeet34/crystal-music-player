'use client';

import { FC, useCallback, useRef, useState } from 'react';

import { AudioAnalyserControls } from '@/hooks/useAudioAnalyser';

import styles from './styles.module.css';

interface IProps {
  controls: AudioAnalyserControls;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export const AudioUploader: FC<IProps> = ({ controls }) => {
  const { isPlaying, isLoaded, fileName, duration, currentTime, loadFile, play, pause, seek } = controls;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) return;
    loadFile(file);
  }, [loadFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration);
  };

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/mp4"
        className={styles.hiddenInput}
        onChange={onInputChange}
      />

      {!isLoaded ? (
        /* ── upload zone ── */
        <div
          className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <span className={styles.uploadIcon}>♫</span>
          <span className={styles.uploadHint}>拖入或点击上传音频</span>
        </div>
      ) : (
        /* ── player ── */
        <div className={styles.player}>
          {/* play/pause */}
          <button
            type="button"
            className={styles.playBtn}
            onClick={isPlaying ? pause : play}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" className={styles.icon}>
                <rect x="5" y="4" width="4" height="16" rx="1" fill="currentColor" />
                <rect x="15" y="4" width="4" height="16" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className={styles.icon}>
                <path d="M6 4l14 8-14 8V4z" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* time + track + change file */}
          <div className={styles.progressArea}>
            <div className={styles.timeRow}>
              <span className={styles.time}>{formatTime(currentTime)}</span>
              <span
                className={styles.fileName}
                title={fileName}
                onClick={() => inputRef.current?.click()}
              >
                {fileName}
              </span>
              <span className={styles.time}>{formatTime(duration)}</span>
            </div>

            <div className={styles.progressTrack} onClick={onProgressClick}>
              <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
              <div className={styles.progressThumb} style={{ left: `${progress * 100}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
