'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { Shield, Radio, Sparkles, HardDrive } from 'lucide-react';

export const AlertsPanel: React.FC = () => {
  const { isConnected, isOfflineMode, telemetry, plan, setApprovalModalOpen } = useStore();

  return (
    <div className="space-y-4">
      {/* AI Recommendation Card */}
      <div className="border border-amber-600/40 bg-amber-500/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-polar-amber uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI Decision Recommendation
          </span>
          <span className="text-[11px] font-semibold text-polar-muted">Next 24h Horizon</span>
        </div>
        <h3 className="text-base font-bold text-polar-text mt-2">{plan?.recommended_action}</h3>
        <p className="text-xs text-polar-muted mt-1 leading-relaxed">
          Expected gap is <b className="text-polar-text">{plan?.net_gap_kwh} kWh</b>. Reschedule flexible laboratory loads into the strongest solar window and protect the LiFePO4 battery reserve.
        </p>
        <button
          onClick={() => setApprovalModalOpen(true)}
          className="mt-3 w-full bg-white text-black font-bold py-2 px-3 rounded-lg text-xs hover:bg-slate-200 transition-colors shadow-sm"
        >
          Review & Authorize Plan
        </button>
      </div>

      {/* Edge System Health */}
      <div className="bg-polar-panel/80 border border-polar-line rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-polar-muted flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-polar-cyan" />
            Edge Storage
          </span>
          <span className="text-polar-green font-semibold">TimescaleDB Hypertable Active</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-polar-muted flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-polar-green" />
            Telemetry Sockets
          </span>
          <span className={`font-semibold ${isConnected ? 'text-polar-green' : 'text-polar-cyan'}`}>
            {isConnected ? '5s Live Stream Active' : 'Edge Local Buffer'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-polar-muted flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-polar-cyan" />
            Life-Safety Interlock
          </span>
          <span className="text-polar-cyan font-semibold">Tier-1 Hardware Enforced</span>
        </div>
      </div>
    </div>
  );
};
