'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  color?: 'blue' | 'slate' | 'green' | 'rose' | 'purple' | 'amber' | 'gradient';
  text?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'orbit' | 'gentle';
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  color = 'blue',
  text,
  variant = 'default',
  fullScreen = false
}: LoadingSpinnerProps) => {
  const sizeStyles = {
    xs: { spinner: 'w-3 h-3', text: 'text-xs', dots: 'w-1 h-1' },
    sm: { spinner: 'w-4 h-4', text: 'text-sm', dots: 'w-1.5 h-1.5' },
    md: { spinner: 'w-6 h-6', text: 'text-base', dots: 'w-2 h-2' },
    lg: { spinner: 'w-8 h-8', text: 'text-lg', dots: 'w-2.5 h-2.5' },
    xl: { spinner: 'w-12 h-12', text: 'text-xl', dots: 'w-3 h-3' },
    '2xl': { spinner: 'w-16 h-16', text: 'text-2xl', dots: 'w-4 h-4' }
  };

  const colorStyles = {
    blue: 'text-blue-600',
    slate: 'text-slate-600',
    green: 'text-emerald-600',
    rose: 'text-rose-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    gradient: 'text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex items-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  ${sizeStyles[size].dots} rounded-full
                  ${color === 'gradient' 
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600' 
                    : colorStyles[color].replace('text-', 'bg-')
                  }
                  animate-pulse
                `}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className="relative">
            <div className={`
              ${sizeStyles[size].spinner} rounded-full border-4 border-slate-200/30
            `} />
            <div className={`
              absolute inset-0 ${sizeStyles[size].spinner} rounded-full border-4 border-transparent
              ${color === 'gradient' 
                ? 'border-t-blue-600 border-r-purple-600 border-b-pink-600' 
                : `border-t-${color.replace('text-', '')}-600`
              }
              animate-pulse
            `} />
          </div>
        );

      case 'orbit':
        return (
          <div className="relative">
            <div className={`
              ${sizeStyles[size].spinner} rounded-full border-2 border-slate-200/30
            `} />
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  absolute top-0 left-0 ${sizeStyles[size].spinner} rounded-full
                  border-2 border-transparent
                  ${color === 'gradient' 
                    ? 'border-t-blue-600' 
                    : `border-t-${color}-600`
                  }
                  animate-spin
                `}
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${1.5 + i * 0.5}s`
                }}
              />
            ))}
          </div>
        );

      case 'gentle':
        return (
          <div className="relative">
            {/* Outer ring */}
            <div className={`
              ${sizeStyles[size].spinner} rounded-full border-2 border-slate-200/40
            `} />
            {/* Inner spinning element */}
            <div className={`
              absolute inset-2 rounded-full
              ${color === 'gradient' 
                ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20' 
                : `bg-${color}-600/20`
              }
              animate-spin
            `} style={{ animationDuration: '3s' }} />
            {/* Center dot */}
            <div className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-1 h-1 rounded-full
              ${color === 'gradient' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : `bg-${color}-600`
              }
              animate-pulse
            `} />
          </div>
        );

      default:
        return (
          <div className="relative">
            {/* Background ring */}
            <div className={`${sizeStyles[size].spinner} border-4 border-slate-200/30 rounded-full`} />
            {/* Spinning ring */}
            <Loader2 className={`
              ${sizeStyles[size].spinner} ${colorStyles[color]} animate-spin absolute inset-0
              transition-all duration-300 ease-out
            `} />
            {/* Gentle glow effect */}
            <div className={`
              absolute inset-0 ${sizeStyles[size].spinner} rounded-full
              ${color === 'gradient' 
                ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20' 
                : `bg-${color}-500/20`
              }
              blur-lg animate-pulse
            `} />
          </div>
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {renderSpinner()}
      
      {text && (
        <div className="text-center space-y-2">
          <p className={`
            ${sizeStyles[size].text} font-medium transition-all duration-300
            ${colorStyles[color]} animate-pulse
          `}>
            {text}
          </p>
          {/* Subtle progress indicator */}
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  w-1 h-1 rounded-full
                  ${color === 'gradient' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                    : `bg-${color}-600`
                  }
                  animate-pulse
                `}
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="p-8 rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-500/20 border border-slate-200/50">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
