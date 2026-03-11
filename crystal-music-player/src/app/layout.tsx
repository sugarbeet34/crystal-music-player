import { FC, PropsWithChildren } from 'react';

import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: '🔮 Crystal Music Player',
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logo-music.svg` },
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
