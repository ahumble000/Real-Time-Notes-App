'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'md'
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative w-full ${maxWidthStyles[maxWidth]} 
        bg-white border-4 border-black rounded-2xl 
        shadow-[8px_8px_0px_0px_#000] transform rotate-1
        animate-in zoom-in-95 duration-200
      `}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b-4 border-black bg-gradient-to-r from-yellow-400 to-pink-400">
            <h2 className="text-2xl font-black text-black tracking-tight">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-white border-3 border-black rounded-xl hover:bg-red-200 transition-all duration-200 shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
            >
              <X className="w-5 h-5 text-black font-bold" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 relative">
          {children}
          
          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-300 border-2 border-black rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-300 border-2 border-black rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-[95vw] mx-4'
  };

  const sizeStyles = {
    sm: 'max-h-[50vh]',
    md: 'max-h-[70vh]',
    lg: 'max-h-[80vh]',
    xl: 'max-h-[90vh]'
  };

  const variantStyles = {
    default: 'bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl shadow-slate-500/20',
    glass: 'bg-white/30 backdrop-blur-2xl border border-white/30 shadow-2xl shadow-slate-500/30',
    gradient: 'bg-gradient-to-br from-white via-slate-50/90 to-white backdrop-blur-xl border border-slate-200/50 shadow-2xl shadow-slate-500/20',
    minimal: 'bg-white border border-slate-200 shadow-xl shadow-slate-500/10'
  };

  const animationStyles = {
    fade: 'animate-in fade-in-0 duration-300',
    scale: 'animate-in fade-in-0 zoom-in-95 duration-300',
    slide: 'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
    gentle: 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-500 ease-out'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto">
      {/* Enhanced Backdrop with serene blur */}
      <div 
        className={`
          fixed inset-0 transition-all duration-500 ease-out
          bg-gradient-to-br from-slate-900/60 via-slate-800/70 to-slate-900/60
          backdrop-blur-md
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={closeOnOverlayClick ? onClose : undefined}
      >
        {/* Floating particles effect */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse delay-700" />
      </div>
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div 
          className={`
            relative w-full ${maxWidthStyles[maxWidth]} ${sizeStyles[size]}
            ${variantStyles[variant]}
            rounded-3xl overflow-hidden
            ${animationStyles[animation]}
            transform-gpu
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient overlay for enhanced depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
          
          {/* Header with serene styling */}
          <div className="relative flex items-center justify-between p-6 border-b border-slate-200/50 bg-gradient-to-r from-transparent to-slate-50/30">
            <div className="flex-1 pr-8">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                {title}
              </h3>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  absolute top-4 right-4 p-2.5 text-slate-400 
                  hover:text-slate-600 hover:bg-slate-100/80 
                  rounded-full transition-all duration-300 ease-out
                  focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:ring-offset-2
                  transform hover:scale-110 active:scale-95
                  backdrop-blur-sm
                "
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Content with enhanced scrolling */}
          <div className="relative p-6 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            <div className="relative z-10">
              {children}
            </div>
            
            {/* Gentle fade at bottom for long content */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
          </div>
          
          {/* Footer with enhanced styling */}
          {footer && (
            <div className="relative p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/30 to-transparent backdrop-blur-sm">
              {footer}
            </div>
          )}

          {/* Subtle floating elements */}
          <div className="absolute top-6 left-8 w-1 h-1 bg-slate-400/30 rounded-full animate-pulse" />
          <div className="absolute top-8 right-12 w-0.5 h-0.5 bg-slate-400/40 rounded-full animate-pulse delay-500" />
        </div>
      </div>
    </div>
  );
};
