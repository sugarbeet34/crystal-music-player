import { FC, PropsWithChildren } from 'react';

import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: '🔮 水晶音乐播放器',
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logo-music.svg` },
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="zh">
    <body>{children}</body>
  </html>
);

export default RootLayout;
