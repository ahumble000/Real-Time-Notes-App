'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  rounded?: boolean;
  icon?: React.ReactNode;
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  rounded = true,
  icon
}: BadgeProps) => {
  const baseClasses = `
    inline-flex items-center font-medium transition-colors duration-200
    ${rounded ? 'rounded-full' : 'rounded-lg'}
  `;

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    secondary: 'bg-blue-50 text-blue-700 border border-blue-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-purple-50 text-purple-700 border border-purple-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {icon && <span className={iconSizeClasses[size]}>{icon}</span>}
      {children}
    </span>
  );
};
