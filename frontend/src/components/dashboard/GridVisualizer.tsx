'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { Sun, BatteryCharging, Zap, Gauge, Flame, ShieldCheck } from 'lucide-react';

export const GridVisualizer: React.FC = () => {
  const { telemetry } = useStore();

  const netBalance = Math.round((telemetry.solar_kw - telemetry.demand_kw) * 10) / 10;
  const isCharging = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 1. Solar Generation */}
      <div className="bg-polar-panel/80 border border-polar-line rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-polar-muted uppercase tracking-wider">Solar Array</span>
          <Sun className="w-5 h-5 text-polar-green animate-spin-slow" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-polar-text">{telemetry.solar_kw}</span>
          <span className="text-xs text-polar-muted font-medium">kW</span>
        </div>
        <div className="mt-2 text-xs text-polar-green flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-polar-green animate-ping"></span>
          Renewable window active
        </div>
      </div>

      {/* 2. Station Demand */}
      <div className="bg-polar-panel/80 border border-polar-line rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-polar-muted uppercase tracking-wider">Current Demand</span>
          <Zap className="w-5 h-5 text-polar-cyan" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-polar-text">{telemetry.demand_kw}</span>
          <span className="text-xs text-polar-muted font-medium">kW</span>
        </div>
        <div className="mt-2 text-xs text-polar-cyan flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Within expected diurnal band
        </div>
      </div>

      {/* 3. LiFePO4 Battery Bank */}
      <div className="bg-polar-panel/80 border border-polar-line rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-polar-muted uppercase tracking-wider">Battery Reserve</span>
          <BatteryCharging className={`w-5 h-5 ${telemetry.battery_soc > 40 ? 'text-polar-green' : 'text-polar-amber'}`} />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-polar-text">{telemetry.battery_soc}%</span>
          <span className="text-xs text-polar-muted font-medium">({isCharging ? `+${netBalance} kW` : `${netBalance} kW`})</span>
        </div>
        <div className="mt-2 text-xs text-polar-green flex items-center gap-2">
          <span>{telemetry.battery_temp_c}°C</span>
          <span className="text-polar-muted">•</span>
          <span>{telemetry.battery_voltage}V DC</span>
        </div>
      </div>

      {/* 4. Polar Diesel GenSet */}
      <div className="bg-polar-panel/80 border border-polar-line rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-polar-muted uppercase tracking-wider">Fuel & GenSet</span>
          <Flame className="w-5 h-5 text-polar-amber" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-polar-text">{telemetry.generator_status}</span>
          <span className="text-xs text-polar-muted font-medium">{telemetry.fuel_reserve_liters.toLocaleString()} L</span>
        </div>
        <div className="mt-2 text-xs text-polar-amber flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5" />
          Standby reserve protected
        </div>
      </div>
    </div>
  );
};
