'use client';

import { FC, useCallback, useRef, useState } from 'react';

import { AudioAnalyserControls } from '@/hooks/useAudioAnalyser';

import styles from './styles.module.css';

interface IProps {
  controls: AudioAnalyserControls;
}

const DEMOS = [
  { label: 'R&B · Lofi', file: '/music/R&B小调-Lofi.mp3' },
  { label: 'Jazz · Joyfully', file: '/music/Jazz-Joyfully.mp3' },
];

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const PlayIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M6 4l14 8-14 8V4z" fill="currentColor" />
  </svg>
);

const PauseIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <rect x="5" y="4" width="4" height="16" rx="1" fill="currentColor" />
    <rect x="15" y="4" width="4" height="16" rx="1" fill="currentColor" />
  </svg>
);

export const AudioUploader: FC<IProps> = ({ controls }) => {
  const { isPlaying, isLoaded, fileName, duration, currentTime, loadFile, play, pause, seek } = controls;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [activeDemo, setActiveDemo] = useState<number | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) return;
    setActiveDemo(null);
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

  const loadDemo = async (index: number) => {
    if (loadingIndex !== null) return;
    setLoadingIndex(index);
    try {
      const res = await fetch(DEMOS[index].file);
      const blob = await res.blob();
      const file = new File([blob], DEMOS[index].label + '.mp3', { type: 'audio/mpeg' });
      setActiveDemo(index);
      await loadFile(file);
      play();
    } finally {
      setLoadingIndex(null);
    }
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

      <div className={styles.panel}>
        {/* ── expandable content (hover to reveal) ── */}
        <div className={styles.expandBody}>
          <div className={styles.scanLines} />

          {/* demo tracks section */}
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>DEMO TRACKS</span>
            <span className={styles.sectionDesc}>2 首预置曲目 · 点击播放</span>
          </div>

          <div className={styles.trackList}>
            {DEMOS.map((demo, i) => {
              const isActive = activeDemo === i && isLoaded;
              const isLoading = loadingIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.trackBtn} ${isActive ? styles.trackBtnActive : ''}`}
                  onClick={() => loadDemo(i)}
                  disabled={isLoading}
                >
                  <span className={styles.trackIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.trackName}>{demo.label}</span>
                  {isLoading && <span className={styles.trackLoading}>···</span>}
                  {isActive && !isLoading && <span className={styles.trackActiveBar} />}
                </button>
              );
            })}
          </div>

          {/* divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>OR UPLOAD</span>
            <span className={styles.dividerLine} />
          </div>

          {/* upload section */}
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>YOUR TRACK</span>
            <span className={styles.sectionDesc}>MP3 · WAV · FLAC · AAC · M4A · MP4</span>
          </div>

          <div
            className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
          >
            <span className={styles.uploadIcon}>⬆</span>
            <span className={styles.uploadHint}>拖入文件 / 点击选择</span>
          </div>
        </div>

        {/* ── mini bar (always visible) ── */}
        <div className={styles.miniBar}>
          {isLoaded ? (
            <div className={styles.miniPlayer}>
              <button type="button" className={styles.miniPlayBtn} onClick={isPlaying ? pause : play}>
                {isPlaying ? <PauseIcon className={styles.miniIcon} /> : <PlayIcon className={styles.miniIcon} />}
              </button>
              <span className={styles.miniName} title={fileName}>{fileName}</span>
              <div className={styles.miniTrack} onClick={onProgressClick}>
                <div className={styles.miniFill} style={{ width: `${progress * 100}%` }} />
                <div className={styles.miniThumb} style={{ left: `${progress * 100}%` }} />
              </div>
              <span className={styles.miniTime}>
                {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
              </span>
            </div>
          ) : (
            <div className={styles.miniHint}>
              <span className={styles.miniHintText}>♫ &nbsp;CRYSTAL MUSIC PLAYER</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
