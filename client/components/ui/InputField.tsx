'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  variant?: 'default' | 'glass' | 'minimal' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
}

export const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  icon,
  helperText,
  variant = 'default',
  size = 'md'
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasValue = value.length > 0;

  const sizeStyles = {
    sm: {
      input: 'px-3 py-2 pt-5 text-sm',
      label: 'text-xs',
      icon: 'w-4 h-4',
      helper: 'text-xs'
    },
    md: {
      input: 'px-4 py-3 pt-6 text-sm',
      label: 'text-xs',
      icon: 'w-5 h-5',
      helper: 'text-sm'
    },
    lg: {
      input: 'px-5 py-4 pt-7 text-base',
      label: 'text-sm',
      icon: 'w-6 h-6',
      helper: 'text-sm'
    }
  };

  const variantStyles = {
    default: `
      border-2 bg-white/90 backdrop-blur-sm
      ${error 
        ? 'border-rose-300/70 bg-rose-50/80 focus:border-rose-500 focus:ring-rose-200/50' 
        : 'border-slate-200/70 focus:border-blue-500/80 focus:ring-blue-200/30'
      }
      ${disabled 
        ? 'bg-slate-50/80 text-slate-500 cursor-not-allowed border-slate-200/50' 
        : 'hover:border-slate-300/80 hover:bg-white/95'
      }
    `,
    glass: `
      border border-white/30 bg-white/20 backdrop-blur-xl
      ${error 
        ? 'border-rose-300/50 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-200/30' 
        : 'focus:border-blue-400/60 focus:ring-blue-200/20'
      }
      ${disabled 
        ? 'bg-slate-100/30 text-slate-500 cursor-not-allowed' 
        : 'hover:bg-white/30'
      }
    `,
    minimal: `
      border-0 border-b-2 rounded-none bg-transparent
      ${error 
        ? 'border-rose-400 focus:border-rose-500' 
        : 'border-slate-300 focus:border-blue-500'
      }
      ${disabled 
        ? 'border-slate-200 text-slate-500 cursor-not-allowed' 
        : 'hover:border-slate-400'
      }
    `,
    bordered: `
      border-2 bg-transparent
      ${error 
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200/30' 
        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200/30'
      }
      ${disabled 
        ? 'border-slate-200 text-slate-500 cursor-not-allowed' 
        : 'hover:border-slate-400'
      }
    `
  };

  return (
    <div className="mb-8 group">
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            peer w-full rounded-2xl transition-all duration-300 ease-out
            ${sizeStyles[size].input}
            ${icon ? (size === 'sm' ? 'pl-10' : size === 'md' ? 'pl-12' : 'pl-14') : ''}
            ${isPassword ? (size === 'sm' ? 'pr-10' : size === 'md' ? 'pr-12' : 'pr-14') : ''}
            ${variantStyles[variant]}
            focus:outline-none focus:ring-4 focus:scale-[1.02]
            placeholder:text-transparent
            shadow-lg shadow-slate-200/20
          `}
        />
        
        {/* Floating Label with serene animation */}
        <label className={`
          absolute transition-all duration-300 ease-out pointer-events-none select-none
          ${icon ? (size === 'sm' ? 'left-10' : size === 'md' ? 'left-12' : 'left-14') : (size === 'sm' ? 'left-3' : size === 'md' ? 'left-4' : 'left-5')}
          ${(isFocused || hasValue) 
            ? `top-2 ${sizeStyles[size].label} font-semibold transform -translate-y-0.5` 
            : `top-1/2 -translate-y-1/2 ${size === 'lg' ? 'text-base' : 'text-sm'} font-normal`
          }
          ${error 
            ? 'text-rose-600' 
            : isFocused 
              ? 'text-blue-600' 
              : 'text-slate-500'
          }
          ${isFocused ? 'scale-95' : 'scale-100'}
        `}>
          {label}
          {required && <span className="text-rose-500 ml-1 animate-pulse">*</span>}
        </label>

        {/* Left Icon with gentle hover effect */}
        {icon && (
          <div className={`
            absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-out
            ${size === 'sm' ? 'left-3' : size === 'md' ? 'left-3' : 'left-4'}
            ${sizeStyles[size].icon}
            ${error 
              ? 'text-rose-400' 
              : isFocused 
                ? 'text-blue-500 scale-110' 
                : 'text-slate-400'
            }
            group-hover:scale-105
          `}>
            {icon}
          </div>
        )}

        {/* Password Toggle with serene styling */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`
              absolute top-1/2 -translate-y-1/2 p-2 rounded-xl 
              transition-all duration-300 ease-out
              ${size === 'sm' ? 'right-2' : size === 'md' ? 'right-2' : 'right-3'}
              ${disabled 
                ? 'cursor-not-allowed text-slate-300' 
                : 'hover:bg-slate-100/80 text-slate-500 hover:text-slate-700 hover:scale-110 active:scale-95'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-200/50 focus:ring-offset-1
            `}
            disabled={disabled}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className={sizeStyles[size].icon} />
            ) : (
              <Eye className={sizeStyles[size].icon} />
            )}
          </button>
        )}

        {/* Serene glow effect on focus */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-blue-500/10 -z-10 blur-xl animate-pulse" />
        )}
      </div>

      {/* Helper Text or Error with gentle animations */}
      {(error || helperText) && (
        <div className="mt-3 flex items-start space-x-2 animate-in slide-in-from-top-1 duration-300">
          {error ? (
            <>
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </div>
              </div>
              <p className={`${sizeStyles[size].helper} text-rose-600 font-medium leading-relaxed`}>
                {error}
              </p>
            </>
          ) : helperText ? (
            <>
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>
              </div>
              <p className={`${sizeStyles[size].helper} text-slate-500 leading-relaxed`}>
                {helperText}
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
