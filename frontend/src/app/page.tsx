'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowDown, ChevronUp, Info, X, Menu } from 'lucide-react';
import { useVideoScrub } from '../hooks/useVideoScrub';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4';
const DARK = '#1D3045';

export default function CinematicLandingPage() {
  const { scrollProgress: p, canvasRef, videoRef, ready, painted, reverted } = useVideoScrub(VIDEO_URL);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  // Section Opacities based on scroll progress (p)
  const s1Opacity = p < 0.20 ? 1 : Math.max(0, 1 - (p - 0.20) / 0.08);
  
  let s2Opacity = 0;
  if (p >= 0.32 && p < 0.40) s2Opacity = (p - 0.32) / 0.08;
  else if (p >= 0.40 && p < 0.55) s2Opacity = 1;
  else if (p >= 0.55) s2Opacity = Math.max(0, 1 - (p - 0.55) / 0.08);

  let s3Opacity = 0;
  if (p >= 0.67 && p < 0.75) s3Opacity = (p - 0.67) / 0.08;
  else if (p >= 0.75) s3Opacity = 1;

  const isLightNav = p > 0.55;
  const navColor = isLightNav ? '#FFFFFF' : DARK;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://db.onlinewebfonts.com/c/95cecf452d3208890088a5b4c19c7ecf?family=Helvetica+Neue+ME');
        body {
          font-family: 'Helvetica Neue ME', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          overflow-x: clip;
          background-color: #000;
        }
        html { scroll-behavior: smooth; }
      `}} />

      {/* 500vh scroll track */}
      <div className="relative" style={{ height: '500vh' }}>
        
        {/* Sticky Inner Container */}
        <div className="sticky top-0 w-full h-screen overflow-hidden bg-black">
          
          {/* Fallback Poster (Ensures zero pitch-dark void) */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
            style={{ 
              backgroundImage: `url('/bg-mountain.png')`
            }}
          />

          {/* Background Video (Fallback if canvas not ready) */}
          <video
            ref={videoRef}
            src={VIDEO_URL}
            className="absolute inset-0 w-full h-full object-cover z-[1]"
            playsInline
            muted
            preload="auto"
          />

          {/* Canvas for smooth decoded frame drawing */}
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-[2]"
            style={{ opacity: (ready && painted) ? 1 : 0 }}
          />

          {/* Mountain Overlay to hide the ship scene in Section 3 */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none z-[3]"
            style={{ 
              backgroundImage: `url('/bg-mountain.png')`,
              opacity: s3Opacity,
              transition: 'opacity 0.1s ease-out'
            }}
          />

          {/* Overlay UI Container */}
          <div className="absolute inset-0 pointer-events-none z-[10]">
            
            {/* Navbar */}
            <nav className="absolute top-0 w-full px-6 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-6 flex items-center justify-between z-50 pointer-events-auto transition-colors duration-500" style={{ color: navColor }}>
              
              {/* Desktop Left Nav */}
              <div className="hidden lg:flex items-center gap-8 xl:gap-10">
                <div className="relative">
                  <Link href="/">
                    <span className="text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70 cursor-pointer">
                      PolarSync Edge
                    </span>
                  </Link>
                  <div className="absolute -bottom-3 left-0 w-full h-[2px] bg-current" />
                </div>
                {['Dashboard', 'Audit Logs', 'Terminal', 'Upstream'].map((item, i) => {
                  const href = item === 'Dashboard' ? '/dashboard' : item === 'Audit Logs' ? '/history' : item === 'Terminal' ? '/vectrus' : '/vectrus-upstream';
                  return (
                    <Link key={item} href={href}>
                      <span className="text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70 cursor-pointer transition-all duration-600 delay-[100ms]" style={{ transform: 'translateY(0)', opacity: 1 }}>
                        {item}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Hamburger */}
              <button className="lg:hidden flex flex-col gap-[5px] pointer-events-auto" onClick={() => setMenuOpen(true)}>
                <div className="h-[2px] w-6 transition-colors duration-500" style={{ backgroundColor: navColor }} />
                <div className="h-[2px] w-6 transition-colors duration-500" style={{ backgroundColor: navColor }} />
                <div className="h-[2px] w-4 transition-colors duration-500" style={{ backgroundColor: navColor }} />
              </button>

              {/* Right Cluster */}
              <div className="hidden sm:flex items-center gap-6">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setNewsOpen(true)}>
                  <span className="text-xs tracking-[0.2em] uppercase font-medium group-hover:opacity-70">News</span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: navColor }}>
                    <Info size={10} color={isLightNav ? DARK : '#FFFFFF'} />
                  </div>
                </div>
                <button onClick={() => setMenuOpen(true)} className="text-xs tracking-[0.2em] uppercase font-medium hover:opacity-70">
                  Menu
                </button>
              </div>
            </nav>

            {/* SECTION 1 - Hero */}
            <section 
              className="absolute inset-0 px-6 sm:px-8 md:px-20 lg:px-32 flex flex-col justify-center pointer-events-auto transition-opacity duration-100 ease-out"
              style={{ opacity: s1Opacity, zIndex: s1Opacity > 0.1 ? 10 : -1 }}
            >
              <div style={{ opacity: s1Opacity > 0.3 ? 1 : 0, transform: s1Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0ms' }}>
                <h1 className="text-[clamp(2rem,5vw,5rem)] font-light uppercase leading-[1.2]" style={{ color: DARK }}>
                  PolarSync Edge:<br/>Autonomous<br/>Energy Survival
                </h1>
              </div>
              <div style={{ opacity: s1Opacity > 0.3 ? 1 : 0, transform: s1Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 150ms' }}>
                <p className="mt-6 text-sm tracking-[0.3em] uppercase font-medium" style={{ color: '#1D304590' }}>
                  Sub-200ms Neural Forecasting & Microgrid Control
                </p>
              </div>
              <button 
                className="absolute bottom-12 right-6 sm:right-8 md:right-12 w-12 h-12 rounded-full border flex items-center justify-center hover:opacity-70 transition-all duration-300"
                style={{ borderColor: '#1D304580', opacity: s1Opacity > 0.3 ? 1 : 0, transform: s1Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 300ms' }}
                onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
              >
                <ArrowRight size={18} color={DARK} />
              </button>
            </section>

            {/* SECTION 2 - Center */}
            <section 
              className="absolute inset-0 px-6 sm:px-8 flex items-center justify-center pointer-events-auto transition-opacity duration-100 ease-out"
              style={{ opacity: s2Opacity, zIndex: s2Opacity > 0.1 ? 10 : -1 }}
            >
              <div className="max-w-[900px]">
                <h2 
                  className="text-[clamp(1.5rem,4.5vw,4.5rem)] font-extralight tracking-wide leading-[1.3] text-center uppercase"
                  style={{ color: DARK, opacity: s2Opacity > 0.3 ? 1 : 0, transform: s2Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0ms' }}
                >
                  We balance life-critical loads with <span style={{ color: '#1D3045CC' }}>precision and resilience</span> across the <span style={{ color: '#1D304580' }}>Antarctic frontier</span>
                </h2>
              </div>
              
              <div className="absolute bottom-16 right-6 sm:right-8 md:right-12 flex flex-col items-center gap-4">
                <button 
                  className="w-12 h-12 rounded-full border flex items-center justify-center transition-all"
                  style={{ borderColor: '#1D304566', opacity: s2Opacity > 0.3 ? 1 : 0, transform: s2Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 200ms' }}
                  onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
                >
                  <ArrowDown size={18} color={DARK} />
                </button>
                <div 
                  className="mt-4 flex flex-col gap-2"
                  style={{ opacity: s2Opacity > 0.3 ? 1 : 0, transform: s2Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 350ms' }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DARK }} />
                  <div className="w-[6px] h-[6px] rounded-full mx-auto" style={{ backgroundColor: '#1D304566' }} />
                  <div className="w-[6px] h-[6px] rounded-full mx-auto" style={{ backgroundColor: '#1D304566' }} />
                </div>
                <button 
                  className="mt-2 w-10 h-10 rounded-full border flex items-center justify-center transition-all"
                  style={{ borderColor: '#1D30454D', opacity: s2Opacity > 0.3 ? 1 : 0, transform: s2Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 500ms' }}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <ChevronUp size={16} color="#1D3045CC" />
                </button>
              </div>
            </section>

            {/* SECTION 3 - Ship Scene (Alternate Full Page Layout) */}
            <section 
              className="absolute inset-0 flex flex-col justify-between px-6 sm:px-8 md:px-20 lg:px-32 py-28 sm:py-32 pointer-events-none transition-opacity duration-100 ease-out"
              style={{ opacity: s3Opacity, zIndex: s3Opacity > 0.1 ? 10 : -1 }}
            >
              {/* Upper Narrative directly on the mountain */}
              <div className="pointer-events-auto max-w-4xl pt-2">
                <div 
                  className="flex flex-wrap items-center gap-3 text-xs tracking-[0.3em] uppercase font-semibold mb-4 opacity-90 text-white"
                  style={{ opacity: s3Opacity > 0.3 ? 1 : 0, transform: s3Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0ms' }}
                >
                  <span className="font-mono">69.4°S • 76.2°E</span>
                  <span className="w-4 h-[1.5px] bg-white opacity-40"></span>
                  <span>LARSEMANN HILLS // BHARATI STATION</span>
                </div>
                <h2 
                  className="text-[clamp(2.2rem,4.8vw,4.8rem)] font-light uppercase leading-[1.12] tracking-tight max-w-3xl text-white"
                  style={{ opacity: s3Opacity > 0.3 ? 1 : 0, transform: s3Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 150ms' }}
                >
                  Autonomous Polar Station Networks
                </h2>
                <p 
                  className="mt-6 text-sm sm:text-base tracking-[0.18em] uppercase font-medium max-w-2xl leading-relaxed text-white/90"
                  style={{ opacity: s3Opacity > 0.3 ? 1 : 0, transform: s3Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 300ms' }}
                >
                  Zero-emission remote observational stations powered by alpine wind turbines and high-density thermal storage. Real-time telemetry linked with international polar climate research initiatives.
                </p>
              </div>

              {/* Lower Telemetry & Navigation */}
              <div 
                className="pointer-events-auto pb-4 text-white"
                style={{ opacity: s3Opacity > 0.3 ? 1 : 0, transform: s3Opacity > 0.3 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 450ms' }}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 border-t border-white/25 pt-6 sm:pt-8 mb-8">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-light font-mono tracking-tight">99.8%</span>
                    <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-semibold opacity-75 mt-1">Telemetry Uptime</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-light font-mono tracking-tight">0.00 kg</span>
                    <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-semibold opacity-75 mt-1">Surface Impact</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-light font-mono tracking-tight">Larsemann</span>
                    <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-semibold opacity-75 mt-1">Deployment Range</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-light font-mono tracking-tight">Real-Time</span>
                    <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-semibold opacity-75 mt-1">Polar Telemetry</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Link href="/dashboard" className="text-xs tracking-[0.24em] uppercase font-semibold hover:opacity-75 transition-opacity flex items-center gap-2 group">
                    <span>Enter Commander Dashboard</span>
                    <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 text-xs tracking-[0.22em] uppercase font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Autonomous Grid Feed</span>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Mobile Menu Overlay */}
          <div 
            className={`absolute inset-0 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            style={{ backgroundColor: DARK }}
          >
            <div className={`w-full h-full flex flex-col transition-transform duration-500 ${menuOpen ? 'translate-y-0' : '-translate-y-8'}`}>
              <div className="flex justify-end px-6 sm:px-8 pt-8 sm:pt-12">
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white transition-colors text-white"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 gap-2">
                {['PolarSync Edge', 'Dashboard', 'Audit Logs', 'Terminal', 'Upstream'].map((item, i) => {
                  const href = item === 'PolarSync Edge' ? '/' : item === 'Dashboard' ? '/dashboard' : item === 'Audit Logs' ? '/history' : item === 'Terminal' ? '/vectrus' : '/vectrus-upstream';
                  return (
                    <div 
                      key={item} 
                      className="py-3"
                      style={{ 
                        opacity: menuOpen ? 1 : 0, 
                        transform: menuOpen ? 'translateY(0)' : 'translateY(20px)', 
                        transition: `all 0.5s ease ${i * 60}ms` 
                      }}
                    >
                      <Link href={href} onClick={() => setMenuOpen(false)}>
                        <span className={`text-2xl sm:text-3xl font-light tracking-wide uppercase ${i === 0 ? 'text-white' : 'text-white/60 hover:text-white transition-colors'}`}>
                          {item}
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="px-8 sm:px-12 pb-10 flex gap-8">
                <span 
                  className="text-xs tracking-[0.2em] uppercase text-white/60 cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    setNewsOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  News
                </span>
                <span className="text-xs tracking-[0.2em] uppercase text-white/60 cursor-pointer hover:text-white transition-colors">Contact</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* When menu is open, prevent body scroll */}
      {menuOpen && (
        <style dangerouslySetInnerHTML={{ __html: `body { overflow: hidden !important; }` }} />
      )}

      {/* News Modal */}
      <div 
        className={`fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 transition-opacity duration-300 ${
          newsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`bg-white text-[#112233] max-w-lg w-full rounded-2xl p-8 sm:p-10 shadow-2xl relative border border-slate-100 transition-transform duration-300 ${
            newsOpen ? 'scale-100' : 'scale-95'
          }`}
        >
          <button 
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors"
            onClick={() => setNewsOpen(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          <h3 className="text-2xl font-light uppercase tracking-wider mb-6">
            PolarSync Edge News
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-2">
                January 2027
              </div>
              <p className="text-sm leading-relaxed">
                <strong>Antarctic Field Deployment:</strong> PolarSync Edge autonomous microgrid systems successfully deployed at Bharati Station, demonstrating 99.8% uptime in extreme polar conditions with sub-200ms forecasting accuracy.
              </p>
            </div>
            
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-2">
                December 2026
              </div>
              <p className="text-sm leading-relaxed">
                <strong>Alpine Wind Integration:</strong> TAWF-01 aerodynamic wing kite system achieved 1.2MW continuous harvest at 3,420m elevation in Engadin Alps, validating high-altitude kinetic energy capture for remote installations.
              </p>
            </div>
            
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-2">
                November 2026
              </div>
              <p className="text-sm leading-relaxed">
                <strong>Neural Forecasting Milestone:</strong> LSTM-based demand prediction models now operating with 94.6% efficiency across distributed polar research networks, enabling predictive load balancing for critical life-support systems.
              </p>
            </div>
          </div>
          
          <button 
            className="text-xs tracking-[0.2em] uppercase font-bold text-slate-900 hover:opacity-70 transition-opacity mt-8"
            onClick={() => setNewsOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
