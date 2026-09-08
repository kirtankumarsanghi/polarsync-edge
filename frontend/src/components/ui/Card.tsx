import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
}) => {
  return (
    <div
      className={`bg-gradient-to-b from-polar-panel2/90 to-polar-panel/95 border border-polar-line rounded-xl p-5 shadow-lg backdrop-blur-sm ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4 border-b border-polar-line/40 pb-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-polar-text tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-polar-muted mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
