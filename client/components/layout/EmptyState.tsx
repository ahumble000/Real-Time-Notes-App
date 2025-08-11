'use client';

import { FileText, Search, Plus, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'create' | 'minimal';
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  variant = 'default',
  className = ''
}: EmptyStateProps) => {

  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return <Search className="w-16 h-16 text-slate-300" />;
      case 'create':
        return <Plus className="w-16 h-16 text-slate-300" />;
      default:
        return <FileText className="w-16 h-16 text-slate-300" />;
    }
  };

  const variantStyles = {
    default: 'bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg shadow-slate-500/5',
    search: 'bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-xl border border-blue-200/50 rounded-2xl',
    create: 'bg-gradient-to-br from-green-50/80 to-blue-50/80 backdrop-blur-xl border border-green-200/50 rounded-2xl',
    minimal: ''
  };

  return (
    <div className={`
      flex flex-col items-center justify-center text-center py-16 px-8
      ${variantStyles[variant]} ${className}
    `}>
      
      {/* Floating background elements */}
      {variant !== 'minimal' && (
        <>
          <div className="absolute top-8 left-12 w-24 h-24 bg-blue-500/5 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-12 right-16 w-20 h-20 bg-purple-500/5 rounded-full blur-lg animate-pulse delay-1000" />
        </>
      )}

      {/* Icon */}
      <div className="relative mb-6">
        <div className="p-4 rounded-full bg-slate-100/80 backdrop-blur-sm">
          {icon || getDefaultIcon()}
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md">
        <h3 className="text-xl font-semibold text-slate-800 mb-3">
          {title}
        </h3>
        
        <p className="text-slate-600 leading-relaxed mb-8">
          {description}
        </p>

        {/* Action Button */}
        {action && (
          <Button
            onClick={action.onClick}
            variant="primary"
            className="
              bg-gradient-to-r from-blue-600 to-purple-600 
              hover:from-blue-700 hover:to-purple-700
              shadow-lg shadow-blue-500/25
              hover:shadow-xl hover:shadow-blue-500/30
              transform hover:scale-105
              transition-all duration-300
            "
          >
            <Plus className="w-5 h-5 mr-2" />
            {action.label}
          </Button>
        )}
      </div>

      {/* Decorative elements */}
      {variant !== 'minimal' && (
        <>
          <div className="absolute top-6 left-1/4 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse" />
          <div className="absolute top-12 right-1/3 w-0.5 h-0.5 bg-purple-400/40 rounded-full animate-pulse delay-700" />
          <div className="absolute bottom-8 left-1/3 w-0.5 h-0.5 bg-blue-300/30 rounded-full animate-pulse delay-300" />
        </>
      )}

      {/* Subtle animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-1000 rounded-2xl pointer-events-none" />
    </div>
  );
};
