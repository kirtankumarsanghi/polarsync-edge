import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'important' | 'noncritical' | 'cyan' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    critical: 'bg-red-500/10 text-polar-red border-red-500/30',
    important: 'bg-amber-500/10 text-polar-amber border-amber-500/30',
    noncritical: 'bg-emerald-500/10 text-polar-green border-emerald-500/30',
    cyan: 'bg-cyan-500/10 text-polar-cyan border-cyan-500/30',
    neutral: 'bg-slate-800 text-polar-muted border-polar-line',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border uppercase ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
