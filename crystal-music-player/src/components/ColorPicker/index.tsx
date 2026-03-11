'use client';

import { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { COLORS } from '@/store/colors';

import styles from './styles.module.css';

interface IProps {
  onColorChange: (color: number) => void;
  activeColor: number;
}

export const ColorPicker: FC<IProps> = ({ onColorChange, activeColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorPos, setIndicatorPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const activeIndex = COLORS.findIndex((c) => c.value === activeColor);

  const measure = () => {
    const container = containerRef.current;
    const button = buttonRefs.current[activeIndex];
    if (!container || !button) return;

    const cr = container.getBoundingClientRect();
    const br = button.getBoundingClientRect();

    setIndicatorPos({
      x: br.left - cr.left + br.width / 2,
      y: br.top - cr.top + br.height / 2,
    });
  };

  // 首次挂载同步测量，避免闪烁
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(measure, []);
  // activeIndex 变化时更新位置（触发 CSS transition）
  useEffect(measure, [activeIndex]);

  return (
    <div ref={containerRef} className={styles.picker}>
      {indicatorPos && (
        <div
          className={styles.indicatorWrapper}
          style={{ left: indicatorPos.x, top: indicatorPos.y }}
        >
          <div className={styles.indicator} />
        </div>
      )}

      {COLORS.map((c, i) => (
        <button
          key={c.value}
          ref={(el) => {
            buttonRefs.current[i] = el;
          }}
          type="button"
          className={styles.dot}
          style={{ background: c.display }}
          title={c.label}
          onClick={() => onColorChange(c.value)}
        />
      ))}
    </div>
  );
};
