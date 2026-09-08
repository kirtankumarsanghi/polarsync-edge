'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function VectrusUpstreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navTabs = [
    { label: 'Polar SCADA', path: '/dashboard', key: 'polar-scada' },
    { label: 'Upstream Kinetic', path: '/vectrus-upstream', key: 'upstream-kinetic' },
    { label: 'Markets Arbitrage', path: '/vectrus', key: 'markets-arbitrage' },
  ];

  const sidebarItems = [
    { icon: 'grid_view', path: '/dashboard', title: 'Microgrid Core', key: 'polar-scada' },
    { icon: 'air', path: '/vectrus-upstream', title: 'Airborne & Tethered Sensors', key: 'upstream-kinetic' },
    { icon: 'candlestick_chart', path: '/vectrus', title: 'Trading & Interties', key: 'markets-arbitrage' },
    { icon: 'warning', path: '#', title: 'Alarm Interlocks', key: 'alarm-matrix' },
  ];

  const isActive = (itemPath: string) => pathname === itemPath;

  return (
    <>
      {/* Global Full-Screen Mountain Background */}
      <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#0a0f1a] via-[#0d1420] to-[#050a12]"></div>
        <div 
          className="absolute inset-0 w-full h-full bg-mountain-enter"
          style={{ 
            backgroundImage: 'url(/bg-mountain.png)',
            backgroundPosition: 'center bottom',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-[#050a12]/70 via-transparent to-transparent"></div>
      </div>

      <div className="min-h-screen text-on-surface select-none relative z-10">
        {/* Fixed Top Header */}
      <header className="fixed top-0 left-0 right-0 h-10 z-50 bg-surface-container-low/95 backdrop-blur-sm shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between px-space-md">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs">
            <div className="w-5 h-5 bg-primary-container flex items-center justify-center rounded">
              <span className="material-symbols-outlined text-tertiary-fixed text-[14px]">bolt</span>
            </div>
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface uppercase">Vectrus OS</span>
            <span className="px-space-xs py-space-2xs bg-surface-container-high rounded font-label-code text-label-code text-on-surface-variant uppercase">v3.4.2 Cockpit</span>
          </div>
          <div className="h-4 w-px bg-surface-container-high" />
          <nav className="flex items-center gap-space-2xs">
            {navTabs.map((tab) => (
              <Link
                key={tab.key}
                href={tab.path}
                className={`px-space-sm py-space-2xs font-label-code text-label-code uppercase transition-colors ${
                  isActive(tab.path)
                    ? 'bg-primary-container text-on-primary rounded'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container rounded">
            <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse" />
            <span className="font-label-code text-label-code text-on-tertiary-container uppercase">Interconnect Sync: 9ms // Nominal</span>
          </div>
          <div className="font-telemetry-data text-telemetry-data text-on-surface-variant tracking-wider">
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })} UTC
          </div>
          <div className="px-space-xs py-space-2xs bg-surface-container-high rounded font-label-code text-label-code text-on-surface-variant">0 ANOMALIES</div>
          <div className="flex items-center gap-space-2xs">
            <button className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded" type="button">
              <span className="material-symbols-outlined text-[16px]">file_download</span>
            </button>
            <button className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded" type="button">
              <span className="material-symbols-outlined text-[16px]">terminal</span>
            </button>
            <button className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded" type="button">
              <span className="material-symbols-outlined text-[16px]">tune</span>
            </button>
          </div>
          <div className="w-6 h-6 rounded bg-primary-container flex items-center justify-center">
            <span className="font-label-code text-micro-caption text-on-primary font-bold">OP</span>
          </div>
        </div>
      </header>

      {/* Fixed Left Sidebar */}
      <aside className="fixed left-0 top-10 bottom-8 w-12 z-40 bg-surface-container-low/95 backdrop-blur-sm shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col items-center py-space-sm gap-space-sm">
        <nav className="flex flex-col gap-space-xs w-full px-space-2xs">
          {sidebarItems.map((item) => (
            <Link
              key={item.key}
              href={item.path}
              title={item.title}
              className={`w-8 h-8 mx-auto flex items-center justify-center rounded transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-container text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-space-xs">
          <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" type="button">
            <span className="material-symbols-outlined text-[18px]">help_center</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-12 pb-8">
        <main className="w-full pt-10 min-h-screen">
          {children}
        </main>
      </div>

      {/* Fixed Bottom Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 z-50 bg-surface-container-low/95 backdrop-blur-sm shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between px-space-md">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container" />
            <span className="font-label-code text-label-code text-on-surface-variant uppercase">Cycle: 50.02 Hz // Dispatch Engine: Online</span>
          </div>
          <div className="h-3 w-px bg-surface-container-high" />
          <div className="font-terminal-stream text-terminal-stream text-on-surface-variant truncate max-w-2xl">
            [21:54:09.814] [UPSTREAM-K1] Tether kinematic loop stable. Harvest yield +18.4% vs baseline.
          </div>
        </div>
        <div className="flex items-center gap-space-sm">
          <div className="font-label-code text-micro-caption text-on-surface-variant uppercase">Buffer: 2.4 MB/s</div>
          <button className="flex items-center gap-space-2xs px-space-xs py-space-2xs hover:bg-surface-container rounded font-label-code text-label-code text-on-surface-variant hover:text-on-surface transition-colors" type="button">
            <span className="material-symbols-outlined text-[14px]">keyboard_arrow_up</span>
            <span>Logs</span>
          </button>
        </div>
      </footer>
      </div>
    </>
  );
}
