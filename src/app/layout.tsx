import { FC, PropsWithChildren } from 'react';

import { Manrope } from 'next/font/google';

import type { Metadata } from 'next';

import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '🔮 Crystal Music Player',
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="en" className={manrope.className}>
    <body>
      {children}
    </body>
  </html>
);

export default RootLayout;
