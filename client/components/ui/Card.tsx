'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'brutal' | 'shadow' | 'bordered';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card = ({ 
  children, 
  className = '', 
  hover = false,
  variant = 'default',
  padding = 'md'
}: CardProps) => {
  const baseClasses = `
    relative transition-all duration-200 border-4 border-black rounded-2xl
    ${hover ? 'group cursor-pointer' : ''}
    overflow-hidden
  `;

  const variantStyles = {
    default: `
      bg-white shadow-[4px_4px_0px_0px_#000]
      ${hover ? 'hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]' : ''}
    `,
    primary: `
      bg-blue-400 shadow-[4px_4px_0px_0px_#000]
      ${hover ? 'hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-blue-300' : ''}
    `,
    secondary: `
      bg-purple-400 shadow-[4px_4px_0px_0px_#000]
      ${hover ? 'hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-purple-300' : ''}
    `,
    danger: `
      bg-red-400 shadow-[4px_4px_0px_0px_#000]
      ${hover ? 'hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-red-300' : ''}
    `,
    warning: `
      bg-yellow-400 shadow-[4px_4px_0px_0px_#000]
      ${hover ? 'hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-yellow-300' : ''}
    `,
    success: `
      bg-green-400 shadow-[4px_4px_0px_0px_#000]
      ${hover ? 'hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-green-300' : ''}
    `,
    brutal: `
      bg-gradient-to-br from-pink-400 to-purple-400 shadow-[6px_6px_0px_0px_#000]
      ${hover ? 'hover:shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:from-pink-300 hover:to-purple-300' : ''}
      transform rotate-1
      ${hover ? 'hover:rotate-0' : ''}
    `,
    shadow: `
      bg-white shadow-[8px_8px_0px_0px_#000]
      ${hover ? 'hover:shadow-[10px_10px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]' : ''}
    `,
    bordered: `
      bg-white border-8 shadow-[4px_4px_0px_0px_#000]
      ${hover ? 'hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]' : ''}
    `
  };

  const paddingStyles = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  return (
    <div className={`
      ${baseClasses} 
      ${variantStyles[variant]} 
      ${paddingStyles[padding]} 
      ${className}
    `}>
      {/* Decorative elements */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 border-2 border-black rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-300 border-2 border-black rounded-full"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
