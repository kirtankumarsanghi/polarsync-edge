import React from 'react';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import ClientLayout from './ClientLayout';

export const viewport: Viewport = {
  themeColor: '#071018',
};

export const metadata: Metadata = {
  title: 'PolarSync Edge — Commander Energy Center',
  description: 'Antarctic Microgrid & Battery Energy Management System',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="text-polar-text selection:bg-polar-cyan/30">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
