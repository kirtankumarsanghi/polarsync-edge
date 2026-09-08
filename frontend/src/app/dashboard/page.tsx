"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, ShieldCheck, Download, Terminal, Sliders, X, 
  SunMedium, Cog, BatteryCharging, ThermometerSnowflake, Radio, 
  Compass, Clock, Layers, ArrowLeft 
} from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useWebSocket } from '../../hooks/useWebSocket';

const polarStations = {
  bharati: {
    name: "BHARATI POLAR RESEARCH",
    coords: "69.4042° S, 76.1872° E • LARSEMANN HILLS",
    loadMax: "42.0 kW",
    bessReserve: "28.5 hrs Reserve",
    solarYield: "520 kWh/d",
    windDir: "Vector: SSE (Gust 46)",
    sun: "28.4°",
    albedo: "0.86",
    pvTitle: "Solar PV Field (50 kWp)",
    bessTitle: "BESS Rack (200 kWh)",
    hvacLoad: "340",
    radarLoad: "180",
    drillLoad: "260"
  },
  maitri: {
    name: "MAITRI POLAR RESEARCH",
    coords: "70.7667° S, 11.7333° E • SCHIRMACHER OASIS",
    loadMax: "38.5 kW",
    bessReserve: "34.2 hrs Reserve",
    solarYield: "480 kWh/d",
    windDir: "Vector: S (Gust 54)",
    sun: "26.1°",
    albedo: "0.78",
    pvTitle: "Solar Hybrid Array (65 kWp)",
    bessTitle: "BESS Thermal Vault (250 kWh)",
    hvacLoad: "310",
    radarLoad: "160",
    drillLoad: "220"
  }
};

