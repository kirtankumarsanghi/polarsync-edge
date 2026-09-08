'use client';

import React, { useEffect } from 'react';
import { initSocket } from '../lib/socket';
import { useStore } from '../store/useStore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Radio, Activity, History, LayoutDashboard, ArrowLeft } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, telemetry } = useStore();

  useEffect(() => {
    // Initialize 5s WebSocket stream to local edge backend
    initSocket();
  }, []);

  return (
    <div className={`min-h-screen ${pathname === '/' || pathname?.startsWith('/vectrus') ? '' : 'bg-polar-bg'} ${pathname === '/' ? 'bg-[#071018]' : ''} flex flex-col ${pathname === '/' ? '' : 'overflow-hidden'} max-w-full w-full`}>
      {/* Polar Station Top Bar */}
      {pathname !== '/' && !pathname?.startsWith('/vectrus') && (
        <header className="border-b border-polar-line/70 bg-polar-panel/90 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo and Station Details */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()} 
                className="mr-2 p-1.5 sm:p-2 rounded-lg bg-polar-panel2 border border-polar-line hover:bg-polar-panel transition-colors flex items-center justify-center text-polar-muted hover:text-white group shadow-sm"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-polar-cyan to-polar-blue flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-polar-cyan/20">
                P
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">PolarSync Edge</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-polar-cyan/10 text-polar-cyan border border-polar-cyan/30 font-bold uppercase tracking-wider">
                    v1.0 Air-Gapped
                  </span>
                </div>
                <div className="text-[11px] text-polar-muted flex items-center gap-2">
                  <span>NCPOR Bharati Station, Larsemann Hills</span>
                  <span>•</span>
                  <span>{telemetry.ambient_temp_c}°C Ambient</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 bg-polar-panel2 p-1 rounded-xl border border-polar-line">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-polar-muted hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Live Command Grid
              </Link>
              <Link
                href="/history"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/history'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-polar-muted hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Audit Logs
              </Link>
            </nav>

            {/* Live Socket Connectivity Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-polar-line bg-polar-bg/80 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-polar-green animate-pulse' : 'bg-polar-cyan'
                  }`}
                />
                <span className="font-medium text-polar-muted">
                  {isConnected ? 'Telemetry 5s Live' : 'Offline PWA Cache'}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={pathname === '/' || pathname?.startsWith('/vectrus') ? "w-full max-w-full" : "flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6"}>
        <div key={pathname} className="page-transition-enter w-full h-full">
          {children}
        </div>
      </main>

      {/* Station Safety Interlock Footer */}
      {pathname !== '/' && !pathname?.startsWith('/vectrus') && (
        <footer className="border-t border-polar-line/40 bg-polar-bg py-4 text-center text-xs text-polar-muted">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-polar-cyan" />
              <span>
                <b>Human-in-the-Loop Interlock:</b> AI recommends actions. Station Commander authorizes switching. Tier-1 life-safety circuits never auto-shed.
              </span>
            </div>
            <span>PolarSync Edge Microgrid • Smart India Hackathon 2026</span>
          </div>
        </footer>
      )}
    </div>
  );
}
