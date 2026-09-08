'use client';
import React from 'react';
import { useVectrusStore } from '@/store/useVectrusStore';

export default function AssetOverview() {
  const { batterySoC, solarGen, gridLoad, pnl } = useVectrusStore();

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg font-mono">
      <h2 className="text-gray-400 text-sm mb-4 uppercase tracking-wider">Asset Overview</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black p-3 border border-gray-800 rounded">
          <div className="text-gray-500 text-xs">BATTERY SOC</div>
          <div className="text-2xl font-bold text-green-400">{batterySoC.toFixed(1)}%</div>
          <div className="w-full bg-gray-800 h-1 mt-2">
            <div className="bg-green-400 h-1 transition-all duration-500" style={{ width: `${batterySoC}%` }}></div>
          </div>
        </div>

        <div className="bg-black p-3 border border-gray-800 rounded">
          <div className="text-gray-500 text-xs">SOLAR GEN</div>
          <div className="text-2xl font-bold text-yellow-400">{solarGen.toFixed(1)} MW</div>
          <div className="text-xs text-green-500 mt-1">Live Telemetry</div>
        </div>

        <div className="bg-black p-3 border border-gray-800 rounded">
          <div className="text-gray-500 text-xs">GRID LOAD</div>
          <div className="text-2xl font-bold text-orange-400">{gridLoad.toFixed(1)} MW</div>
          <div className="text-xs text-red-400 mt-1">{gridLoad > 380 ? 'PEAK APPROACHING' : 'NOMINAL'}</div>
        </div>

        <div className="bg-black p-3 border border-gray-800 rounded">
          <div className="text-gray-500 text-xs">DAILY P&L</div>
          <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
          <div className="text-xs text-gray-500 mt-1">Since 00:00 UTC</div>
        </div>
      </div>
    </div>
  );
}
