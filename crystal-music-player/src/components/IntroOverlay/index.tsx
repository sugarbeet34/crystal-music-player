'use client';

import { CSSProperties, useState } from 'react';

import Image from 'next/image';

import { COLORS } from '@/store/colors';

import styles from './styles.module.css';

const INTERACTIONS = [
  {
    signal: '⬡  鼠标拖拽',
    target: '水晶球自转方向 & 速度',
    desc: '拖拽产生惯性，松手后缓慢衰减回自动旋转',
  },
  {
    signal: '⬡  鼠标移动',
    target: '破碎冲量方向',
    desc: '鼠标位置影响碎片飞散的方向与范围',
  },
  {
    signal: '⬡  低频 Bass',
    target: '碎片爆炸冲量',
    desc: '强低音瞬间触发爆炸，0.1s 节流，冲量随音量线性放大',
  },
  {
    signal: '⬡  整体响度 RMS',
    target: '泛光强度 · 光斑尺寸',
    desc: '实时计算 64-bin 均方根，映射至 Bloom strength',
  },
  {
    signal: '⬡  高频 Treble',
    target: '材质色相偏移 · 光散射',
    desc: '音调越高色调越冷（向青蓝偏移），散射系数同步上升',
  },
  {
    signal: '⬡  低频 Bass',
    target: '光斑微振动',
    desc: '低频驱动 12 个环绕光斑在当前位置快速微震',
  },
  {
    signal: '⬡  播放 / 暂停',
    target: '自转速度 · 物理阻尼',
    desc: '暂停后球体缓慢减速静止，播放后重新拾速',
  },
  {
    signal: '⬡  自定义上传',
    target: '全量音频系数',
    desc: '支持 MP3 · WAV · FLAC · AAC · M4A · MP4，Web Audio API 实时解析',
  },
];

interface IProps {
  onColorChange: (color: number) => void;
  activeColor: number;
}

export const IntroOverlay = ({ onColorChange, activeColor }: IProps) => {
  const [open, setOpen] = useState(false);

  const activeIdx = COLORS.findIndex((c) => c.value === activeColor);
  const activeMood = activeIdx >= 0 ? COLORS[activeIdx].mood : '';

  return (
    <>
      {/* trigger button */}
      <button
        type="button"
        className={styles.triggerBtn}
        onClick={() => setOpen(true)}
        title="Website Intro"
      >
        <Image
          src="/logo-music.svg"
          alt="music"
          width={18}
          height={18}
          className={styles.triggerIcon}
        />

        <span className={styles.triggerLabel}>INTRO</span>
      </button>

      {/* overlay */}
      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}>
        {/* close */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setOpen(false)}
        >
          <span className={styles.closeLine} />

          <span className={styles.closeLine} />
        </button>

        {/* panel */}
        <div className={styles.panel}>
          <div className={styles.scanLines} />

          {/* header */}
          <div className={styles.header}>
            <Image
              src="/logo-music.svg"
              alt="logo"
              width={28}
              height={28}
              className={styles.headerIcon}
            />

            <div>
              <div className={styles.title}>CRYSTAL MUSIC PLAYER</div>

              <div className={styles.subtitle}>实时音频驱动的三维交互体验</div>
            </div>
          </div>

          <div className={styles.divider} />

          {/* description */}
          <p className={styles.desc}>
            上传任意音频，Web Audio API 实时解析&nbsp;
            <span className={styles.highlight}>低频 · 中频 · 高频 · 响度</span>
            &nbsp; 四维信号，通过物理引擎、光照系统与材质参数，
            将声音的每一个瞬间实体化为视觉动画。
          </p>

          {/* color picker section */}
          <div className={styles.colorSection}>
            <div className={styles.colorSectionHeader}>
              <span className={styles.colorSectionLabel}>ATMOSPHERE</span>

              <span className={styles.colorSectionDivider} />

              <span className={styles.colorSectionMood}>{activeMood}</span>
            </div>

            <div className={styles.colorGrid}>
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`${styles.colorCard} ${activeColor === c.value ? styles.colorCardActive : ''}`}
                  onClick={() => onColorChange(c.value)}
                >
                  <span
                    className={styles.colorSwatch}
                    style={{ background: c.display }}
                  />

                  <span className={styles.colorLabel}>{c.label}</span>

                  <span className={styles.colorMood}>{c.mood}</span>

                  {activeColor === c.value && (
                    <span className={styles.colorActiveBar} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          {/* table */}
          <div className={styles.tableWrap}>
            <div className={styles.tableHead}>
              <span>INPUT SIGNAL</span>

              <span>MAPPED TARGET</span>

              <span>BEHAVIOR</span>
            </div>

            {INTERACTIONS.map((row, i) => (
              <div
                key={i}
                className={styles.tableRow}
                style={{ '--i': i } as CSSProperties}
              >
                <span className={styles.cellSignal}>{row.signal}</span>

                <span className={styles.cellTarget}>{row.target}</span>

                <span className={styles.cellDesc}>{row.desc}</span>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <span className={styles.footerText}>
              POWERED BY &nbsp;THREE.JS · RAPIER · WEB AUDIO API · NEXT.JS
            </span>

            <span className={styles.footerAuthor}>authored by joycetong</span>
          </div>
        </div>
      </div>
    </>
  );
};
