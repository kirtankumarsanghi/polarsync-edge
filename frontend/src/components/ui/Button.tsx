import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base font-semibold',
  };

  const variantStyles = {
    primary: 'bg-white text-black hover:bg-slate-200 font-bold shadow-md shadow-white/10',
    secondary: 'bg-black text-white border border-polar-line hover:border-slate-400 hover:bg-polar-panel',
    danger: 'bg-red-500/20 text-polar-red border border-red-500/40 hover:bg-red-500/30',
    ghost: 'text-polar-muted hover:text-white hover:bg-polar-panel2',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
