'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'bordered' | 'shadow' | 'gradient' | 'glass' | 'minimal' | 'glow';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  background?: 'white' | 'slate' | 'gradient' | 'transparent';
}

export const Card = ({ 
  children, 
  className = '', 
  hover = false,
  variant = 'default',
  padding = 'md',
  rounded = 'xl',
  background = 'white'
}: CardProps) => {
  const baseClasses = `
    relative transition-all duration-300 ease-out
    ${hover ? 'group cursor-pointer' : ''}
  `;

  const variantStyles = {
    default: `
      border border-slate-200/60 shadow-lg shadow-slate-500/5
      ${hover ? 'hover:shadow-2xl hover:shadow-slate-500/10 hover:-translate-y-1 hover:border-slate-300/70' : ''}
      backdrop-blur-sm
    `,
    bordered: `
      border-2 border-slate-300/70 shadow-sm
      ${hover ? 'hover:border-slate-400/80 hover:shadow-lg hover:shadow-slate-500/10 hover:-translate-y-0.5' : ''}
    `,
    shadow: `
      shadow-2xl shadow-slate-500/10 border border-slate-100/50
      ${hover ? 'hover:shadow-3xl hover:shadow-slate-500/15 hover:-translate-y-2 hover:scale-[1.01]' : ''}
    `,
    gradient: `
      border border-white/30 shadow-xl shadow-slate-500/20
      ${hover ? 'hover:shadow-2xl hover:shadow-slate-500/25 hover:-translate-y-1 hover:scale-[1.02]' : ''}
    `,
    glass: `
      border border-white/30 backdrop-blur-xl shadow-xl shadow-slate-500/20
      ${hover ? 'hover:bg-white/40 hover:shadow-2xl hover:shadow-slate-500/25 hover:-translate-y-1' : ''}
    `,
    minimal: `
      border-0 shadow-none
      ${hover ? 'hover:bg-slate-50/80 hover:-translate-y-0.5' : ''}
    `,
    glow: `
      border border-slate-200/50 shadow-lg shadow-slate-500/10
      ${hover ? 'hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:border-blue-300/50' : ''}
      before:absolute before:inset-0 before:rounded-inherit before:p-[1px]
      before:bg-gradient-to-r before:from-blue-500/20 before:via-purple-500/20 before:to-blue-500/20
      before:mask-composite before:-z-10 before:opacity-0
      ${hover ? 'hover:before:opacity-100' : ''}
    `
  };

  const backgroundStyles = {
    white: 'bg-white/95',
    slate: 'bg-slate-50/95',
    gradient: 'bg-gradient-to-br from-white via-slate-50/50 to-white',
    transparent: 'bg-transparent'
  };

  // Override background for glass variant
  const finalBackground = variant === 'glass' ? 'bg-white/20' : backgroundStyles[background];

  const paddingStyles = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-10'
  };

  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  };

  return (
    <div className={`
      ${baseClasses} 
      ${variantStyles[variant]} 
      ${finalBackground}
      ${paddingStyles[padding]} 
      ${roundedStyles[rounded]} 
      ${className}
      overflow-hidden
    `}>
      {/* Gradient overlay for gradient variant */}
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 -z-10" />
      )}

      {/* Floating animation elements for glow variant */}
      {variant === 'glow' && hover && (
        <>
          <div className="absolute top-2 left-4 w-1 h-1 bg-blue-400/60 rounded-full animate-pulse" />
          <div className="absolute top-4 right-6 w-0.5 h-0.5 bg-purple-400/60 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-3 left-1/3 w-0.5 h-0.5 bg-blue-400/60 rounded-full animate-pulse delay-700" />
        </>
      )}

      {/* Content with gentle entrance animation on hover */}
      <div className={`
        relative z-10 transition-all duration-300 ease-out
        ${hover ? 'group-hover:scale-[1.01]' : ''}
      `}>
        {children}
      </div>

      {/* Subtle shine effect */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
    </div>
  );
};
