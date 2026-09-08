'use client';
import React, { useState } from 'react';
import { useVectrusStore } from '@/store/useVectrusStore';

export default function TradingPanel() {
  const [strategy, setStrategy] = useState('manual');
  const [amount, setAmount] = useState(10);
  const [isTrading, setIsTrading] = useState(false);
  
  const { prices, addTrade } = useVectrusStore();
  const currentPrice = prices['HB_NORTH'] || 25.50;

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    setIsTrading(true);
    try {
      const res = await fetch('http://localhost:4000/api/vectrus/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount })
      });
      if (res.ok) {
        addTrade(amount, type, currentPrice);
      }
    } catch (e) {
      console.error('Trade failed', e);
    }
    setIsTrading(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg font-mono flex flex-col h-full">
      <h2 className="text-gray-400 text-sm mb-4 uppercase tracking-wider">Order Execution</h2>
      
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setStrategy('manual')}
          className={`flex-1 py-1 text-xs border ${strategy === 'manual' ? 'bg-blue-900/50 border-blue-500 text-blue-400' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}
        >
          MANUAL
        </button>
        <button 
          onClick={() => setStrategy('auto')}
          className={`flex-1 py-1 text-xs border ${strategy === 'auto' ? 'bg-purple-900/50 border-purple-500 text-purple-400' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}
        >
          AUTO-ARB
        </button>
      </div>

      <div className="flex-1">
        <div className="mb-4">
          <label className="text-xs text-gray-500 block mb-1">QUANTITY (MWh)</label>
          <input 
            type="number" 
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full bg-black border border-gray-700 p-2 text-green-400 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-500 block mb-1">ESTIMATED IMPACT</label>
          <div className="flex justify-between text-sm">
            <span>Cost/Revenue:</span>
            <span className="text-gray-300">~${(amount * currentPrice).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>SoC Change:</span>
            <span className="text-gray-300">{(amount / 100 * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button 
          onClick={() => handleTrade('BUY')}
          disabled={strategy === 'auto'}
          className="bg-green-900/30 text-green-500 border border-green-700 py-3 hover:bg-green-900/50 hover:text-green-400 disabled:opacity-50 transition-colors"
        >
          BUY / CHARGE
        </button>
        <button 
          onClick={() => handleTrade('SELL')}
          disabled={strategy === 'auto'}
          className="bg-red-900/30 text-red-500 border border-red-700 py-3 hover:bg-red-900/50 hover:text-red-400 disabled:opacity-50 transition-colors"
        >
          SELL / DISCHARGE
        </button>
      </div>
    </div>
  );
}
