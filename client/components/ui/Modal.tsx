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
        max-h-[90vh] overflow-hidden
        bg-white border-4 border-black rounded-2xl 
        shadow-[8px_8px_0px_0px_#000] transform rotate-1
        animate-in zoom-in-95 duration-200
      `}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b-4 border-black bg-gradient-to-r from-yellow-400 to-pink-400 flex-shrink-0">
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
        <div className="p-6 relative overflow-y-auto flex-1">
          {children}
          
          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-300 border-2 border-black rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-300 border-2 border-black rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
