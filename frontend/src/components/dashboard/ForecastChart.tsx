'use client';

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

export const ForecastChart: React.FC = () => {
  const { demandForecast, solarForecast } = useStore();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = 100; // 100 kW ceiling

  const getX = (hour: number) => paddingX + (hour / 23) * (width - paddingX * 2);
  const getY = (val: number) => height - paddingY - (val / maxVal) * (height - paddingY * 2);

  const demandPoints = demandForecast.map((p) => `${getX(p.hour)},${getY(p.value_kw)}`).join(' ');
  const solarPoints = solarForecast.map((p) => `${getX(p.hour)},${getY(p.value_kw)}`).join(' ');

  const solarArea = `${getX(0)},${height - paddingY} ` +
    solarForecast.map((p) => `${getX(p.hour)},${getY(p.value_kw)}`).join(' ') +
    ` ${getX(23)},${height - paddingY}`;

  return (
    <div className="w-full">
      <div className="relative h-60 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#63e6a5" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#63e6a5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick}>
              <line
                x1={paddingX}
                y1={getY(tick)}
                x2={width - paddingX}
                y2={getY(tick)}
                stroke="#1e3444"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 10}
                y={getY(tick) + 4}
                textAnchor="end"
                fontSize="10"
                fill="#8da5b3"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Solar Fill Area */}
          <polygon points={solarArea} fill="url(#solarGradient)" />

          {/* Solar Line */}
          <polyline
            points={solarPoints}
            fill="none"
            stroke="#63e6a5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Demand Line */}
          <polyline
            points={demandPoints}
            fill="none"
            stroke="#52d6e8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Points & Vertical Cursor */}
          {demandForecast.map((d, i) => {
            const s = solarForecast[i] || { value_kw: 0 };
            const x = getX(i);
            const isSelected = hoveredHour === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredHour(i)}
                onMouseLeave={() => setHoveredHour(null)}
                className="cursor-pointer"
              >
                {/* Clickable Hit Area */}
                <rect
                  x={x - 15}
                  y={paddingY}
                  width="30"
                  height={height - paddingY * 2}
                  fill="transparent"
                />
                {isSelected && (
                  <>
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={height - paddingY}
                      stroke="#edf7fb"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <circle cx={x} cy={getY(d.value_kw)} r="5" fill="#52d6e8" stroke="#fff" strokeWidth="2" />
                    <circle cx={x} cy={getY(s.value_kw)} r="5" fill="#63e6a5" stroke="#fff" strokeWidth="2" />
                  </>
                )}
                {/* X Axis Labels */}
                {i % 4 === 0 && (
                  <text
                    x={x}
                    y={height - paddingY + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#8da5b3"
                  >
                    {String(i).padStart(2, '0')}:00
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredHour !== null && (
          <div
            className="absolute top-2 right-4 bg-polar-panel2 border border-polar-line rounded-lg p-2.5 shadow-xl text-xs"
          >
            <div className="font-bold text-polar-text mb-1">
              Window: {String(hoveredHour).padStart(2, '0')}:00 - {String(hoveredHour + 1).padStart(2, '0')}:00
            </div>
            <div className="flex items-center gap-2 text-polar-cyan">
              <span>●</span> Demand: <b>{demandForecast[hoveredHour]?.value_kw} kW</b>
            </div>
            <div className="flex items-center gap-2 text-polar-green">
              <span>●</span> Solar: <b>{solarForecast[hoveredHour]?.value_kw} kW</b>
            </div>
            <div className="mt-1 pt-1 border-t border-polar-line text-polar-muted">
              Gap: <b>{Math.max(0, (demandForecast[hoveredHour]?.value_kw || 0) - (solarForecast[hoveredHour]?.value_kw || 0)).toFixed(1)} kW</b>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold">
        <span className="flex items-center gap-2 text-polar-cyan">
          <span className="w-3 h-3 rounded-full bg-polar-cyan"></span>
          Predicted Demand (PyTorch LSTM ~900 kWh)
        </span>
        <span className="flex items-center gap-2 text-polar-green">
          <span className="w-3 h-3 rounded-full bg-polar-green"></span>
          Predicted Solar (XGBoost Bifacial ~520 kWh)
        </span>
      </div>
    </div>
  );
};
