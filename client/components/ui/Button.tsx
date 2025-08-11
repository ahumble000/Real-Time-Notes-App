'use client';

import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'xl'
}: ButtonProps) => {
  const baseClasses = `
    group relative inline-flex items-center justify-center font-semibold
    transition-all duration-300 ease-out focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    transform-gpu hover:scale-[1.02] active:scale-[0.98]
    focus:ring-4 focus:ring-offset-2 focus:ring-offset-white/50
    ${fullWidth ? 'w-full' : ''}
    overflow-hidden
  `;
  
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700
      hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800
      text-white shadow-xl shadow-blue-500/30
      focus:ring-blue-300/50
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent
      before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
    `,
    secondary: `
      bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100
      hover:from-slate-200 hover:via-slate-300 hover:to-slate-200
      text-slate-700 shadow-lg shadow-slate-500/20
      focus:ring-slate-300/50
      border border-slate-200/50 hover:border-slate-300/70
    `,
    danger: `
      bg-gradient-to-r from-rose-600 via-red-600 to-pink-600
      hover:from-rose-700 hover:via-red-700 hover:to-pink-700
      text-white shadow-xl shadow-rose-500/30
      focus:ring-rose-300/50
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent
      before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
    `,
    ghost: `
      bg-transparent hover:bg-slate-100/80 text-slate-700
      focus:ring-slate-300/50 backdrop-blur-sm
      hover:shadow-lg hover:shadow-slate-500/10
    `,
    outline: `
      border-2 border-slate-300/70 bg-white/80 backdrop-blur-sm
      hover:bg-slate-50 hover:border-slate-400/80 text-slate-700
      focus:ring-slate-300/50 shadow-lg shadow-slate-500/10
      hover:shadow-xl hover:shadow-slate-500/20
    `,
    glass: `
      bg-white/20 backdrop-blur-xl border border-white/30
      hover:bg-white/30 text-slate-700 shadow-xl shadow-slate-500/20
      focus:ring-white/50
    `,
    gradient: `
      bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600
      hover:from-purple-700 hover:via-pink-700 hover:to-blue-700
      text-white shadow-xl shadow-purple-500/30
      focus:ring-purple-300/50 animate-gradient-x
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent
      before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
    `
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1.5 text-xs gap-1 min-h-[28px]',
    sm: 'px-3.5 py-2 text-sm gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3.5 text-base gap-2.5 min-h-[52px]',
    xl: 'px-8 py-4 text-lg gap-3 min-h-[60px]'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const roundedStyles = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses} 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${roundedStyles[rounded]}
        ${className}
      `}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
      
      {/* Loading spinner with serene animation */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        </div>
      )}
      
      {/* Content container with fade effect when loading */}
      <div className={`
        relative z-10 flex items-center justify-center gap-inherit
        transition-opacity duration-300
        ${loading ? 'opacity-0' : 'opacity-100'}
      `}>
        {!loading && icon && iconPosition === 'left' && (
          <span className={`${iconSizes[size]} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </span>
        )}
        
        <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
          {children}
        </span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className={`${iconSizes[size]} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </span>
        )}
      </div>

      {/* Floating particles effect for primary and gradient variants */}
      {(variant === 'primary' || variant === 'gradient') && !disabled && (
        <>
          <div className="absolute top-1 left-2 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
          <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-2 left-1/3 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-700" />
        </>
      )}
    </button>
  );
};