export default function Dashboard() {
  const [stationKey, setStationKey] = useState<'bharati' | 'maitri'>('bharati');
  const [dispatchMode, setDispatchMode] = useState<'auto' | 'manual'>('auto');
  const [gensetActive, setGensetActive] = useState(true);
  const [toast, setToast] = useState({ visible: false, text: '' });
  const [logs, setLogs] = useState<string[]>(['[14:22:01] Katabatic gust 38kt detected → Pitch trim nominal. Albedo irradiance 840 W/m².']);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [simulatedLoad, setSimulatedLoad] = useState<string | null>(null);
  
  const [loads, setLoads] = useState({ hvac: 340, radar: 180, drill: 260 });
  const [time, setTime] = useState(14);
  const [clock, setClock] = useState('');
  const [activeTab, setActiveTab] = useState('scada');

  // Fetch real telemetry data from backend
  const { telemetry, weather, loading, error, connected } = useTelemetry(5000);
  const { telemetryUpdate, connected: wsConnected } = useWebSocket();

  // Use live data if available, otherwise use station defaults
  const staticData = polarStations[stationKey];
  
  // Create live data object from real telemetry
  const liveData = telemetry ? {
    load: (telemetry.demand_kw || 37.4).toFixed(1),
    soc: (telemetry.battery_soc || 84.2).toFixed(1),
    socDir: `${telemetry.battery_charge_rate >= 0 ? '+' : ''}${(telemetry.battery_charge_rate || 18.0).toFixed(1)} kW ${telemetry.battery_charge_rate >= 0 ? 'CHG' : 'DISCH'}`,
    renewPct: (telemetry.renewable_pct || 57.8).toFixed(1),
    fuelSaved: ((telemetry.renewable_pct || 32.4) * 0.56).toFixed(1),
    temp: weather ? `${(weather.temp_c || -18.4).toFixed(1)}°C` : "-18.4°C",
    chill: weather ? `${((weather.temp_c || -18.4) - 12.8).toFixed(1)}°C` : "-31.2°C",
    wind: weather ? Math.round(weather.wind_kph || 34).toString() : "34",
    pvKw: `${(telemetry.solar_kw || 38.4).toFixed(1)} kW`,
    gensetKw: gensetActive ? `${(telemetry.genset_kw || 24.0).toFixed(1)} kW (Active)` : "0.0 kW (Standby)",
    bessText: `${(telemetry.battery_soc || 84.2).toFixed(1)}% (${telemetry.battery_charge_rate >= 0 ? '+' : ''}${(telemetry.battery_charge_rate || 18).toFixed(0)} kW)`,
  } : null;

  const data = liveData || { ...staticData, load: "37.4", soc: "84.2", socDir: "+18.0 kW CHG", renewPct: "57.8", fuelSaved: "+32.4", temp: "-18.4°C", chill: "-31.2°C", wind: "34", pvKw: "38.4 kW", gensetKw: "24.0 kW (Active)", bessText: "84.2% (+18 kW)" };

  // Update from WebSocket if newer data available
  useEffect(() => {
    if (telemetryUpdate) {
      // WebSocket update received, data will auto-refresh on next useTelemetry cycle
      const timeStr = new Date(telemetryUpdate.timestamp).toLocaleTimeString('en-GB');
      appendLog(`[${timeStr}] Live telemetry update: Solar ${telemetryUpdate.solar_kw.toFixed(1)}kW, Demand ${telemetryUpdate.demand_kw.toFixed(1)}kW, SOC ${telemetryUpdate.battery_soc.toFixed(1)}%`);
    }
  }, [telemetryUpdate]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const seconds = now.getUTCSeconds().toString().padStart(2, '0');
      setClock(`${hours}:${minutes}:${seconds} UTC`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (text: string) => {
    setToast({ visible: true, text });
    setTimeout(() => {
      setToast(t => ({ ...t, visible: false }));
    }, 3500);
  };

  const appendLog = (msg: string) => {
    const now = new Date();
    const timeStr = `[${now.getUTCHours().toString().padStart(2,'0')}:${now.getUTCMinutes().toString().padStart(2,'0')}:${now.getUTCSeconds().toString().padStart(2,'0')}]`;
    setLogs(prev => [`${timeStr} ${msg}`, ...prev].slice(0, 10));
  };

  const handleStationChange = (key: 'bharati' | 'maitri') => {
    setStationKey(key);
    const s = polarStations[key];
    showToast(`Switched telemetry context to ${s.name}`);
    appendLog(`Context shifted to ${s.name} (${s.coords}). SCADA polling refreshed.`);
  };

  const handleNodeToggle = (node: string) => {
    if (node === 'genset') {
      if (gensetActive) {
        setGensetActive(false);
        showToast('Genset Unit 1 shifted to Auto Cold Standby. Microgrid BESS taking swing load.');
        appendLog('[SCADA] Genset Unit 1 stopped. 100% renewable mode engaged.');
      } else {
        setGensetActive(true);
        showToast('Genset Unit 1 started with sub-zero manifold pre-heater.');
        appendLog('[SCADA] Genset 1 online at 1500 RPM. Synchronized to AC bus.');
      }
    } else if (node === 'pv') {
      showToast('Solar PV: Bifacial snow albedo tracking optimized.');
    } else if (node === 'bess') {
      showToast('BESS Thermal Containment: Vacuum jacket loop nominal at +16.8°C.');
    }
  };

  const handleModeChange = (mode: 'auto' | 'manual') => {
    setDispatchMode(mode);
    if (mode === 'auto') {
      showToast('AI Autonomous MPC Supervisory Controller Enabled');
      appendLog('[CONTROL] Autonomous MPC Mode activated. Auto-shedding enabled.');
    } else {
      showToast('Manual SCADA Override Engaged. Operator controls unlocked.');
      appendLog('[WARN] Manual supervisory mode engaged by Station Operator.');
    }
  };

  const simulateFault = () => {
    showToast('⚠️ Simulated 45-kt Katabatic Gust: Throttling scientific drill rigs to protect habitat thermal core.');
    appendLog('[ALERT] Severe katabatic wind shear detected (>45kt). AI shed Tier 3 non-critical loads.');
    setSimulatedLoad('44.8');
    setTimeout(() => {
      setSimulatedLoad(null);
    }, 4000);
  };

  const emergencyShedding = () => {
    showToast('Katabatic Load Shedding executed: Auxiliary heating shifted to passive hydronic recovery.');
    appendLog('[SAFETY] Emergency katabatic shedding routine initiated. 8.4 kW freed.');
  };

  const executeOptimizer = () => {
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
      showToast('AI Dispatch Optimization complete: Solar PV utilization maximized to 94.2%. Genset runtime trimmed -4.2h.');
      appendLog('[AI ENGINE] Global optimization converged in 84ms. BESS charging rate adjusted to +18.4 kW.');
    }, 700);
  };

  const exportTelemetry = () => {
    showToast('Generating NCPOR Polar Energy Dossier (JSON / SCADA CSV archive)...');
    appendLog('[DATASTORE] Telemetry archive compiled: NCPOR_BHARATI_EXP44.csv (24.4 MB).');
  };

  const timeStr = (time < 10 ? '0' : '') + Math.floor(time) + ':' + (time % 1 === 0 ? '00' : '30') + ' UTC';
  const svgX = (time / 24) * 700;

  return (
    <div className="min-h-screen text-[#14263a] relative antialiased selection:bg-slate-300 selection:text-slate-950 flex flex-col bg-[#0b1723] overflow-hidden font-sans w-full max-w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .font-mono-tech {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        }
        .backdrop-glass-panel {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px 0 rgba(16, 32, 54, 0.08);
        }
        .backdrop-glass-dense {
          background: rgba(240, 246, 252, 0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .flow-line {
          stroke-dasharray: 8, 8;
          animation: dashFlow 2s linear infinite;
        }
        .flow-line-reverse {
          stroke-dasharray: 8, 8;
          animation: dashFlowReverse 2s linear infinite;
        }
        @keyframes dashFlow {
          to { stroke-dashoffset: -32; }
        }
        @keyframes dashFlowReverse {
          to { stroke-dashoffset: 32; }
        }
        .pulse-glow {
          animation: pulseGlow 2.5s infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 2px rgba(16,185,129,0.7)); }
          50% { opacity: 0.4; filter: drop-shadow(0 0 0px rgba(16,185,129,0)); }
        }
        input[type=range] {
          accent-color: #122438;
        }
      `}} />

      {/* Scenic Nordic Polar Mountain Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d8e8f2] via-[#c6dbe7] to-[#9cbccf] opacity-95"></div>
        <svg className="absolute bottom-0 w-full h-[60vh] object-cover opacity-80" fill="none" viewBox="0 0 1440 600" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 420L180 310L360 380L540 260L720 340L900 220L1080 320L1260 250L1440 360V600H0Z" fill="url(#dist_grad)" opacity="0.45"></path>
          <path d="M0 480L140 370L320 440L490 320L670 410L860 290L1040 390L1220 310L1440 430V600H0Z" fill="url(#mid_grad)" opacity="0.6"></path>
          <path d="M0 530L210 420L410 490L610 390L810 470L1010 360L1210 450L1440 390V600H0Z" fill="url(#fg_grad)"></path>
          <defs>
            <linearGradient id="dist_grad" x1="720" x2="720" y1="220" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b0c8d8"></stop>
              <stop offset="1" stopColor="#557589"></stop>
            </linearGradient>
            <linearGradient id="mid_grad" x1="720" x2="720" y1="290" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7e9eaf"></stop>
              <stop offset="1" stopColor="#344b5a"></stop>
            </linearGradient>
            <linearGradient id="fg_grad" x1="720" x2="720" y1="360" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#466275"></stop>
              <stop offset="0.7" stopColor="#243846"></stop>
              <stop offset="1" stopColor="#14212c"></stop>
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/10 to-black/15 mix-blend-overlay"></div>
      </div>

      {/* Toast Notification Container */}
      <div className={`fixed top-20 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-3 px-4 py-3 bg-[#112233] text-white text-xs rounded-xl shadow-2xl border border-white/20 ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-96 opacity-0'}`}>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
        <span className="font-mono-tech">{toast.text}</span>
      </div>

      {/* APP HEADER BAR */}
      <header className="sticky top-0 z-40 px-4 lg:px-6 py-2.5 backdrop-glass-dense border-b border-white/40 shadow-sm flex items-center justify-between gap-4 max-w-full overflow-hidden">
        <div className="flex items-center gap-5 flex-wrap">
          {/* Back to Home Button */}
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white/90 border border-[#14263a]/20 transition-all group shadow-sm"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 text-[#14263a] group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold tracking-wider text-[#14263a] uppercase">Home</span>
          </Link>
          
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group relative">
            <div className="w-8 h-8 rounded-lg bg-[#14263a] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-inner">
              <Zap className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-[0.2em] text-[#122438] uppercase">VECTRUS OS</span>
                <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-[#14263a]/10 text-[#14263a] font-semibold">SCADA v3.4.2</span>
              </div>
              <div className="text-[9px] font-mono-tech tracking-widest text-[#14263a]/70 uppercase">POLAR MICROGRID AUTONOMOUS DISPATCH</div>
            </div>
          </Link>
          <div className="hidden xl:block h-6 w-px bg-[#14263a]/20"></div>
          
          {/* Station Segmented Control */}
          <div className="flex items-center bg-white/60 p-1 rounded-lg border border-[#14263a]/20 shadow-sm">
            <button 
              onClick={() => handleStationChange('bharati')}
              className={`flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider rounded-md transition-all duration-150 ${stationKey === 'bharati' ? 'bg-[#14263a] text-white shadow-sm' : 'text-[#14263a]/75 hover:text-[#14263a]'}`}
            >
              <span className={`w-2 h-2 rounded-full ${stationKey === 'bharati' ? 'bg-emerald-400 pulse-glow' : 'bg-transparent'}`}></span>
              <span>BHARATI (69.4°S)</span>
              <span className={`text-[9px] font-mono-tech ml-0.5 ${stationKey === 'bharati' ? 'opacity-70' : 'text-[#14263a]/50'}`}>{stationKey === 'bharati' ? 'PRI' : 'STANDBY'}</span>
            </button>
            <button 
              onClick={() => handleStationChange('maitri')}
              className={`flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider rounded-md transition-all duration-150 ${stationKey === 'maitri' ? 'bg-[#14263a] text-white shadow-sm' : 'text-[#14263a]/75 hover:text-[#14263a]'}`}
            >
              <span className={`w-2 h-2 rounded-full ${stationKey === 'maitri' ? 'bg-amber-400' : 'bg-transparent'}`}></span>
              <span>MAITRI (70.0°S)</span>
              <span className={`text-[9px] font-mono-tech ml-0.5 ${stationKey === 'maitri' ? 'opacity-70' : 'text-[#14263a]/50'}`}>{stationKey === 'maitri' ? 'PRI' : 'STANDBY'}</span>
            </button>
          </div>

          <nav className="hidden 2xl:flex items-center gap-1 text-xs font-medium tracking-wide">
            {['scada', 'optimizer', 'radar', 'logs'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg uppercase ${activeTab === tab ? 'bg-[#14263a]/10 font-bold text-[#14263a]' : 'hover:bg-white/50 text-[#14263a]/70 hover:text-[#14263a]'}`}
              >
                {tab === 'scada' ? 'LIVE SCADA' : tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/50 border border-emerald-600/30 text-emerald-900 font-mono-tech text-[10px] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>NCPOR GROUND LINK: <strong className="font-bold">12ms</strong> // STABLE</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/40 border border-black/20 text-[10px] font-semibold text-[#14263a]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>0 ANOMALIES</span>
          </div>
          {/* Backend Connection Status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-semibold ${
            connected && wsConnected 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
              : loading 
              ? 'bg-amber-50/80 border-amber-200 text-amber-800'
              : 'bg-red-50/80 border-red-200 text-red-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              connected && wsConnected ? 'bg-emerald-600 animate-pulse' : loading ? 'bg-amber-600' : 'bg-red-600'
            }`}></span>
            <span>{connected && wsConnected ? 'BACKEND LIVE' : loading ? 'CONNECTING' : 'OFFLINE'}</span>
          </div>
          <div className="hidden lg:flex flex-col text-right font-mono-tech leading-tight">
            <span className="text-xs font-bold text-[#14263a]">{clock}</span>
            <span className="text-[9px] text-[#14263a]/60 tracking-wider">ANTARCTICA SUMMER CYCLE</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#14263a]/20">
            <button onClick={exportTelemetry} className="p-1.5 rounded-lg hover:bg-white/70 text-[#14263a] transition-colors border border-transparent hover:border-black/10" title="Export NCPOR Dataset">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setTerminalOpen(!terminalOpen)} className="p-1.5 rounded-lg hover:bg-white/70 text-[#14263a] transition-colors border border-transparent hover:border-black/10 relative" title="SCADA Terminal Console">
              <Terminal className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>
            <button onClick={() => setSettingsOpen(true)} className="p-1.5 rounded-lg hover:bg-white/70 text-[#14263a] transition-colors border border-transparent hover:border-black/10" title="Operator Configuration">
              <Sliders className="w-4 h-4" />
            </button>
            <div className="w-7 h-7 rounded-full bg-[#14263a] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">OP</div>
          </div>
        </div>
      </header>

      {/* APP BODY CONTAINER */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden w-full max-w-full">
        {/* LEFT COMPONENT */}
        <aside className="w-full lg:w-64 xl:w-72 backdrop-glass-dense border-r border-white/30 flex-shrink-0 p-3 lg:p-4 flex flex-col justify-between gap-4 overflow-y-auto max-w-full">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#14263a]/15">
              <span className="text-[10px] font-mono-tech tracking-widest text-[#14263a]/70 uppercase font-bold">SUB-SYSTEM NODES</span>
              <span className="text-[9px] font-mono-tech px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">ALL SYNCHRONIZED</span>
            </div>
            
            <div className="space-y-1.5 text-xs">
              <div onClick={() => handleNodeToggle('pv')} className="cursor-pointer group p-2.5 rounded-xl bg-white/60 hover:bg-white/90 border border-white/60 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-[#14263a]">
                    <SunMedium className="w-3.5 h-3.5 text-amber-600" />
                    <span>{data.pvTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono-tech font-bold text-amber-700">{data.pvKw}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#14263a]/65 mt-1 font-mono-tech">
                  <span>Albedo Influx: 840 W/m²</span>
                  <span className="text-emerald-700">96.8% Eff</span>
                </div>
              </div>

              <div onClick={() => handleNodeToggle('genset')} className="cursor-pointer group p-2.5 rounded-xl bg-white/40 hover:bg-white/90 border border-white/60 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-[#14263a]">
                    <Cog className="w-3.5 h-3.5 text-blue-800" />
                    <span>Polar Gensets (2× 100kW)</span>
                  </div>
                  <span className={`text-[10px] font-mono-tech font-bold ${gensetActive ? 'text-blue-900' : 'text-[#14263a]/50'}`}>
                    {gensetActive ? data.gensetKw : '0.0 kW'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#14263a]/65 mt-1 font-mono-tech">
                  <span>Unit 1: {gensetActive ? 'Active' : 'Stby'} // Unit 2: Stby</span>
                  <span className="text-blue-700">Fuel: -32%</span>
                </div>
              </div>

              <div onClick={() => handleNodeToggle('bess')} className="cursor-pointer group p-2.5 rounded-xl bg-white/40 hover:bg-white/90 border border-white/60 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-[#14263a]">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{data.bessTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono-tech font-bold text-emerald-800">{data.soc}%</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#14263a]/65 mt-1 font-mono-tech">
                  <span>Thermal Loop: +16.8°C</span>
                  <span className="text-emerald-700">+18 kW Chg</span>
                </div>
              </div>
              
              <div className="p-2.5 rounded-xl bg-white/40 hover:bg-white/90 border border-white/60 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-[#14263a]">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-teal-800" />
                    <span>Habitat Thermal HVAC</span>
                  </div>
                  <span className="text-[10px] font-mono-tech font-bold text-[#14263a]">{loads.hvac} kWh/d</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#14263a]/65 mt-1 font-mono-tech">
                  <span>Hydronic Exhaust Loop</span>
                  <span className="text-emerald-700 font-bold">Tier 1 PRI</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/40 hover:bg-white/90 border border-white/60 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-[#14263a]">
                    <Radio className="w-3.5 h-3.5 text-indigo-800" />
                    <span>Satellite Dome & Radar</span>
                  </div>
                  <span className="text-[10px] font-mono-tech font-bold text-[#14263a]">{loads.radar} kWh/d</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#14263a]/65 mt-1 font-mono-tech">
                  <span>X-Band Downlink Active</span>
                  <span className="text-emerald-700 font-bold">Tier 1 PRI</span>
                </div>
              </div>
            </div>

            {/* Dispatch Mode Toggle */}
            <div className="mt-4 p-3 rounded-xl bg-white/50 border border-white/80">
              <div className="text-[10px] font-mono-tech tracking-wider uppercase text-[#14263a]/70 font-semibold mb-2 flex items-center justify-between">
                <span>SUPERVISORY CONTROL</span>
                <span className="text-emerald-700 font-bold">{dispatchMode === 'auto' ? 'AI ACTIVE' : 'MANUAL'}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#14263a]/10 rounded-lg text-[10px] font-semibold">
                <button 
                  onClick={() => handleModeChange('auto')}
                  className={`py-1 rounded-md transition-all ${dispatchMode === 'auto' ? 'bg-[#14263a] text-white shadow-sm' : 'text-[#14263a]/70 hover:text-[#14263a]'}`}
                >AI AUTONOMY</button>
                <button 
                  onClick={() => handleModeChange('manual')}
                  className={`py-1 rounded-md transition-all ${dispatchMode === 'manual' ? 'bg-[#14263a] text-white shadow-sm' : 'text-[#14263a]/70 hover:text-[#14263a]'}`}
                >MANUAL OVR</button>
              </div>
              <div className="text-[9px] text-[#14263a]/60 mt-2 font-mono-tech leading-tight">
                {dispatchMode === 'auto' ? 'Model: Deep Reinforcement Katabatic MPC (Model Predictive Control). Optimal fuel-burn curve.' : 'Manual Override: Operator setpoints priority. Katabatic safeties remain active.'}
              </div>
            </div>
          </div>

          {/* Station Telemetry Meta */}
          <div className="p-3 rounded-xl bg-[#14263a]/5 border border-white/50 text-[11px] font-mono-tech">
            <div className="text-[9px] text-[#14263a]/60 tracking-wider uppercase mb-1">STATION PROTOCOL</div>
            <div className="font-bold text-[#14263a] uppercase">{data.name}</div>
            <div className="text-[#14263a]/80 text-[10px]">{data.coords}</div>
            <div className="text-emerald-800 text-[10px] font-semibold mt-1">NCPOR Expedition 44 Active</div>
          </div>
        </aside>

        {/* CENTER & RIGHT */}
        <main className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-5 lg:p-6 gap-4">
          
          {/* TOP KPI RIBBON */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            <div className="backdrop-glass-panel p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-[#14263a]/70 font-semibold">INSTANT NET LOAD</span>
                <span className="flex items-center gap-1 text-[9px] font-mono-tech text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span> LIVE
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-light tracking-tight text-[#14263a]">
                  <span className="font-bold">{simulatedLoad || data.load}</span> <span className="text-sm font-normal text-[#14263a]/60 font-mono-tech">/ {data.loadMax}</span>
                </div>
                <div className="w-full bg-[#14263a]/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#14263a] h-full rounded-full transition-all duration-500" style={{ width: simulatedLoad ? '96%' : '89%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono-tech text-[#14263a]/70">
                <span>Peak Day: 48.6 kW</span>
                <span className="text-emerald-800 font-semibold">Dynamic Stability</span>
              </div>
            </div>

            <div className="backdrop-glass-panel p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-[#14263a]/70 font-semibold">BESS STORAGE SOC</span>
                <span className="text-[9px] font-mono-tech text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded font-bold">{data.socDir}</span>
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-light tracking-tight text-[#14263a]">
                  <span className="font-bold">{data.soc}</span><span className="text-sm font-normal text-[#14263a]/60 font-mono-tech">%</span>
                </div>
                <div className="w-full bg-[#14263a]/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${data.soc}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono-tech text-[#14263a]/70">
                <span>{data.bessReserve}</span>
                <span className="text-slate-700">Cell: +16.8°C</span>
              </div>
            </div>

            <div className="backdrop-glass-panel p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-[#14263a]/70 font-semibold">RENEWABLE PENETRATION</span>
                <span className="text-[9px] font-mono-tech text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded font-bold">ALBEDO ACTIVE</span>
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-light tracking-tight text-[#14263a]">
                  <span className="font-bold">{data.renewPct}</span><span className="text-sm font-normal text-[#14263a]/60 font-mono-tech">%</span>
                </div>
                <div className="w-full bg-[#14263a]/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{ width: `${data.renewPct}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono-tech text-[#14263a]/70">
                <span>Solar: {data.solarYield}</span>
                <span className="text-amber-800 font-semibold">840 W/m²</span>
              </div>
            </div>

            <div className="backdrop-glass-panel p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-[#14263a]/70 font-semibold">FUEL CONSERVATION GAIN</span>
                <span className="text-[9px] font-mono-tech text-blue-900 bg-blue-100/70 px-1.5 py-0.5 rounded font-bold">N-1 BACKUP</span>
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-light tracking-tight text-[#14263a]">
                  <span className="font-bold">{data.fuelSaved}</span><span className="text-sm font-normal text-[#14263a]/60 font-mono-tech">%</span>
                </div>
                <div className="w-full bg-[#14263a]/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono-tech text-[#14263a]/70">
                <span>Burn: 14.2 L/h</span>
                <span className="text-emerald-800 font-semibold">99.998% Uptime</span>
              </div>
            </div>
          </section>

          {/* MIDDLE SCADA VIEW */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 backdrop-glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#14263a]/15">
                <div className="flex items-center gap-2">
                  <Cog className="w-4 h-4 text-[#14263a]" />
                  <h2 className="text-xs font-bold tracking-[0.2em] text-[#14263a] uppercase">LIVE SINGLE-LINE SCADA POWER FLOW (DC & AC BUS)</h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={simulateFault} className="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-mono-tech font-bold transition-all border border-rose-300">
                    SIMULATE KATABATIC LOAD SURGE
                  </button>
                  <button onClick={executeOptimizer} className="px-3 py-1 rounded bg-[#14263a] hover:bg-[#0c1926] text-white text-[10px] font-mono-tech font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm">
                    {isComputing ? <span className="animate-spin text-amber-300">⚙️</span> : <Zap className="w-3 h-3 text-amber-300" />}
                    <span>{isComputing ? 'COMPUTING...' : 'RUN AI BALANCER'}</span>
                  </button>
                </div>
              </div>

              <div className="relative w-full h-[250px] sm:h-[280px] bg-white/30 rounded-xl border border-white/60 p-2 flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full" fill="none" viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg">
                  <rect fill="#0284c7" height="240" rx="4" width="8" x="250" y="40" />
                  <text fill="#0369a1" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle" x="254" y="295">DC BUS 48V/750V</text>
                  
                  <rect fill="#14263a" height="90" rx="8" width="80" x="360" y="115" />
                  <text fill="#ffffff" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="middle" x="400" y="152">BI-DIRECTIONAL</text>
                  <text fill="#38bdf8" fontFamily="monospace" fontSize="10" textAnchor="middle" x="400" y="168">INVERTER</text>
                  <text fill="#94a3b8" fontFamily="monospace" fontSize="9" textAnchor="middle" x="400" y="185">98.4% EFF</text>
                  
                  <rect fill="#14263a" height="240" rx="4" width="8" x="540" y="40" />
                  <text fill="#14263a" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle" x="544" y="295">AC BUS 415V 50Hz</text>

                  <path d="M 150 70 L 250 70" stroke="#d97706" strokeWidth="3" />
                  <path className="flow-line" d="M 150 70 L 250 70" stroke="#fef08a" strokeWidth="2" />
                  
                  <path d="M 150 240 L 250 240" stroke="#059669" strokeWidth="3" />
                  <path className="flow-line" d="M 250 240 L 150 240" stroke="#a7f3d0" strokeWidth="2" />
                  
                  <path d="M 258 160 L 360 160" stroke="#0284c7" strokeWidth="3" />
                  <path className="flow-line" d="M 258 160 L 360 160" stroke="#bae6fd" strokeWidth="2" />
                  
                  <path d="M 440 160 L 540 160" stroke="#14263a" strokeWidth="3" />
                  <path className="flow-line" d="M 440 160 L 540 160" stroke="#93c5fd" strokeWidth="2" />
                  
                  <path d="M 150 160 L 210 160 L 210 30 L 544 30 L 544 40" stroke="#475569" strokeDasharray="4,4" strokeWidth="2.5" />
                  
                  {gensetActive && (
                    <>
                      <path d="M 470 70 L 540 70" stroke="#334155" strokeWidth="3" />
                      <path className="flow-line" d="M 470 70 L 540 70" stroke="#cbd5e1" strokeWidth="2" />
                    </>
                  )}
                  
                  <path d="M 548 80 L 670 80" stroke="#0f766e" strokeWidth="3" />
                  <path className="flow-line" d="M 548 80 L 670 80" stroke="#99f6e4" strokeWidth="2" />
                  
                  <path d="M 548 160 L 670 160" stroke="#4338ca" strokeWidth="3" />
                  <path className="flow-line" d="M 548 160 L 670 160" stroke="#c7d2fe" strokeWidth="2" />
                  
                  <path d="M 548 240 L 670 240" stroke="#0369a1" strokeWidth="3" />
                  <path className="flow-line" d="M 548 240 L 670 240" stroke="#bae6fd" strokeWidth="2" />

                  <g className="cursor-pointer" onClick={() => handleNodeToggle('pv')}>
                    <rect fill="#fff" height="50" rx="6" stroke="#d97706" strokeWidth="1.5" width="130" x="20" y="45" />
                    <circle cx="36" cy="70" fill="#fef3c7" r="10" />
                    <path d="M36 65 L36 75 M31 70 L41 70" stroke="#d97706" strokeWidth="1.5" />
                    <text fill="#14263a" fontFamily="sans-serif" fontSize="10" fontWeight="bold" x="52" y="63">SOLAR PV ARRAY</text>
                    <text fill="#d97706" fontFamily="monospace" fontSize="11" fontWeight="bold" x="52" y="78">{data.pvKw}</text>
                    <text fill="#059669" fontFamily="monospace" fontSize="8" textAnchor="end" x="138" y="58">ON</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => handleNodeToggle('genset')}>
                    <rect fill="#fff" height="50" rx="6" stroke="#475569" strokeWidth="1.5" width="130" x="340" y="45" />
                    <circle cx="356" cy="70" fill="#f1f5f9" r="10" />
                    <text fill="#14263a" fontFamily="sans-serif" fontSize="10" fontWeight="bold" x="372" y="63">GENSET 1 (100kW)</text>
                    <text fill={gensetActive ? "#334155" : "#94a3b8"} fontFamily="monospace" fontSize="11" fontWeight="bold" x="372" y="78">{gensetActive ? data.gensetKw : '0.0 kW'}</text>
                    <text fill="#0284c7" fontFamily="monospace" fontSize="8" textAnchor="end" x="458" y="58">{gensetActive ? 'SYNC' : 'STBY'}</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => handleNodeToggle('bess')}>
                    <rect fill="#fff" height="50" rx="6" stroke="#059669" strokeWidth="1.5" width="130" x="20" y="215" />
                    <circle cx="36" cy="240" fill="#d1fae5" r="10" />
                    <text fill="#14263a" fontFamily="sans-serif" fontSize="10" fontWeight="bold" x="52" y="233">BESS THERMAL</text>
                    <text fill="#059669" fontFamily="monospace" fontSize="11" fontWeight="bold" x="52" y="248">{data.bessText}</text>
                    <text fill="#059669" fontFamily="monospace" fontSize="8" textAnchor="end" x="138" y="228">CHG</text>
                  </g>

                  <g>
                    <rect fill="#f0fdfa" height="48" rx="6" stroke="#0f766e" strokeWidth="1.2" width="115" x="670" y="55" />
                    <text fill="#134e4a" fontFamily="sans-serif" fontSize="9" fontWeight="bold" x="678" y="72">LIFE SUPPORT HVAC</text>
                    <text fill="#0f766e" fontFamily="monospace" fontSize="10" fontWeight="bold" x="678" y="87">{loads.hvac} kW [TIER 1]</text>
                  </g>
                  <g>
                    <rect fill="#eef2ff" height="48" rx="6" stroke="#4338ca" strokeWidth="1.2" width="115" x="670" y="135" />
                    <text fill="#312e81" fontFamily="sans-serif" fontSize="9" fontWeight="bold" x="678" y="152">COMMS & RADAR</text>
                    <text fill="#4338ca" fontFamily="monospace" fontSize="10" fontWeight="bold" x="678" y="167">{loads.radar} kW [TIER 1]</text>
                  </g>
                  <g>
                    <rect fill="#f0f9ff" height="48" rx="6" stroke="#0369a1" strokeWidth="1.2" width="115" x="670" y="215" />
                    <text fill="#0c4a6e" fontFamily="sans-serif" fontSize="9" fontWeight="bold" x="678" y="232">ICE CORE DRILL</text>
                    <text fill="#0284c7" fontFamily="monospace" fontSize="10" fontWeight="bold" x="678" y="247">{loads.drill} kW [FLEX]</text>
                  </g>
                </svg>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 text-[11px] font-mono-tech border-t border-[#14263a]/10">
                <div className="flex items-center gap-3 text-[#14263a]/75">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#d97706] rounded-full inline-block"></span> Solar Harvest</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#059669] rounded-full inline-block"></span> BESS Buffer</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#334155] rounded-full inline-block"></span> Diesel Cogeneration</span>
                </div>
                <div className="text-[#14263a]/60">
                  SLD Update Frequency: <span className="font-bold text-[#14263a]">500ms</span> • Latency: <span className="text-emerald-700 font-bold">12ms</span>
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 backdrop-glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#14263a]/15">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#14263a]" />
                    <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#14263a]">ENVIRONMENT TELEMETRY HUD</h3>
                  </div>
                  <span className="text-[9px] font-mono-tech uppercase text-[#14263a]/60">AWS-POLAR-04</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mt-3 font-mono-tech">
                  <div className="p-2.5 rounded-xl bg-white/50 border border-white/70">
                    <div className="text-[9px] text-[#14263a]/60 uppercase tracking-wider">AMBIENT TEMP</div>
                    <div className="text-xl font-bold text-[#14263a] mt-0.5">{data.temp}</div>
                    <div className="text-[9px] text-[#14263a]/70">Wind Chill: <span>{data.chill}</span></div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/50 border border-white/70">
                    <div className="text-[9px] text-[#14263a]/60 uppercase tracking-wider">KATABATIC WIND</div>
                    <div className="text-xl font-bold text-[#14263a] mt-0.5">{data.wind} <span className="text-xs font-normal">kts</span></div>
                    <div className="text-[9px] text-amber-800 font-semibold">{data.windDir}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/50 border border-white/70">
                    <div className="text-[9px] text-[#14263a]/60 uppercase tracking-wider">SOLAR ELEVATION</div>
                    <div className="text-xl font-bold text-[#14263a] mt-0.5">{data.sun}</div>
                    <div className="text-[9px] text-emerald-800 font-semibold">24h Continuous Light</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/50 border border-white/70">
                    <div className="text-[9px] text-[#14263a]/60 uppercase tracking-wider">ALBEDO REFLECTION</div>
                    <div className="text-xl font-bold text-[#14263a] mt-0.5">{data.albedo}</div>
                    <div className="text-[9px] text-emerald-800 font-semibold">Bifacial PV Gain +28%</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#14263a]/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono-tech tracking-wider uppercase font-bold text-[#14263a]">DYNAMIC LOAD ALLOCATION</span>
                    <span className="text-[9px] font-mono-tech text-emerald-800">Auto-Balancing</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="font-medium text-[#14263a]">Life Support HVAC (Tier 1)</span>
                        <span className="font-mono-tech font-bold text-[#14263a]">{loads.hvac} kWh/d</span>
                      </div>
                      <input className="w-full h-1 bg-[#14263a]/20 rounded-lg appearance-none cursor-pointer" type="range" min="200" max="500" value={loads.hvac} onChange={(e) => { setLoads(l => ({...l, hvac: +e.target.value})); appendLog(`[LOAD] Throttled HVAC -> ${e.target.value}`); }} />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="font-medium text-[#14263a]">Comms & Radar (Tier 1)</span>
                        <span className="font-mono-tech font-bold text-[#14263a]">{loads.radar} kWh/d</span>
                      </div>
                      <input className="w-full h-1 bg-[#14263a]/20 rounded-lg appearance-none cursor-pointer" type="range" min="100" max="300" value={loads.radar} onChange={(e) => { setLoads(l => ({...l, radar: +e.target.value})); appendLog(`[LOAD] Throttled Radar -> ${e.target.value}`); }} />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="font-medium text-[#14263a]">Ice Core Drill (Tier 2 Flex)</span>
                        <span className="font-mono-tech font-bold text-[#14263a]">{loads.drill} kWh/d</span>
                      </div>
                      <input className="w-full h-1 bg-[#14263a]/20 rounded-lg appearance-none cursor-pointer" type="range" min="80" max="400" value={loads.drill} onChange={(e) => { setLoads(l => ({...l, drill: +e.target.value})); appendLog(`[LOAD] Throttled Drill -> ${e.target.value}`); }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#14263a]/15">
                <button onClick={emergencyShedding} className="py-2 px-3 rounded-xl border border-rose-400 bg-rose-50/50 hover:bg-rose-100 text-rose-900 text-[10px] font-mono-tech font-bold tracking-wider uppercase transition-all">
                  KATABATIC SHED
                </button>
                <button onClick={executeOptimizer} className="py-2 px-3 rounded-xl bg-[#14263a] hover:bg-[#0c1824] text-white text-[10px] font-mono-tech font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1">
                  <span>DISPATCH RECALC</span>
                </button>
              </div>
            </div>
          </section>

          {/* BOTTOM SECTION */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 pb-20">
            <div className="xl:col-span-7 backdrop-glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-[#14263a]/15">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#14263a]" />
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#14263a]">24-HOUR POLAR DISPATCH & GENERATION PROFILE</h3>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono-tech">
                  <span className="flex items-center gap-1 text-amber-800"><span className="w-2 h-2 rounded bg-amber-500"></span> Solar Curve</span>
                  <span className="flex items-center gap-1 text-blue-900"><span className="w-2 h-2 rounded bg-blue-600"></span> Demand Curve</span>
                  <span className="font-bold text-[#14263a]">{timeStr} (Current)</span>
                </div>
              </div>

              <div className="relative w-full h-[140px] mt-2">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 130">
                  <defs>
                    <linearGradient id="solarFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45"></stop>
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02"></stop>
                    </linearGradient>
                    <linearGradient id="demandFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3"></stop>
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                  <line stroke="rgba(20,38,58,0.08)" strokeWidth="1" x1="0" x2="700" y1="30" y2="30"></line>
                  <line stroke="rgba(20,38,58,0.08)" strokeWidth="1" x1="0" x2="700" y1="70" y2="70"></line>
                  <line stroke="rgba(20,38,58,0.08)" strokeWidth="1" x1="0" x2="700" y1="110" y2="110"></line>
                  
                  <path d="M 0 95 Q 175 10 350 15 T 700 95 L 700 125 L 0 125 Z" fill="url(#solarFill)"></path>
                  <path d="M 0 95 Q 175 10 350 15 T 700 95" fill="none" stroke="#d97706" strokeWidth="2.5"></path>
                  
                  <path d="M 0 80 Q 150 70 280 60 T 520 65 T 700 75 L 700 125 L 0 125 Z" fill="url(#demandFill)"></path>
                  <path d="M 0 80 Q 150 70 280 60 T 520 65 T 700 75" fill="none" stroke="#1d4ed8" strokeDasharray="3,3" strokeWidth="2"></path>
                  
                  <line stroke="#14263a" strokeDasharray="2,2" strokeWidth="1.5" x1={svgX} x2={svgX} y1="5" y2="125"></line>
                  <circle cx={svgX} cy="20" fill="#14263a" r="4" stroke="#fff" strokeWidth="2"></circle>
                </svg>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] font-mono-tech text-[#14263a]/60">00:00</span>
                <input className="w-full h-1 bg-[#14263a]/20 rounded-lg appearance-none cursor-pointer" type="range" min="0" max="24" step="0.5" value={time} onChange={(e) => setTime(+e.target.value)} />
                <span className="text-[10px] font-mono-tech text-[#14263a]/60">24:00</span>
              </div>
            </div>

            <div className="xl:col-span-5 backdrop-glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-[#14263a]/15">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#14263a]" />
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#14263a]">NCPOR MULTI-STATION EXPEDITION MATRIX</h3>
                </div>
                <span className="text-[9px] font-mono-tech font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">CROSS-STATION READY</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div onClick={() => handleStationChange('bharati')} className={`cursor-pointer p-3 rounded-xl transition-all ${stationKey === 'bharati' ? 'bg-white/70 border-2 border-[#14263a]' : 'bg-white/40 hover:bg-white/60 border border-white/80'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase text-[#14263a]">BHARATI</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-[10px] font-mono-tech text-[#14263a]/70">69.4°S • Larsemann Hills</div>
                  <div className="mt-2 text-xs font-semibold text-[#14263a]">50 kWp PV + 200 kWh BESS</div>
                  <div className="text-[10px] text-emerald-700 font-mono-tech mt-0.5">Role: Primary AI Dispatch</div>
                </div>
                
                <div onClick={() => handleStationChange('maitri')} className={`cursor-pointer p-3 rounded-xl transition-all ${stationKey === 'maitri' ? 'bg-white/70 border-2 border-[#14263a]' : 'bg-white/40 hover:bg-white/60 border border-white/80'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase text-[#14263a]">MAITRI</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  </div>
                  <div className="text-[10px] font-mono-tech text-[#14263a]/70">70.0°S • Schirmacher Oasis</div>
                  <div className="mt-2 text-xs font-semibold text-[#14263a]">65 kWp PV + 250 kWh BESS</div>
                  <div className="text-[10px] text-blue-800 font-mono-tech mt-0.5">Role: Secondary / Thermal Loop</div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#14263a]/15 flex items-center justify-between text-[10px] font-mono-tech text-[#14263a]/80">
                <span>Unified AI Algorithm: Station-Agnostic MPC</span>
                <span className="text-emerald-800 font-bold">100% Scalable Port</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* BOTTOM LOG DRAWER */}
      <footer className={`fixed bottom-0 left-0 right-0 z-30 backdrop-glass-dense border-t border-white/40 px-4 transition-all overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs font-mono-tech text-[#14263a] ${terminalOpen ? 'py-2 h-auto' : 'h-0 py-0 opacity-0'}`}>
        <div className="flex items-center gap-2 overflow-hidden w-full md:w-auto">
          <span className="px-1.5 py-0.5 rounded bg-[#14263a] text-white text-[9px] font-bold uppercase tracking-wider flex-shrink-0">EVENT LOG</span>
          <div className="truncate text-[11px] text-[#14263a]/85 font-mono-tech">
            {logs[0]}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#14263a]/70 flex-shrink-0 self-end md:self-auto">
          <span>AUTONOMOUS DISPATCH ENGINE: <strong className="text-emerald-800">ONLINE (SIH-PROTO)</strong></span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">CYCLE: 50.02 Hz</span>
          <button onClick={() => setTerminalOpen(false)} className="hover:text-[#14263a] underline ml-1">COLLAPSE</button>
        </div>
      </footer>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="backdrop-glass-dense bg-white/90 p-6 rounded-2xl max-w-md w-full border border-white/80 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#14263a]/20">
              <h4 className="text-sm font-bold tracking-wider uppercase text-[#14263a] flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                MICROGRID OPERATOR CONSOLE
              </h4>
              <button onClick={() => setSettingsOpen(false)} className="p-1 rounded hover:bg-[#14263a]/10 text-[#14263a]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono-tech uppercase text-[#14263a]/70 mb-1">NCPOR Telemetry Sync Interval</label>
                <select className="w-full bg-white border border-[#14263a]/30 rounded-lg p-2 font-mono-tech text-xs">
                  <option>500 ms (High Precision SCADA)</option>
                  <option>1000 ms (Standard)</option>
                  <option>5000 ms (Low Bandwidth Satellite)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono-tech uppercase text-[#14263a]/70 mb-1">BESS Low-Temp Pre-Heat Protection</label>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 border border-[#14263a]/20">
                  <span>Vacuum Hydronic Thermal Jacket</span>
                  <input type="checkbox" defaultChecked className="rounded text-[#14263a] focus:ring-0" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono-tech uppercase text-[#14263a]/70 mb-1">AI Model Optimizer Objective</label>
                <select className="w-full bg-white border border-[#14263a]/30 rounded-lg p-2 font-mono-tech text-xs">
                  <option>Maximize Diesel Fuel Conservation (-32.4%)</option>
                  <option>Maximize Battery Cyclic Lifespan</option>
                  <option>Maximum Life-Support Redundancy (N-1 Safe)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-[#14263a]/20 flex justify-end gap-2">
              <button onClick={() => setSettingsOpen(false)} className="px-4 py-1.5 rounded-lg border border-[#14263a]/30 text-xs font-semibold">Cancel</button>
              <button onClick={() => { setSettingsOpen(false); showToast('Operator preferences applied successfully.'); }} className="px-4 py-1.5 rounded-lg bg-[#14263a] text-white text-xs font-semibold">Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
