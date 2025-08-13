'use client';

import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'brutal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
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
  fullWidth = false
}: ButtonProps) => {
  const baseClasses = `
    relative inline-flex items-center justify-center font-black text-black
    transition-all duration-200 focus:outline-none border-4 border-black
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    overflow-hidden tracking-tight
  `;
  
  const variantStyles = {
    primary: `
      bg-yellow-400 hover:bg-yellow-300
      shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]
      hover:translate-x-[-2px] hover:translate-y-[-2px]
      active:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]
    `,
    secondary: `
      bg-pink-400 hover:bg-pink-300
      shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]
      hover:translate-x-[-2px] hover:translate-y-[-2px]
      active:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]
    `,
    danger: `
      bg-red-400 hover:bg-red-300
      shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]
      hover:translate-x-[-2px] hover:translate-y-[-2px]
      active:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]
    `,
    ghost: `
      bg-transparent border-2 border-black hover:bg-gray-100
      shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000]
      hover:translate-x-[-2px] hover:translate-y-[-2px]
      active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
    `,
    outline: `
      bg-white hover:bg-gray-50
      shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]
      hover:translate-x-[-2px] hover:translate-y-[-2px]
      active:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]
    `,
    brutal: `
      bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300
      shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000]
      hover:translate-x-[-2px] hover:translate-y-[-2px]
      active:shadow-[3px_3px_0px_0px_#000] active:translate-x-[3px] active:translate-y-[3px]
      transform rotate-1 hover:rotate-0
    `
  };

  const sizeStyles = {
    xs: 'px-3 py-1.5 text-sm gap-1',
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5',
    xl: 'px-10 py-5 text-xl gap-3'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
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
        rounded-2xl
        ${className}
      `}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-2xl">
          <Loader2 className={`${iconSizes[size]} animate-spin text-black`} />
        </div>
      )}
      
      {/* Content */}
      <div className={`
        relative z-10 flex items-center justify-center gap-inherit
        transition-opacity duration-200
        ${loading ? 'opacity-0' : 'opacity-100'}
      `}>
        {!loading && icon && iconPosition === 'left' && (
          <span className={`${iconSizes[size]} font-bold`}>
            {icon}
          </span>
        )}
        
        <span className="relative z-10 uppercase">
          {children}
        </span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className={`${iconSizes[size]} font-bold`}>
            {icon}
          </span>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 border-2 border-black rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-300 border-2 border-black rounded-full"></div>
    </button>
  );
};
