'use client';

import { FC } from 'react';

import { useDeviceOrientationGranted } from '@/hooks/useDeviceOrientationGranted';

import styles from './styles.module.css';

export const DeviceOrientationButton: FC = () => {
  const { request, needsPermission } = useDeviceOrientationGranted();

  if (!needsPermission) {
    return null;
  }

  return (
    <button type="button" className={styles.button} onClick={request}>
      启用设备运动控制
    </button>
  );
};
