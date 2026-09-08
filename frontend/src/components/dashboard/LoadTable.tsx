'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { Badge } from '../ui/Badge';
import { Lock, Zap } from 'lucide-react';

export const LoadTable: React.FC = () => {
  const { loads, toggleLoad } = useStore();

  return (
    <div className="bg-polar-panel/80 border border-polar-line rounded-xl p-5">
      <div className="flex items-center justify-between pb-3 border-b border-polar-line/50">
        <div>
          <h2 className="text-sm font-bold text-polar-text tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-polar-amber" />
            Station Load Priorities & Human-in-the-Loop Control
          </h2>
          <p className="text-xs text-polar-muted mt-0.5">
            Strict safety tiers: Tier-1 life-safety circuits are locked and physically interlocked against automated shedding.
          </p>
        </div>
      </div>

      <div className="divide-y divide-polar-line/40 mt-1">
        {loads.map((load) => (
          <div key={load.id} className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-polar-text">{load.name}</span>
                {load.tier === 1 && (
                  <span className="flex items-center gap-1 text-[10px] text-polar-muted bg-polar-bg px-1.5 py-0.5 rounded border border-polar-line">
                    <Lock className="w-2.5 h-2.5 text-polar-red" />
                    Interlocked
                  </span>
                )}
              </div>
              <p className="text-xs text-polar-muted mt-0.5">{load.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-polar-text block">{load.nominal_kw} kW</span>
                <span className="text-[10px] text-polar-muted">Nominal Bus</span>
              </div>

              {load.tier === 1 ? (
                <Badge variant="critical">Tier 1 · Critical</Badge>
              ) : load.tier === 2 ? (
                <Badge variant="important">Tier 2 · Schedulable</Badge>
              ) : (
                <Badge variant="noncritical">Tier 3 · Non-Critical</Badge>
              )}

              {/* Hardware / Commander Toggle */}
              <button
                disabled={load.tier === 1}
                onClick={() => toggleLoad(load.id)}
                title={load.tier === 1 ? 'Life-safety cannot be switched off' : 'Toggle load state'}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  load.is_active ? 'bg-white' : 'bg-slate-800 border-polar-line'
                } ${load.tier === 1 ? 'opacity-90 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                    load.is_active ? 'translate-x-5 bg-black' : 'translate-x-0 bg-slate-400'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
