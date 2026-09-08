'use client';
import React from 'react';
import { useVectrusStore } from '@/store/useVectrusStore';

const GRID_NODES = ['HB_NORTH', 'HB_SOUTH', 'HB_WEST', 'HB_HOUSTON', 'LZ_AEN', 'LZ_CPS', 'LZ_LCRA', 'LZ_RAYBN'];

export default function PriceTicker() {
  const prices = useVectrusStore(state => state.prices);

  return (
    <div className="w-full overflow-hidden whitespace-nowrap bg-black text-green-400 py-1 font-mono text-sm">
      <div className="inline-block animate-marquee">
        {GRID_NODES.map((node, i) => (
          <span key={node} className="mx-6">
            <span className="font-bold text-gray-400">{node}</span>
            <span className="ml-2 text-green-300">${prices[node]?.toFixed(2) || '0.00'}</span>
          </span>
        ))}
        {/* Duplicate for seamless scrolling */}
        {GRID_NODES.map((node, i) => (
          <span key={`dup-${node}`} className="mx-6">
            <span className="font-bold text-gray-400">{node}</span>
            <span className="ml-2 text-green-300">${prices[node]?.toFixed(2) || '0.00'}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
