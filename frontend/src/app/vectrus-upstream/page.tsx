'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';

export default function VectrusUpstream() {
  const router = useRouter();
  const [sector, setSector] = useState('ENGADIN');
  const [tensionLimit, setTensionLimit] = useState(52);
  const [gridDispatch, setGridDispatch] = useState(1.8);
  const [cryoDispatch, setCryoDispatch] = useState(450);
  const [bessDispatch, setBessDispatch] = useState(200);

  const [simulatingGust, setSimulatingGust] = useState(false);
  const [loopOptimizing, setLoopOptimizing] = useState(false);
  const [flightLoopActive, setFlightLoopActive] = useState(true);
  const [toast, setToast] = useState({ visible: false, text: '' });

  // Fetch real telemetry for wind/weather data
  const { telemetry, weather, connected } = useTelemetry(5000);

  // Calculate dynamic values from real telemetry
  const liveWindSpeed = weather ? Math.round(weather.wind_kph * 0.8) : 118; // Convert to alpine jet speed
  const liveHarvestYield = telemetry ? (telemetry.solar_kw * 0.065).toFixed(2) : '2.45'; // MW/h from solar
  const liveTemp = weather ? weather.temp_c.toFixed(1) : '-4.2';

  const showToast = (text: string) => {
    setToast({ visible: true, text });
    setTimeout(() => setToast({ visible: false, text: '' }), 3500);
  };

  // Computed telemetry
  const sectorData = {
    ENGADIN: { elev: '3,420 m', rho: '0.88 kg/m³', pamb: '67.2 kPa', wind: '118 km/h NW Laminar' },
    MONT_BLANC: { elev: '4,100 m', rho: '0.81 kg/m³', pamb: '60.4 kPa', wind: '134 km/h WNW Jet' },
    MATTERHORN: { elev: '3,150 m', rho: '0.91 kg/m³', pamb: '69.8 kPa', wind: '94 km/h NNW Gusts' }
  };
  const currentSector = sectorData[sector as keyof typeof sectorData];

  const simulateWindGust = () => {
    setSimulatingGust(true);
    showToast('⚠️ Simulating 65kt katabatic gust: Auto-trim engaging wing pitch control...');
    setTimeout(() => {
      setSimulatingGust(false);
      showToast('✓ Gust stabilized. Wing trim nominal at 8.2° AoA.');
    }, 3200);
  };

  const optimizeFigure8 = () => {
    setLoopOptimizing(true);
    showToast('AI trajectory optimizer calculating crosswind sweep path...');
    setTimeout(() => {
      setLoopOptimizing(false);
      showToast('✓ Trajectory optimized! Estimated yield increase: +12.4% from Betz coefficient tuning.');
    }, 1500);
  };

  const triggerManualReel = () => {
    showToast('⚙️ MANUAL REEL OVERRIDE: Winch drum engaging at 8.4 m/s reel-in velocity.');
  };
  
  const pulseDeice = () => {
    showToast('❄️ DE-ICE PULSE: 480V RF excitation delivered to wing leading edge. Ice shedding cycle active.');
  };
  
  const armSpoolLock = () => {
    showToast('🔒 SPOOL LOCK ARMED: Hydro-mechanical dog brake engaged. Winch drum secured.');
  };
  
  const emergencyRetract = () => {
    if (confirm('⚠️ CRITICAL: Initiate high-speed 22 m/s winch emergency descent for TAWF-01?')) {
      showToast('🚨 EMERGENCY DESCENT INITIATED: Rapid winch retract active. Airspace clearance requested.');
    }
  };
  
  const exportFlightLogs = () => {
    showToast('📊 KINETIC FLIGHT LOG EXPORT: Compiling 84,200 telemetry samples to JSON archive...');
  };

  return (
    <div className="font-body-md text-on-surface select-none relative w-full max-w-full min-h-screen" style={{ background: '#0a0f1a' }}>
      
      {/* Subtle background overlay for better readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0a0f1a] via-[#0d1420] to-[#050a12] opacity-95"></div>
      
      {/* Content wrapper with higher z-index */}
      <div className="relative z-10">
      
      {/* Toast Notification */}
      <div className={`fixed top-20 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-3 px-4 py-3 bg-[#112233] text-white text-xs rounded-xl shadow-2xl border border-white/20 ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-96 opacity-0'}`}>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
        <span className="font-mono">{toast.text}</span>
      </div>

      <div className="flex flex-col w-full max-w-full overflow-hidden">
        <div className="w-full bg-surface-container-low px-space-md py-space-xs shadow-sm flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm flex-wrap">
            {/* Back Button */}
            <Link href="/" className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container-highest hover:bg-on-surface-variant hover:text-on-primary rounded transition-all group border border-outline-variant shadow-sm">
              <ArrowLeft className="w-4 h-4 text-on-surface group-hover:text-on-primary group-hover:-translate-x-0.5 transition-all" />
              <span className="font-label-code text-label-code text-on-surface group-hover:text-on-primary uppercase font-bold">Home</span>
            </Link>
            <div className="h-5 w-px bg-outline"></div>
            <div className="flex items-center gap-space-xs px-space-xs py-space-2xs bg-primary text-on-primary rounded font-label-code text-micro-caption tracking-wider">
              <span className="material-symbols-outlined text-[12px] text-tertiary-fixed">paragliding</span>
              UPSTREAM KINETIC OPS
            </div>
            <div className="flex items-center bg-surface-container-high rounded p-0.5 flex-wrap gap-1" id="sector-switcher">
<button className={`px-space-sm py-space-2xs rounded font-label-code text-label-code flex items-center gap-1.5 transition-all ${sector === 'ENGADIN' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setSector('ENGADIN')} type="button">
{sector === 'ENGADIN' && <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-ping"></span>}
          ENGADIN ALPS [3,420M // SECTOR 04]
        </button>
<button className={`px-space-sm py-space-2xs rounded font-label-code text-label-code transition-all ${sector === 'MONT_BLANC' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setSector('MONT_BLANC')} type="button">
{sector === 'MONT_BLANC' && <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-ping"></span>}
          MONT BLANC CORRIDOR [4,100M]
        </button>
<button className={`px-space-sm py-space-2xs rounded font-label-code text-label-code transition-all ${sector === 'MATTERHORN' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setSector('MATTERHORN')} type="button">
{sector === 'MATTERHORN' && <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-ping"></span>}
          MATTERHORN SHEAR [3,150M]
        </button>
</div>
</div>

<div className="flex items-center gap-space-xs flex-wrap">
<div className="flex items-center gap-1 px-space-xs py-0.5 bg-surface-container rounded font-label-code text-micro-caption text-on-surface-variant">
<span className="text-secondary font-bold">ELEV</span>
<span className="font-telemetry-data text-on-surface" id="stat-elev">{currentSector.elev}</span>
</div>
<div className="flex items-center gap-1 px-space-xs py-0.5 bg-surface-container rounded font-label-code text-micro-caption text-on-surface-variant">
<span className="text-secondary font-bold">RHO</span>
<span className="font-telemetry-data text-on-surface" id="stat-rho">{currentSector.rho}</span>
</div>
<div className="flex items-center gap-1 px-space-xs py-0.5 bg-surface-container rounded font-label-code text-micro-caption text-on-surface-variant">
<span className="text-secondary font-bold">P_AMB</span>
<span className="font-telemetry-data text-on-surface" id="stat-pamb">{currentSector.pamb}</span>
</div>
<div className="flex items-center gap-1 px-space-xs py-0.5 bg-surface-container-highest text-on-secondary-container rounded font-label-code text-micro-caption">
<span className="material-symbols-outlined text-[13px] text-secondary">air</span>
<span className="font-telemetry-data font-bold" id="stat-wind">{currentSector.wind}</span>
</div>
<div className="flex items-center gap-1 px-space-xs py-0.5 bg-tertiary-container text-on-tertiary-container rounded font-label-code text-micro-caption">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse"></span>
        AIRSPACE CLEAR: FL220
      </div>
      {/* Backend Connection Status */}
      <div className={`flex items-center gap-1 px-space-xs py-0.5 rounded font-label-code text-micro-caption ${
        connected ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'}`}></span>
        <span className="font-bold">{connected ? 'TELEMETRY LIVE' : 'OFFLINE'}</span>
      </div>
</div>
</div>

<div className="w-full p-space-sm grid grid-cols-1 xl:grid-cols-12 gap-space-sm items-start max-w-full overflow-hidden">

<div className="xl:col-span-3 flex flex-col gap-space-sm max-w-full overflow-hidden">

<div className="bg-surface-container-lowest rounded shadow-sm p-space-sm flex flex-col gap-space-xs">
<div className="flex items-center justify-between pb-space-2xs">
<div className="flex items-center gap-1 text-on-surface font-headline-md text-body-lg uppercase tracking-tight">
<span className="material-symbols-outlined text-secondary text-[16px]">account_tree</span>
            Kinetic & Probe Nodes
          </div>
<span className="font-label-code text-micro-caption px-1.5 py-0.5 bg-surface-container rounded text-on-surface-variant">4 NODES CONNECTED</span>
</div>

<div className="p-space-xs bg-surface-container-low hover:bg-surface-container rounded transition-all cursor-pointer shadow-xs">
<div className="flex items-center justify-between mb-1">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
<span className="font-headline-md text-body-sm text-on-surface">TAWF-01 [Aero-Wing]</span>
</div>
<span className="font-label-code text-micro-caption text-on-tertiary-container bg-surface-container-highest px-1 rounded font-bold">1.2 MW HARVEST</span>
</div>
<div className="grid grid-cols-3 gap-1 font-telemetry-data text-micro-caption text-on-surface-variant mt-1 bg-surface-container-lowest p-1 rounded">
<div><span className="text-outline">TETHER:</span> 1,800m</div>
<div><span className="text-outline">LOAD:</span> <span className="text-on-surface font-bold">42.4 kN</span></div>
<div><span className="text-outline">TRIM:</span> <span className="text-on-tertiary-container">99.2%</span></div>
</div>
<div className="w-full bg-surface-container-high h-1 rounded-full mt-1.5 overflow-hidden">
<div className="bg-secondary h-full w-[70.6%]"></div>
</div>
</div>

<div className="p-space-xs bg-surface-container-low hover:bg-surface-container rounded transition-all cursor-pointer opacity-90">
<div className="flex items-center justify-between mb-1">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-outline animate-pulse"></span>
<span className="font-headline-md text-body-sm text-on-surface">TAWF-02 [Aero-Wing]</span>
</div>
<span className="font-label-code text-micro-caption text-on-surface-variant bg-surface-container px-1 rounded">STANDBY ARMED</span>
</div>
<div className="grid grid-cols-3 gap-1 font-telemetry-data text-micro-caption text-on-surface-variant mt-1 bg-surface-container-lowest p-1 rounded">
<div><span className="text-outline">SPOOL:</span> DOCKED</div>
<div><span className="text-outline">AUTO-RET:</span> READY</div>
<div><span className="text-outline">DRY WT:</span> 480 kg</div>
</div>
</div>

<div className="p-space-xs bg-surface-container-low hover:bg-surface-container rounded transition-all cursor-pointer">
<div className="flex items-center justify-between mb-1">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-secondary"></span>
<span className="font-headline-md text-body-sm text-on-surface">BTSP-CO2 [Bedrock Siphon]</span>
</div>
<span className="font-label-code text-micro-caption text-secondary bg-surface-container-highest px-1 rounded">ΔT 64°C</span>
</div>
<div className="grid grid-cols-3 gap-1 font-telemetry-data text-micro-caption text-on-surface-variant mt-1 bg-surface-container-lowest p-1 rounded">
<div><span className="text-outline">BORE:</span> 2,400m</div>
<div><span className="text-outline">BAR:</span> 18.2 bar</div>
<div><span className="text-outline">FLUX:</span> 82.4 kW</div>
</div>
</div>

<div className="p-space-xs bg-surface-container-low hover:bg-surface-container rounded transition-all cursor-pointer">
<div className="flex items-center justify-between mb-1">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
<span className="font-headline-md text-body-sm text-on-surface">CSAR-88 [Interferometry]</span>
</div>
<span className="font-label-code text-micro-caption text-on-surface-variant bg-surface-container px-1 rounded">SWEEPING</span>
</div>
<div className="grid grid-cols-3 gap-1 font-telemetry-data text-micro-caption text-on-surface-variant mt-1 bg-surface-container-lowest p-1 rounded">
<div><span className="text-outline">RES:</span> 4.0 cm</div>
<div><span className="text-outline">AREA:</span> 140 km²</div>
<div><span className="text-outline">DEF:</span> -0.12 mm/d</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded shadow-sm p-space-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-on-surface">downloading</span>
<span className="font-headline-md text-body-sm text-on-surface uppercase">Winch Motor Core</span>
</div>
<span className="font-label-code text-micro-caption px-1.5 py-0.5 bg-surface-container rounded text-on-surface-variant font-bold">DRIVE: SYNCHRONOUS</span>
</div>

<div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
<div className="flex flex-col">
<span className="font-headline-md text-body-sm text-on-surface">Autonomous Trajectory</span>
<span className="font-label-code text-micro-caption text-on-tertiary-container">Auto Crosswind Figure-8 Loop Active</span>
</div>
<button className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-all ${flightLoopActive ? 'bg-on-surface' : 'bg-outline'}`} id="btn-loop-mode" onClick={() => setFlightLoopActive(!flightLoopActive)} type="button">
<div className={`w-4 h-4 bg-tertiary-fixed rounded-full transition-transform ${flightLoopActive ? 'translate-x-5' : 'translate-x-0'}`} id="toggle-ball"></div>
</button>
</div>

<div className="flex flex-col gap-1 p-space-xs bg-surface-container-low rounded">
<div className="flex items-center justify-between font-label-code text-micro-caption">
<span className="text-on-surface-variant">DYNAMIC LOAD THRESHOLD</span>
<span className="font-bold text-on-surface" id="tension-limit-val">{tensionLimit.toFixed(1)} kN</span>
</div>
<input className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer" max="65" min="30" onChange={(e) => setTensionLimit(parseFloat(e.target.value))} step="0.5" type="range" value={tensionLimit}/>
<div className="flex justify-between font-label-code text-micro-caption text-outline">
<span>MIN 30 kN</span>
<span>WARN 50 kN</span>
<span>CRIT 60 kN</span>
</div>
</div>

<div className="grid grid-cols-2 gap-space-xs">
<button className="px-space-xs py-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-label-code text-label-code flex items-center justify-center gap-1 transition-all" onClick={triggerManualReel} type="button">
<span className="material-symbols-outlined text-[14px]">rotate_90_degrees_ccw</span>
            MANUAL REEL
          </button>
<button className="px-space-xs py-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-label-code text-label-code flex items-center justify-center gap-1 transition-all" onClick={pulseDeice} type="button">
<span className="material-symbols-outlined text-[14px] text-secondary">ac_unit</span>
            PULSE DE-ICE
          </button>
</div>
<button className="w-full py-space-xs bg-primary hover:bg-on-surface-variant text-on-primary rounded font-label-code text-label-code uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors" onClick={armSpoolLock} type="button">
<span className="material-symbols-outlined text-[15px] text-tertiary-fixed">lock</span>
<span>ENGAGE SPOOL PINION LOCK</span>
</button>
</div>

<div className="bg-surface-container-lowest rounded shadow-sm p-space-sm flex flex-col gap-space-xs">
<div className="flex items-center justify-between text-on-surface-variant font-label-code text-micro-caption uppercase">
<span>Tether Drum RPM</span>
<span className="text-on-surface font-bold">482 RPM</span>
</div>
<div className="flex items-center gap-2">

<svg className="w-12 h-12 shrink-0 transform -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-secondary stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="72, 100" strokeLinecap="round" strokeWidth="3.5"></path>
</svg>
<div className="flex flex-col flex-1">
<span className="font-telemetry-data text-body-sm text-on-surface">Umbilical Line Speed: <strong className="text-on-secondary-container">12.4 m/s</strong></span>
<span className="font-label-code text-micro-caption text-outline">Phase: REEL-OUT GENERATION (+1.2 MW)</span>
</div>
</div>
</div>
</div>

<div className="xl:col-span-6 flex flex-col gap-space-sm max-w-full overflow-hidden">

<div className="grid grid-cols-2 lg:grid-cols-4 gap-space-xs">

<div className="bg-surface-container-lowest p-space-xs rounded shadow-sm flex flex-col">
<span className="font-label-code text-micro-caption text-outline uppercase tracking-wider">HARVESTED YIELD</span>
<div className="flex items-baseline gap-1 mt-0.5">
<span className="font-metric-display text-metric-display text-on-surface" id="kpi-harvest">{liveHarvestYield}</span>
<span className="font-label-code text-label-code text-on-surface-variant font-bold">MW/h</span>
</div>
<span className="font-label-code text-micro-caption text-on-tertiary-container flex items-center gap-0.5 mt-0.5">
<span className="material-symbols-outlined text-[11px]">arrow_drop_up</span> +18.4% vs BASELINE
          </span>
</div>

<div className="bg-surface-container-lowest p-space-xs rounded shadow-sm flex flex-col">
<span className="font-label-code text-micro-caption text-outline uppercase tracking-wider">JET KINETIC VEL</span>
<div className="flex items-baseline gap-1 mt-0.5">
<span className="font-metric-display text-metric-display text-on-surface" id="kpi-wind">{liveWindSpeed}</span>
<span className="font-label-code text-label-code text-on-surface-variant font-bold">km/h</span>
</div>
<span className="font-label-code text-micro-caption text-secondary flex items-center gap-0.5 mt-0.5">
<span className="material-symbols-outlined text-[11px]">waves</span> LAMINAR JET CORRIDOR
          </span>
</div>

<div className="bg-surface-container-lowest p-space-xs rounded shadow-sm flex flex-col">
<span className="font-label-code text-micro-caption text-outline uppercase tracking-wider">GROUND STRAIN LOAD</span>
<div className="flex items-baseline gap-1 mt-0.5">
<span className="font-metric-display text-metric-display text-on-surface" id="kpi-load">42.4</span>
<span className="font-label-code text-label-code text-on-surface-variant font-bold">kN</span>
</div>
<div className="w-full bg-surface-container-high h-1.5 rounded mt-1 overflow-hidden">
<div className="bg-secondary h-full rounded transition-all duration-300" id="strain-bar" style={{ width: "70.6%" }}></div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-xs rounded shadow-sm flex flex-col">
<span className="font-label-code text-micro-caption text-outline uppercase tracking-wider">BEDROCK HEAT FLUX</span>
<div className="flex items-baseline gap-1 mt-0.5">
<span className="font-metric-display text-metric-display text-on-surface">82.4</span>
<span className="font-label-code text-label-code text-on-surface-variant font-bold">kW_th</span>
</div>
<span className="font-label-code text-micro-caption text-on-surface-variant flex items-center gap-0.5 mt-0.5">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> CO2 SIPHON ΔT 64°C
          </span>
</div>
</div>

<div className="bg-surface-container-lowest rounded shadow-sm p-space-sm flex flex-col gap-space-sm relative overflow-hidden">
<div className="flex items-center justify-between z-10">
<div className="flex items-center gap-2">
<div className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container animate-ping"></div>
<span className="font-headline-md text-headline-md text-on-surface tracking-tight">HIGH-ALTITUDE TETHER VECTOR HUD</span>
<span className="px-space-xs py-0.5 bg-surface-container rounded font-label-code text-micro-caption text-on-surface-variant">FLIGHT COMPUTATION ENGINE v9.1</span>
</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-sm py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-label-code text-micro-caption uppercase transition-colors flex items-center gap-1" onClick={simulateWindGust} type="button">
<span className="material-symbols-outlined text-[13px] text-error">airwave</span>
              {simulatingGust ? 'GUST ACTIVE...' : 'Simulate Windshear Gust'}
            </button>
<button className="px-space-sm py-1 bg-primary text-on-primary hover:bg-on-surface-variant rounded font-label-code text-micro-caption uppercase transition-colors flex items-center gap-1" onClick={optimizeFigure8} type="button">
<span className="material-symbols-outlined text-[13px] text-tertiary-fixed">auto_fix_high</span>
              {loopOptimizing ? 'OPTIMIZING...' : 'Optimize Figure-8 Trajectory'}
            </button>
</div>
</div>

<div className="relative w-full h-[360px] bg-surface-container-low rounded overflow-hidden flex items-center justify-center">

<svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
<defs>
<pattern height="40" id="grid-pattern" patternUnits="userSpaceOnUse" width="40">
<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="0.8"></path>
</pattern>
</defs>
<rect fill="url(#grid-pattern)" height="100%" width="100%"></rect>
</svg>

<svg className="w-full h-full z-10" id="hud-svg" viewBox="0 0 700 360">

<line stroke="#CBD5E1" strokeDasharray="3,3" strokeWidth="1" x1="40" x2="660" y1="60" y2="60"></line>
<text className="font-label-code text-[9px]" fill="#74777d" x="45" y="55">ALT: 4,000M ASL [JET BOUNDARY]</text>
<line stroke="#CBD5E1" strokeDasharray="3,3" strokeWidth="1" x1="40" x2="660" y1="180" y2="180"></line>
<text className="font-label-code text-[9px]" fill="#74777d" x="45" y="175">ALT: 2,600M [CROSSWIND SWEEP PLANE]</text>
<line stroke="#74777d" strokeWidth="1" x1="40" x2="660" y1="310" y2="310"></line>
<text className="font-label-code text-[9px]" fill="#74777d" x="45" y="325">GROUND ANCHOR STATION // 3,420M PLATFORM</text>

<rect fill="#0F1E2E" height="40" rx="2" width="70" x="80" y="270"></rect>
<text className="font-label-code text-[8px] font-bold" fill="#6ffbbe" textAnchor="middle" x="115" y="287">SPOOL GEN</text>
<text className="font-telemetry-data text-[9px]" fill="#ffffff" textAnchor="middle" x="115" y="300">1.2 MW</text>

<path className="transition-all duration-700" d="M 150 280 C 260 270, 360 210, 480 120" fill="none" id="tether-line" stroke="#006398" strokeDasharray="6,4" strokeWidth="2.5">
<animate attributeName="stroke-dashoffset" dur="2s" from="100" repeatCount="indefinite" to="0"></animate>
</path>

<path d="M 440 100 C 470 50, 560 50, 570 110 C 580 170, 470 170, 500 110 C 530 50, 620 50, 630 110 C 640 170, 520 170, 440 100 Z" fill="none" id="figure8-path" stroke="#6ffbbe" strokeDasharray="4,2" strokeOpacity="0.8" strokeWidth="1.8"></path>

<g className="transition-transform duration-500" id="wing-node" transform="translate(540, 110)">

<circle cx="0" cy="0" fill="none" r="16" stroke="#009869" strokeDasharray="2,2" strokeWidth="1">
<animateTransform attributeName="transform" dur="10s" from="0" repeatCount="indefinite" to="360" type="rotate"></animateTransform>
</circle>

<polygon fill="#000309" points="0,-8 10,6 0,3 -10,6" stroke="#6ffbbe" strokeWidth="1"></polygon>

<line markerEnd="url(#arrow)" stroke="#009869" strokeWidth="2" x1="0" x2="0" y1="-8" y2="-28"></line>
<circle cx="0" cy="0" fill="#6ffbbe" r="3"></circle>
</g>

<rect fill="#ffffff" fillOpacity="0.9" height="42" rx="3" stroke="#c4c6cc" strokeWidth="0.5" width="160" x="490" y="25"></rect>
<text className="font-label-code text-[10px] font-bold" fill="#0b1c30" x="500" y="40">WING VELOCITY: <tspan fill="#006398" id="hud-foil-speed">164 km/h</tspan></text>
<text className="font-label-code text-[9px]" fill="#44474c" x="500" y="52">LIFT/DRAG: <tspan className="font-bold text-on-surface">14.8</tspan> | AoA: <tspan className="font-bold text-on-tertiary-container" id="hud-aoa">8.4°</tspan></text>
<text className="font-label-code text-[9px]" fill="#44474c" x="500" y="62">TETHER AZIMUTH: <tspan className="font-bold text-on-surface">312° (NW)</tspan></text>
</svg>

<div className="absolute bottom-2 left-3 flex items-center gap-2 z-20">
<span className="px-1.5 py-0.5 bg-surface-container-lowest text-on-surface font-label-code text-micro-caption rounded shadow-xs">
              SPOOL TENSION: <strong>42.4 kN</strong>
</span>
<span className="px-1.5 py-0.5 bg-tertiary-container text-on-tertiary-container font-label-code text-micro-caption rounded">
              HARVEST CYCLE: T-04 [REEL-OUT 78%]
            </span>
</div>
<div className="absolute top-2 left-3 bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded shadow-xs z-20 font-label-code text-micro-caption text-on-surface-variant flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
<span>CROSSWIND KINEMATICS ENGINE ENGAGED</span>
</div>
</div>

<div className="grid grid-cols-3 gap-space-xs pt-space-2xs border-t-0">
<div className="p-space-xs bg-surface-container rounded flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-code text-micro-caption text-outline">LINE WINCH SPEED</span>
<span className="font-telemetry-data text-body-sm text-on-surface font-bold" id="metric-spool-speed">+12.4 m/s (Out)</span>
</div>
<span className="material-symbols-outlined text-secondary text-[18px]">fast_forward</span>
</div>
<div className="p-space-xs bg-surface-container rounded flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-code text-micro-caption text-outline">AERO REYNOLDS NUM</span>
<span className="font-telemetry-data text-body-sm text-on-surface font-bold">1.42 x 10⁶</span>
</div>
<span className="material-symbols-outlined text-on-tertiary-container text-[18px]">speed</span>
</div>
<div className="p-space-xs bg-surface-container rounded flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-code text-micro-caption text-outline">HARVEST EFFICIENCY</span>
<span className="font-telemetry-data text-body-sm text-on-tertiary-container font-bold">94.6% Betz Ref</span>
</div>
<span className="material-symbols-outlined text-on-tertiary-container text-[18px]">verified</span>
</div>
</div>
</div>
</div>

<div className="xl:col-span-3 flex flex-col gap-space-sm max-w-full overflow-hidden">

<div className="bg-surface-container-lowest rounded shadow-sm p-space-sm flex flex-col gap-space-xs">
<div className="flex items-center justify-between pb-space-2xs">
<div className="flex items-center gap-1 text-on-surface font-headline-md text-body-lg uppercase tracking-tight">
<span className="material-symbols-outlined text-secondary text-[16px]">radar</span>
            Alpine Geo-Radar
          </div>
<span className="font-label-code text-micro-caption px-1.5 py-0.5 bg-surface-container rounded text-on-tertiary-container font-bold">STABLE</span>
</div>

<div className="relative w-full h-36 rounded bg-surface-container-low overflow-hidden flex items-center justify-center">
<img className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500" alt="High-resolution alpine satellite synthetic aperture radar interferometry visual showing icy glaciated mountain peaks in Engadin Switzerland" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu1btOICi-H2tT1SRppGhJFrCIFi2oQ_2uA1u9ydfezCgIFWIHKlCBftGGca0oD5WevT6pQfXTjngpKnV86zw8xAq3Ub0rLmh1RNuGC2Nyxg0lHSgJ3MB6JqG-g0h6uaPNUOitD66HvFDuJHYY1fh7bDgJTFsi3a60JKEjxbVNZ7cfVgI-_mTQay-NLgR6Pxggtn6YW9YDjCvaEO80GJTbcx1_TF5xPwC-L_neXyKVNIUYmK7Y6YP8tQ"/>
<div className="absolute inset-0 bg-gradient-to-t from-primary-container/80 via-transparent to-transparent flex flex-col justify-end p-space-xs text-on-primary">
<span className="font-label-code text-micro-caption tracking-wider text-tertiary-fixed">PERMAFROST INTERFEROMETRY: 4cm RES</span>
<div className="flex justify-between items-center font-telemetry-data text-micro-caption mt-0.5">
<span>Bore Strain: 12.1 με</span>
<span className="text-secondary-fixed">Displacement: -0.12 mm/yr</span>
</div>
</div>
</div>

<div className="grid grid-cols-2 gap-1 pt-1 font-label-code text-micro-caption">
<div className="bg-surface-container p-1 rounded">
<span className="text-outline">BEDROCK TEMP:</span>
<div className="font-telemetry-data text-on-surface font-bold">-1.4°C @ 12m</div>
</div>
<div className="bg-surface-container p-1 rounded">
<span className="text-outline">SHEAR STRESS:</span>
<div className="font-telemetry-data text-on-tertiary-container font-bold">142 kPa [LOW]</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded shadow-sm p-space-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-on-surface">electric_bolt</span>
<span className="font-headline-md text-body-sm text-on-surface uppercase">Dispatch Sub-Bus</span>
</div>
<span className="font-label-code text-micro-caption px-1.5 py-0.5 bg-surface-container rounded text-on-surface font-bold" id="total-bus-output">2.45 MW TOTAL</span>
</div>

<div className="flex flex-col gap-1 p-space-xs bg-surface-container-low rounded">
<div className="flex items-center justify-between font-label-code text-micro-caption">
<span className="text-on-surface">1. ENGADIN VALLEY GRID</span>
<span className="font-bold text-secondary font-telemetry-data" id="val-grid">{gridDispatch.toFixed(2)} MW</span>
</div>
<input className="w-full accent-secondary h-1.5 bg-surface-container-high rounded cursor-pointer" max="2.2" min="0.5" onChange={(e) => setGridDispatch(parseFloat(e.target.value))} step="0.05" type="range" value={gridDispatch}/>
<div className="flex justify-between font-label-code text-micro-caption text-outline">
<span>PRIORITY 01</span>
<span>HIGH-VOLTAGE INTERTIE</span>
</div>
</div>

<div className="flex flex-col gap-1 p-space-xs bg-surface-container-low rounded">
<div className="flex items-center justify-between font-label-code text-micro-caption">
<span className="text-on-surface">2. CRYO-SIPHON THERMAL PUMP</span>
<span className="font-bold text-on-surface font-telemetry-data" id="val-cryo">{cryoDispatch} kW</span>
</div>
<input className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer" max="800" min="100" onChange={(e) => setCryoDispatch(parseInt(e.target.value))} step="10" type="range" value={cryoDispatch}/>
<div className="flex justify-between font-label-code text-micro-caption text-outline">
<span>BORE CHILLING</span>
<span>CO2 CLOSED CYCLE</span>
</div>
</div>

<div className="flex flex-col gap-1 p-space-xs bg-surface-container-low rounded">
<div className="flex items-center justify-between font-label-code text-micro-caption">
<span className="text-on-surface">3. SUPERCAP BUFFER (BESS)</span>
<span className="font-bold text-on-tertiary-container font-telemetry-data" id="val-bess">{bessDispatch} kW</span>
</div>
<input className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer" max="500" min="50" onChange={(e) => setBessDispatch(parseInt(e.target.value))} step="10" type="range" value={bessDispatch}/>
<div className="flex justify-between font-label-code text-micro-caption text-outline">
<span>SOC: 91.4%</span>
<span>2.4 MWh CAPACITY</span>
</div>
</div>

<div className="flex flex-col gap-space-xs mt-1">
<button className="w-full py-space-xs bg-error-container hover:bg-error text-on-error-container hover:text-on-error rounded font-label-code text-label-code uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs" onClick={emergencyRetract} type="button">
<span className="material-symbols-outlined text-[15px]">warning</span>
<span>EMERGENCY WINCH RETRACT</span>
</button>
<button className="w-full py-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-label-code text-label-code uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors" onClick={exportFlightLogs} type="button">
<span className="material-symbols-outlined text-[14px]">download</span>
<span>EXPORT KINETIC FLIGHT LOGS</span>
</button>
</div>
</div>

<div className="p-space-xs bg-surface-container-lowest rounded shadow-xs flex items-center justify-between font-label-code text-micro-caption text-on-surface-variant">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[12px] text-secondary">pin_drop</span>
          46.8012° N, 9.8431° E
        </span>
<span className="text-on-surface font-bold">NCPOR Alpine Glaciology Node</span>
</div>
</div>
</div>

<div className="w-full px-space-sm pb-space-sm">
<div className="bg-surface-container-lowest rounded shadow-sm p-space-sm flex flex-col gap-space-xs">

<div className="flex flex-wrap items-center justify-between gap-space-xs">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[16px]">stacked_line_chart</span>
<span className="font-headline-md text-body-sm text-on-surface uppercase">24-Hour Alpine Jet Velocity vs Megawatt Yield Curve</span>
<span className="font-label-code text-micro-caption px-1.5 py-0.5 bg-surface-container rounded text-on-surface-variant">SYNC: 1-SEC TELEMETRY ROLLUP</span>
</div>

<div className="flex items-center gap-space-md">
<div className="flex items-center gap-1.5 font-label-code text-micro-caption">
<span className="w-3 h-0.5 bg-secondary"></span>
<span className="text-on-surface-variant">JET WIND SPEED (km/h)</span>
</div>
<div className="flex items-center gap-1.5 font-label-code text-micro-caption">
<span className="w-3 h-0.5 bg-tertiary-fixed-dim"></span>
<span className="text-on-surface-variant">YIELD HARVEST (MW)</span>
</div>
<div className="font-label-code text-micro-caption bg-surface-container-high px-2 py-0.5 rounded text-on-surface">
            CURSOR: <span className="font-bold" id="cursor-time">21:00 UTC</span> // <span className="font-bold text-secondary" id="cursor-val">118 km/h</span> | <span className="font-bold text-on-tertiary-container" id="cursor-mw">2.45 MW</span>
</div>
</div>
</div>

<div className="w-full h-28 relative bg-surface-container-low rounded overflow-hidden">
<svg className="w-full h-full" id="timeline-chart"  preserveAspectRatio="none" viewBox="0 0 1000 100">

<line stroke="#CBD5E1" strokeDasharray="4,4" strokeWidth="0.7" x1="0" x2="1000" y1="25" y2="25"></line>
<line stroke="#CBD5E1" strokeDasharray="4,4" strokeWidth="0.7" x1="0" x2="1000" y1="50" y2="50"></line>
<line stroke="#CBD5E1" strokeDasharray="4,4" strokeWidth="0.7" x1="0" x2="1000" y1="75" y2="75"></line>

<polygon fill="#009869" fillOpacity="0.12" points="0,100 0,70 80,68 160,72 240,65 320,55 400,48 480,42 560,45 640,40 720,35 800,28 880,32 940,30 1000,28 1000,100"></polygon>

<path d="M 0,65 Q 80,60 160,65 T 320,48 T 480,35 T 640,32 T 800,22 T 940,25 L 1000,20" fill="none" stroke="#006398" strokeWidth="2"></path>

<path d="M 0,70 Q 80,68 160,72 T 320,55 T 480,42 T 640,40 T 800,28 T 940,30 L 1000,28" fill="none" stroke="#009869" strokeDasharray="3,1" strokeWidth="2"></path>

<line id="chart-scrubber" stroke="#0b1c30" strokeDasharray="2,2" strokeWidth="1.5" x1="875" x2="875" y1="0" y2="100"></line>
</svg>

<div className="absolute bottom-1 left-0 right-0 px-2 flex justify-between font-label-code text-[9px] text-outline pointer-events-none">
<span>00:00</span>
<span>04:00</span>
<span>08:00</span>
<span>12:00</span>
<span>16:00</span>
<span>20:00</span>
<span>23:59 [CURRENT]</span>
</div>
</div>
</div>
</div>
</div>

      </div>
      </div>
    
  );
}
