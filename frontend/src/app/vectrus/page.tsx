'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useVectrusMarkets } from '../../hooks/useVectrusMarkets';

export default function VectrusMarkets() {
  const router = useRouter();
  const [riskThreshold, setRiskThreshold] = useState(8.5);
  const [killArmed, setKillArmed] = useState(false);
  const [killHalted, setKillHalted] = useState(false);
  const [rebalancing, setRebalancing] = useState(false);
  const [throttleActive, setThrottleActive] = useState(false);
  const [smartRebalancing, setSmartRebalancing] = useState(false);
  const [settling, setSettling] = useState(false);
  const [toast, setToast] = useState({ visible: false, text: '' });

  // Connect to real backend
  const { marketData, connected, executeTrade } = useVectrusMarkets();

  // Use live data if available
  const liveBatterySoC = marketData?.batterySoC || 76.4;
  const liveGridLoad = marketData?.gridLoad || 300;
  const liveSolarGen = marketData?.solarGen || 18.4;
  const liveSpread = marketData ? (Object.values(marketData.prices)[0] - 28.40).toFixed(2) : '41.60';

  const showToast = (text: string) => {
    setToast({ visible: true, text });
    setTimeout(() => setToast({ visible: false, text: '' }), 3500);
  };

  const handleForceCycle = async () => {
    setRebalancing(true);
    showToast('Executing rebalance trade: 5 MWh discharge cycle...');
    const result = await executeTrade('SELL', 5);
    setTimeout(() => {
      setRebalancing(false);
      if (result.success) {
        showToast(`Rebalance complete! New SoC: ${result.data.newSoC.toFixed(1)}%`);
      } else {
        showToast('Rebalance failed: ' + result.error);
      }
    }, 800);
  };

  const handleKillDispatch = () => {
    if (!killArmed) {
      setKillArmed(true);
      showToast('⚠️ Kill dispatch armed. Click again to confirm halt.');
    } else {
      setKillHalted(true);
      showToast('🛑 All dispatch operations halted. Manual override required.');
    }
  };

  const handleSimulateThrottle = () => {
    setThrottleActive(!throttleActive);
    showToast(throttleActive ? 'Cable throttle removed. Full 1,400 MW capacity restored.' : '⚠️ Simulating cable throttle: -300MW capacity reduction.');
  };

  const handleSmartRebalance = async () => {
    setSmartRebalancing(true);
    showToast('AI optimizer analyzing spread arbitrage opportunities...');
    const result = await executeTrade('BUY', 3);
    setTimeout(() => {
      setSmartRebalancing(false);
      if (result.success) {
        showToast(`Smart rebalance executed! Purchased 3 MWh. New SoC: ${result.data.newSoC.toFixed(1)}%`);
      } else {
        showToast('Smart rebalance failed: ' + result.error);
      }
    }, 1000);
  };

  const handleSettleNow = () => {
    setSettling(true);
    showToast('Initiating spot market settlement with SHA-256 hash verification...');
    setTimeout(() => {
      setSettling(false);
      showToast('✓ Settlement batch #894,116 cleared. All CFE certificates matched.');
    }, 1200);
  };

  return (
    <>
      {/* Toast Notification */}
      <div className={`fixed top-20 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-3 px-4 py-3 bg-[#112233] text-white text-xs rounded-xl shadow-2xl border border-white/20 ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-96 opacity-0'}`}>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
        <span className="font-mono">{toast.text}</span>
      </div>

    <div className="flex flex-col w-full">
        {/* Top Market Corridor & Telemetry Sub-Deck */}
        <div className="w-full bg-surface-container-low px-space-md py-space-xs shadow-sm flex flex-wrap items-center justify-between gap-panel-gap">
        <div className="flex items-center gap-space-sm">
          {/* Back Button */}
          <button onClick={() => router.back()} className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container-highest hover:bg-on-surface-variant hover:text-on-primary rounded transition-all group border border-outline-variant shadow-sm">
            <ArrowLeft className="w-4 h-4 text-on-surface group-hover:text-on-primary group-hover:-translate-x-0.5 transition-all" />
            <span className="font-label-code text-label-code text-on-surface group-hover:text-on-primary uppercase font-bold">Back</span>
          </button>
          <div className="h-5 w-px bg-outline"></div>
          <div className="flex items-center gap-space-2xs">
            <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-ping" />
            <span className="font-label-code text-label-code text-on-surface uppercase font-bold tracking-wider">MKT//DISPATCH CORE</span>
          </div>
          {/* Segmented Corridor Selector */}
          <div className="flex items-center bg-surface-container p-space-2xs rounded flex-wrap">
            <button className="px-space-sm py-space-2xs rounded bg-surface-container-lowest text-primary font-label-code text-label-code font-bold shadow-sm flex items-center gap-space-xs" type="button">
              <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container" />
              <span>NO2 (NORWAY HYDRO) ⇄ DE-LU</span>
              <span className="px-space-xs py-0.5 bg-surface-container text-on-secondary-container rounded text-micro-caption font-bold">+€41.60</span>
            </button>
            <button className="px-space-sm py-space-2xs text-on-surface-variant hover:text-on-surface font-label-code text-label-code transition-colors flex items-center gap-space-xs" type="button">
              <span className="w-1.5 h-1.5 rounded-full bg-outline" />
              <span>NORDIC SPOT (FI ⇄ SE3)</span>
              <span className="text-micro-caption text-on-surface-variant">[STDBY]</span>
            </button>
            <button className="px-space-sm py-space-2xs text-on-surface-variant hover:text-on-surface font-label-code text-label-code transition-colors flex items-center gap-space-xs" type="button">
              <span className="w-1.5 h-1.5 rounded-full bg-outline" />
              <span>ALPINE PUMP (CH ⇄ IT)</span>
              <span className="text-micro-caption text-on-surface-variant">+€14.20</span>
            </button>
          </div>
        </div>
        {/* Quick Telemetry Indicators */}
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container-lowest rounded shadow-sm">
            <span className="font-label-code text-micro-caption text-on-surface-variant uppercase">NordPool Latency</span>
            <span className="font-telemetry-data text-telemetry-data text-on-tertiary-container font-bold">3.8ms // SYNCED</span>
          </div>
          <div className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container-lowest rounded shadow-sm">
            <span className="font-label-code text-micro-caption text-on-surface-variant uppercase">EPEX Parity</span>
            <span className="font-telemetry-data text-telemetry-data text-on-surface font-bold">99.82%</span>
          </div>
          <div className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container-lowest rounded shadow-sm">
            <span className="font-label-code text-micro-caption text-on-surface-variant uppercase">24/7 CFE Match</span>
            <span className="font-telemetry-data text-telemetry-data text-on-tertiary-container font-bold">99.4%</span>
          </div>
          <div className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container-lowest rounded shadow-sm">
            <span className="font-label-code text-micro-caption text-on-surface-variant uppercase">Clearing Rate</span>
            <span className="font-telemetry-data text-telemetry-data text-secondary font-bold">4.82 GW/h</span>
          </div>
          <div className="flex items-center gap-space-2xs bg-surface-container px-space-xs py-space-2xs rounded">
            <span className="material-symbols-outlined text-[14px] text-on-surface">shield</span>
            <span className="font-label-code text-micro-caption text-on-surface uppercase">ALGO-KILL READY</span>
          </div>
          {/* Backend Connection Status */}
          <div className={`flex items-center gap-space-2xs px-space-xs py-space-2xs rounded ${
            connected ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'}`}></span>
            <span className="font-label-code text-micro-caption uppercase font-bold">{connected ? 'MARKET LIVE' : 'OFFLINE'}</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Split Arbitrage Terminal */}
      <div className="w-full p-panel-gap grid grid-cols-12 gap-panel-gap">

        {/* LEFT COLUMN: Autonomous Engine + Portfolio (Col 1-3) */}
        <aside className="col-span-12 xl:col-span-3 flex flex-col gap-panel-gap">
          {/* Algorithmic Control Hub */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container" />
                <span className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">AUTONOMOUS ENGINE</span>
              </div>
              <span className="px-space-xs py-space-2xs bg-tertiary-container text-tertiary-fixed rounded font-label-code text-micro-caption uppercase font-bold">ACTIVE LOCK</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Dynamic multi-market bidding daemon active. Frequency regulation priority locked with automated sub-hourly spread execution.
            </p>
            {/* Risk Margin Threshold Slider */}
            <div className="bg-surface-container p-space-sm rounded flex flex-col gap-space-xs">
              <div className="flex justify-between items-center font-label-code text-label-code">
                <span className="text-on-surface-variant uppercase">Arbitrage Trigger Threshold</span>
                <span className="font-bold text-on-surface">€{riskThreshold.toFixed(2)} / MWh</span>
              </div>
              <input
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer"
                max={25} min={2} step={0.5} type="range"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
              />
              <div className="flex justify-between font-label-code text-micro-caption text-on-surface-variant">
                <span>Aggressive (€2.0)</span>
                <span>Conservative (€25.0)</span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
              <button
                className="h-8 bg-primary text-on-primary rounded font-label-code text-label-code uppercase font-bold hover:bg-on-surface-variant transition-colors flex items-center justify-center gap-space-2xs"
                type="button"
                onClick={handleForceCycle}
              >
                <span className="material-symbols-outlined text-[14px]">{rebalancing ? 'refresh' : 'bolt'}</span>
                <span>{rebalancing ? 'OPTIMIZING...' : 'FORCE CYCLE'}</span>
              </button>
              <button
                className={`h-8 rounded font-label-code text-label-code uppercase font-bold transition-colors flex items-center justify-center gap-space-2xs ${
                  killHalted ? 'bg-surface-container text-on-surface-variant' :
                  killArmed ? 'bg-error text-on-error' :
                  'bg-error-container text-on-error-container hover:bg-error hover:text-on-error'
                }`}
                type="button"
                onClick={handleKillDispatch}
                disabled={killHalted}
              >
                <span className="material-symbols-outlined text-[14px]">{killHalted ? 'check' : killArmed ? 'warning' : 'power_settings_new'}</span>
                <span>{killHalted ? 'DISPATCH HALTED' : killArmed ? 'CONFIRM KILL?' : 'KILL DISPATCH'}</span>
              </button>
            </div>
          </div>

          {/* Portfolio Node Tree */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm flex-1">
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-headline-md text-headline-md uppercase text-on-surface">PORTFOLIO ASSET NODES</span>
              <span className="font-label-code text-label-code text-secondary font-bold">4 ONLINE</span>
            </div>
            {/* Node 1: BESS */}
            <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">battery_charging_full</span>
                  <span className="font-label-code text-label-code text-on-surface font-bold">BESS-CRYO-01</span>
                </div>
                <span className="px-space-xs py-space-2xs bg-surface-container text-on-tertiary-container rounded font-label-code text-micro-caption font-bold">DISCHARGE 84MW</span>
              </div>
              <div className="flex justify-between font-label-code text-micro-caption text-on-surface-variant">
                <span>Capacity: 850 MWh // 1.5C</span>
                <span className="text-on-surface font-bold">SOC {liveBatterySoC.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                <div className="bg-secondary h-full rounded transition-all duration-300" style={{ width: `${liveBatterySoC}%` }} />
              </div>
              <div className="flex justify-between font-telemetry-data text-micro-caption text-on-surface-variant">
                <span>Cell Temp: 14.2°C (Cryo)</span>
                <span className="text-on-tertiary-container">Arbitrage Yield: +€34,920</span>
              </div>
            </div>
            {/* Node 2: Hydro Reservoir */}
            <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">water</span>
                  <span className="font-label-code text-label-code text-on-surface font-bold">HYD-RESERVOIR-NO2</span>
                </div>
                <span className="px-space-xs py-space-2xs bg-surface-container text-secondary rounded font-label-code text-micro-caption font-bold">PUMPING // 120MW</span>
              </div>
              <div className="flex justify-between font-label-code text-micro-caption text-on-surface-variant">
                <span>Virtual Storage: 1,200 MWh</span>
                <span className="text-on-surface font-bold">Head Level: 92.1%</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                <div className="bg-on-secondary-container h-full rounded" style={{ width: '92.1%' }} />
              </div>
              <div className="flex justify-between font-telemetry-data text-micro-caption text-on-surface-variant">
                <span>Marginal Cost: €18.20</span>
                <span className="text-on-surface">Reservoir Vol: 4.8M m³</span>
              </div>
            </div>
            {/* Node 3: Wind PPA */}
            <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">air</span>
                  <span className="font-label-code text-label-code text-on-surface font-bold">PPA-ARCTIC-WIND-08</span>
                </div>
                <span className="px-space-xs py-space-2xs bg-surface-container text-on-tertiary-container rounded font-label-code text-micro-caption font-bold">NOMINAL BASELOAD</span>
              </div>
              <div className="flex justify-between font-label-code text-micro-caption text-on-surface-variant">
                <span>Contract Guarantee: 420 MW</span>
                <span className="text-on-surface font-bold">Gen: 418.6 MW</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                <div className="bg-on-tertiary-container h-full rounded" style={{ width: '99.6%' }} />
              </div>
              <div className="flex justify-between font-telemetry-data text-micro-caption text-on-surface-variant">
                <span>Turbine Fleet Sync: 62/62</span>
                <span>Forecast Error: -0.4%</span>
              </div>
            </div>
            {/* Node 4: GO Minting */}
            <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">verified_user</span>
                  <span className="font-label-code text-label-code text-on-surface font-bold">GO MINTING PROTOCOL</span>
                </div>
                <span className="font-label-code text-micro-caption text-on-tertiary-container font-bold">SHA-256 LIVE</span>
              </div>
              <div className="font-terminal-stream text-micro-caption text-on-surface-variant bg-surface-container p-space-xs rounded truncate">
                0x98f4e2...a17b // MATCHED BLOCK #894,112
              </div>
              <div className="flex justify-between font-telemetry-data text-micro-caption text-on-surface-variant">
                <span>Batch: 15-Min Sub-Hourly</span>
                <span className="text-on-tertiary-container font-bold">Cert. Parity: 100.0%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: KPIs + Intertie Schematic + Orderbook (Col 4-9) */}
        <main className="col-span-12 xl:col-span-6 flex flex-col gap-panel-gap">
          {/* Top KPI Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-panel-gap">
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-label-code text-micro-caption text-on-surface-variant uppercase">Real-Time Spread</span>
                <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">trending_up</span>
              </div>
              <span className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">+€{liveSpread}</span>
              <span className="font-label-code text-micro-caption text-on-tertiary-container font-semibold">PEAK/VALLEY ARBITRAGE</span>
            </div>
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-label-code text-micro-caption text-on-surface-variant uppercase">Clean Clearing</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">cyclone</span>
              </div>
              <span className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">4.82 <span className="text-body-sm font-normal text-on-surface-variant">GW/h</span></span>
              <span className="font-label-code text-micro-caption text-secondary font-semibold">100% HYDRO &amp; WIND</span>
            </div>
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-label-code text-micro-caption text-on-surface-variant uppercase">BESS Efficiency</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">ac_unit</span>
              </div>
              <span className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">98.4%</span>
              <span className="font-label-code text-micro-caption text-on-surface-variant font-semibold">CRYO-COOLED INVERTERS</span>
            </div>
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-label-code text-micro-caption text-on-surface-variant uppercase">Carbon Offset</span>
                <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">eco</span>
              </div>
              <span className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">1,840 <span className="text-body-sm font-normal text-on-surface-variant">t</span></span>
              <span className="font-label-code text-micro-caption text-on-tertiary-container font-semibold">AVOIDED EMISSIONS/DAY</span>
            </div>
          </div>

          {/* Bilateral Flow Schematic */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between border-b pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[18px]">sync_alt</span>
                <span className="font-headline-md text-headline-md uppercase text-on-surface">NORD-GERMAN BILATERAL INTERTIE SCHEMATIC</span>
              </div>
              <div className="flex items-center gap-space-xs font-label-code text-micro-caption text-on-surface-variant">
                <span>NORDLINK DC-SUBSEA // CABLE 01-A</span>
                <span className="px-space-xs py-0.5 bg-surface-container rounded text-on-surface font-bold">525 kV DC</span>
              </div>
            </div>
            {/* Schematic */}
            <div className="relative bg-surface-container-low p-space-md rounded overflow-hidden">
              <div className="grid grid-cols-12 items-center gap-space-sm">
                {/* Source Node: Norway */}
                <div className="col-span-4 bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col gap-space-xs relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code text-label-code text-on-surface font-bold">ZONE NO2 (HYDRO)</span>
                    <span className="w-2 h-2 rounded-full bg-on-tertiary-container" />
                  </div>
                  <div className="font-metric-display text-headline-lg text-on-surface">€28.40 <span className="font-label-code text-micro-caption text-on-surface-variant">/ MWh</span></div>
                  <div className="flex justify-between font-label-code text-micro-caption text-on-surface-variant">
                    <span>Available Surplus:</span>
                    <span className="text-on-surface font-semibold">1,840 MW</span>
                  </div>
                  <div className="flex items-center gap-space-2xs text-micro-caption font-label-code text-on-tertiary-container font-bold">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span> 100% Zero-Carbon
                  </div>
                </div>
                {/* Interconnect Pipe */}
                <div className="col-span-4 flex flex-col items-center justify-center px-space-xs relative">
                  <div className="w-full flex items-center justify-between text-micro-caption font-label-code text-on-surface-variant pb-1">
                    <span>1,176 MW Flow</span>
                    <span className="text-secondary font-bold">84% Cap</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container rounded relative overflow-hidden flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary-container to-secondary opacity-60" />
                    <div className="w-full h-full flex items-center justify-around opacity-80">
                      <span className="w-2 h-1 bg-surface-container-lowest rounded-full animate-ping" />
                      <span className="w-2 h-1 bg-surface-container-lowest rounded-full animate-ping" />
                      <span className="w-2 h-1 bg-surface-container-lowest rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between text-micro-caption font-label-code text-on-surface-variant pt-1">
                    <span>Losses: 1.84%</span>
                    <span className="text-on-tertiary-container font-bold">Sync: +0.01Hz</span>
                  </div>
                </div>
                {/* Sink Node: DE-LU */}
                <div className="col-span-4 bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col gap-space-xs relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code text-label-code text-on-surface font-bold">ZONE DE-LU (LOAD)</span>
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                  </div>
                  <div className="font-metric-display text-headline-lg text-on-surface">€70.00 <span className="font-label-code text-micro-caption text-on-surface-variant">/ MWh</span></div>
                  <div className="flex justify-between font-label-code text-micro-caption text-on-surface-variant">
                    <span>Baseload Deficit:</span>
                    <span className="text-on-surface font-semibold">-2,120 MW</span>
                  </div>
                  <div className="flex items-center gap-space-2xs text-micro-caption font-label-code text-secondary font-bold">
                    <span className="material-symbols-outlined text-[12px]">bolt</span> Peak Demand Hours
                  </div>
                </div>
              </div>
              {/* Schematic Actions */}
              <div className="mt-space-md pt-space-xs flex items-center justify-between bg-surface-container-lowest p-space-xs rounded">
                <div className="flex items-center gap-space-xs">
                  <button
                    className={`px-space-sm py-space-2xs rounded font-label-code text-micro-caption uppercase font-bold transition-colors ${
                      throttleActive ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                    type="button"
                    onClick={handleSimulateThrottle}
                  >
                    {throttleActive ? 'Active Throttle: -300MW [Simulated]' : 'Simulate Cable Throttle (-300MW)'}
                  </button>
                  <button
                    className="px-space-sm py-space-2xs bg-primary text-on-primary hover:bg-on-surface-variant rounded font-label-code text-micro-caption uppercase font-bold transition-colors"
                    type="button"
                    onClick={handleSmartRebalance}
                  >
                    {smartRebalancing ? 'REBALANCING MATRICES...' : 'Trigger Smart Rebalance'}
                  </button>
                </div>
                <div className="font-label-code text-micro-caption text-on-surface-variant">
                  Intertie Line Rating: <span className="text-on-surface font-bold">1,400 MW MAX</span>
                </div>
              </div>
            </div>

            {/* Live Orderbook Ladder */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-headline-md text-headline-md uppercase text-on-surface">HIGH-FREQUENCY ALGORITHMIC ORDERBOOK</span>
                <div className="flex items-center gap-space-xs font-label-code text-micro-caption">
                  <span className="text-on-surface-variant">LATENCY EXEC:</span>
                  <span className="font-bold text-on-tertiary-container">1.2ms</span>
                </div>
              </div>
              <div className="overflow-x-auto bg-surface-container-low rounded">
                <table className="w-full text-left font-label-code text-label-code">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant text-micro-caption border-b">
                      <th className="py-space-2xs px-space-sm">TIME UTC</th>
                      <th className="py-space-2xs px-space-sm">SIDE</th>
                      <th className="py-space-2xs px-space-sm">VOLUME</th>
                      <th className="py-space-2xs px-space-sm">PRICE (NO2)</th>
                      <th className="py-space-2xs px-space-sm">PRICE (DE-LU)</th>
                      <th className="py-space-2xs px-space-sm">SPREAD</th>
                      <th className="py-space-2xs px-space-sm">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-telemetry-data text-telemetry-data">
                    <tr className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-space-2xs px-space-sm text-on-surface-variant">21:54:08.412</td>
                      <td className="py-space-2xs px-space-sm text-on-tertiary-container font-bold">BUY ARB</td>
                      <td className="py-space-2xs px-space-sm font-semibold">120.0 MW</td>
                      <td className="py-space-2xs px-space-sm">€28.35</td>
                      <td className="py-space-2xs px-space-sm">€70.15</td>
                      <td className="py-space-2xs px-space-sm text-on-tertiary-container font-bold">+€41.80</td>
                      <td className="py-space-2xs px-space-sm"><span className="px-1.5 py-0.5 bg-surface-container text-on-tertiary-container rounded text-micro-caption font-bold">FILLED</span></td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-space-2xs px-space-sm text-on-surface-variant">21:54:06.189</td>
                      <td className="py-space-2xs px-space-sm text-on-tertiary-container font-bold">BUY ARB</td>
                      <td className="py-space-2xs px-space-sm font-semibold">95.0 MW</td>
                      <td className="py-space-2xs px-space-sm">€28.40</td>
                      <td className="py-space-2xs px-space-sm">€69.90</td>
                      <td className="py-space-2xs px-space-sm text-on-tertiary-container font-bold">+€41.50</td>
                      <td className="py-space-2xs px-space-sm"><span className="px-1.5 py-0.5 bg-surface-container text-on-tertiary-container rounded text-micro-caption font-bold">FILLED</span></td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-space-2xs px-space-sm text-on-surface-variant">21:54:02.905</td>
                      <td className="py-space-2xs px-space-sm text-secondary font-bold">STORE</td>
                      <td className="py-space-2xs px-space-sm font-semibold">50.0 MW</td>
                      <td className="py-space-2xs px-space-sm">€28.20</td>
                      <td className="py-space-2xs px-space-sm">--</td>
                      <td className="py-space-2xs px-space-sm text-on-surface-variant">BESS CHARGE</td>
                      <td className="py-space-2xs px-space-sm"><span className="px-1.5 py-0.5 bg-surface-container text-secondary rounded text-micro-caption font-bold">STORED</span></td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-space-2xs px-space-sm text-on-surface-variant">21:53:58.214</td>
                      <td className="py-space-2xs px-space-sm text-on-tertiary-container font-bold">BUY ARB</td>
                      <td className="py-space-2xs px-space-sm font-semibold">180.0 MW</td>
                      <td className="py-space-2xs px-space-sm">€28.45</td>
                      <td className="py-space-2xs px-space-sm">€70.20</td>
                      <td className="py-space-2xs px-space-sm text-on-tertiary-container font-bold">+€41.75</td>
                      <td className="py-space-2xs px-space-sm"><span className="px-1.5 py-0.5 bg-surface-container text-on-tertiary-container rounded text-micro-caption font-bold">FILLED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: Congestion + CFE Audit (Col 10-12) */}
        <aside className="col-span-12 xl:col-span-3 flex flex-col gap-panel-gap">
          {/* Congestion & Thermal */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-headline-md text-headline-md uppercase text-on-surface">CONGESTION &amp; THERMAL</span>
              <span className="font-label-code text-micro-caption text-on-tertiary-container font-bold">NORMAL STABILITY</span>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div>
                <div className="flex justify-between font-label-code text-label-code pb-1">
                  <span className="text-on-surface-variant">Subsea Thermal Loading</span>
                  <span className="text-on-surface font-bold">68.2°C / 90°C</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded overflow-hidden">
                  <div className="bg-secondary h-full rounded" style={{ width: '75.7%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-label-code text-label-code pb-1">
                  <span className="text-on-surface-variant">Reactive Power (MVAR)</span>
                  <span className="text-on-surface font-bold">+42.1 MVAR</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded overflow-hidden">
                  <div className="bg-on-tertiary-container h-full rounded" style={{ width: '48%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-label-code text-label-code pb-1">
                  <span className="text-on-surface-variant">Voltage Delta (NordLink vs TenneT)</span>
                  <span className="text-on-surface font-bold">Δ 0.42 kV</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded overflow-hidden">
                  <div className="bg-on-surface h-full rounded" style={{ width: '22%' }} />
                </div>
              </div>
            </div>
            <div className="p-space-xs bg-surface-container-low rounded font-label-code text-micro-caption text-on-surface-variant flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-secondary">info</span>
              <span>N-1 contingency margin maintained across all sub-stations.</span>
            </div>
          </div>

          {/* CFE Hourly Audit */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm flex-1">
            <div className="flex items-center justify-between">
              <span className="font-headline-md text-headline-md uppercase text-on-surface">CFE HOURLY AUDIT</span>
              <span className="w-2 h-2 rounded-full bg-on-tertiary-container" />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Granular clean generation matched to consumer demand within identical 60-minute settlement windows.
            </p>
            <div className="flex flex-col gap-space-xs font-label-code text-micro-caption">
              {[
                { batch: '#894,115', hash: '7a82c441b803f...91d0e12', matched: '420.0 MWh', delay: '0.8s', pct: '100%' },
                { batch: '#894,114', hash: '3c91e7041a92e...44a7f01', matched: '380.5 MWh', delay: '1.1s', pct: '100%' },
                { batch: '#894,113', hash: '11f8b3940c66d...29e18b0', matched: '510.2 MWh', delay: '0.9s', pct: '99.8%' },
              ].map((b) => (
                <div key={b.batch} className="p-space-xs bg-surface-container-low rounded flex flex-col gap-0.5">
                  <div className="flex justify-between text-on-surface font-bold">
                    <span>BATCH {b.batch}</span>
                    <span className="text-on-tertiary-container">{b.pct} CFE VERIFIED</span>
                  </div>
                  <div className="text-on-surface-variant truncate">HASH: {b.hash}</div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Matched: {b.matched}</span>
                    <span>Delay: {b.delay}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Quick Actions */}
            <div className="mt-auto flex flex-col gap-space-xs pt-space-xs">
              <button
                className="h-8 bg-surface-container text-on-surface hover:bg-surface-container-high rounded font-label-code text-label-code uppercase font-bold transition-colors flex items-center justify-center gap-space-xs"
                type="button"
                onClick={handleSettleNow}
              >
                <span className="material-symbols-outlined text-[14px]">checklist_rtl</span>
                <span>{settling ? 'CLEARING IN PROGRESS (SHA-256)...' : 'EXECUTE SPOT CLEARING'}</span>
              </button>
              <button className="h-8 bg-surface-container-low text-on-surface-variant hover:text-on-surface rounded font-label-code text-label-code uppercase font-semibold transition-colors flex items-center justify-center gap-space-xs" type="button">
                <span className="material-symbols-outlined text-[14px]">download</span>
                <span>DOWNLOAD SETTLEMENT DOSSIER</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM PANEL: 24-Hour Spread & BESS Profile */}
      <div className="w-full px-panel-gap pb-panel-gap">
        <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
          <div className="flex flex-wrap items-center justify-between gap-space-sm border-b pb-space-xs">
            <div className="flex items-center gap-space-md">
              <span className="font-headline-md text-headline-md uppercase text-on-surface">24-HOUR INTERTIE SPREAD &amp; BESS DISPATCH PROFILE</span>
              <div className="flex items-center gap-space-sm font-label-code text-micro-caption">
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="w-2.5 h-1 bg-secondary rounded" /> Spread Curve (€/MWh)
                </span>
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="w-2.5 h-1 bg-on-tertiary-container rounded" /> Battery State of Charge (%)
                </span>
              </div>
            </div>
            <div className="flex items-center bg-surface-container p-space-2xs rounded font-label-code text-micro-caption">
              <button className="px-space-xs py-space-2xs bg-surface-container-lowest rounded text-on-surface font-bold shadow-sm" type="button">24H TIMEFRAME</button>
              <button className="px-space-xs py-space-2xs text-on-surface-variant hover:text-on-surface" type="button">48H FORECAST</button>
              <button className="px-space-xs py-space-2xs text-on-surface-variant hover:text-on-surface" type="button">HISTORICAL ARB</button>
            </div>
          </div>
          {/* SVG Chart */}
          <div className="w-full h-36 relative bg-surface-container-low rounded p-space-xs flex items-center justify-center">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 120">
              <line stroke="#CBD5E1" strokeDasharray="3,3" strokeWidth="0.5" x1="0" x2="1000" y1="30" y2="30" />
              <line stroke="#CBD5E1" strokeDasharray="3,3" strokeWidth="0.5" x1="0" x2="1000" y1="60" y2="60" />
              <line stroke="#CBD5E1" strokeDasharray="3,3" strokeWidth="0.5" x1="0" x2="1000" y1="90" y2="90" />
              <path d="M0,80 Q120,95 250,85 T500,40 T750,25 T1000,50" fill="none" stroke="#009869" strokeWidth="2" />
              <path d="M0,100 Q150,110 300,75 T600,20 T800,90 T1000,30" fill="none" stroke="#006398" strokeWidth="2.5" />
              <line stroke="#ba1a1a" strokeDasharray="2,2" strokeWidth="1.5" x1="680" x2="680" y1="0" y2="120" />
            </svg>
            <div className="absolute left-[68%] top-2 transform -translate-x-1/2 bg-surface-container-lowest px-space-xs py-space-2xs rounded shadow border border-outline-variant font-label-code text-micro-caption flex flex-col">
              <span className="text-on-surface font-bold">21:54 UTC [NOW]</span>
              <span className="text-secondary font-bold">Spread: +€41.60</span>
              <span className="text-on-tertiary-container font-semibold">SOC: 76.4% (Discharge)</span>
            </div>
          </div>
          {/* Ticker */}
          <div className="flex items-center justify-between pt-space-xs font-label-code text-micro-caption text-on-surface-variant overflow-hidden">
            <div className="flex items-center gap-space-xs whitespace-nowrap">
              <span className="font-bold text-on-surface uppercase">SETTLEMENT ENGINE TICKER:</span>
              <span>[21:54:02] NO2-DE_15M: 80MW @ €41.80 MATCHED</span>
              <span className="text-outline">/</span>
              <span>[21:53:45] NO2-DE_15M: 120MW @ €41.65 MATCHED</span>
              <span className="text-outline">/</span>
              <span>[21:53:30] PPA-WIND: Baseload Delivery Confirmed (418.6 MW)</span>
            </div>
            <span className="px-space-xs py-space-2xs bg-surface-container rounded text-on-surface font-bold whitespace-nowrap">STATUS: SETTLING</span>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
