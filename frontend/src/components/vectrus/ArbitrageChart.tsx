'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useVectrusStore } from '@/store/useVectrusStore';

export default function ArbitrageChart() {
  const data = useVectrusStore(state => state.history);

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg font-mono flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-400 text-sm uppercase tracking-wider">Price vs. Battery SoC</h2>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> LMP Price ($/MWh)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Battery SoC (%)</div>
        </div>
      </div>
      
      <div className="flex-1 w-full h-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="time" stroke="#4b5563" fontSize={12} tickMargin={10} />
            <YAxis yAxisId="left" stroke="#4b5563" fontSize={12} tickFormatter={(val) => `$${val}`} />
            <YAxis yAxisId="right" orientation="right" stroke="#4b5563" fontSize={12} tickFormatter={(val) => `${val}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', borderColor: '#374151', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area yAxisId="left" type="monotone" dataKey="price" stroke="#22c55e" fillOpacity={0.1} fill="#22c55e" />
            <Area yAxisId="right" type="monotone" dataKey="soc" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
