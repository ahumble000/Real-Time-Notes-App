'use client';

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'card' | 'list' | 'table';
  className?: string;
}

export const LoadingSkeleton = ({
  count = 6,
  variant = 'card',
  className = ''
}: LoadingSkeletonProps) => {

  const CardSkeleton = () => (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-16 bg-slate-200/80 rounded-full"></div>
        <div className="h-4 w-4 bg-slate-200/80 rounded"></div>
      </div>
      
      {/* Title */}
      <div className="h-6 bg-slate-200/80 rounded-lg mb-2 w-3/4"></div>
      
      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-200/80 rounded w-full"></div>
        <div className="h-4 bg-slate-200/80 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200/80 rounded w-4/6"></div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-slate-200/80 rounded"></div>
          <div className="h-3 w-16 bg-slate-200/80 rounded"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-slate-200/80 rounded"></div>
          <div className="h-3 w-12 bg-slate-200/80 rounded"></div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute top-4 left-6 w-1 h-1 bg-blue-400/20 rounded-full animate-pulse delay-100" />
      <div className="absolute top-8 right-8 w-0.5 h-0.5 bg-purple-400/30 rounded-full animate-pulse delay-500" />
    </div>
  );

  const ListSkeleton = () => (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-xl p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-slate-200/80 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200/80 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200/80 rounded w-1/2"></div>
        </div>
        <div className="h-4 w-4 bg-slate-200/80 rounded"></div>
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200/50">
        <div className="flex space-x-4">
          <div className="h-4 bg-slate-200/80 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200/80 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200/80 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200/80 rounded w-1/6"></div>
        </div>
      </div>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 border-b border-slate-200/50 last:border-b-0 animate-pulse">
          <div className="flex space-x-4">
            <div className="h-4 bg-slate-200/80 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200/80 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200/80 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200/80 rounded w-1/6"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'list':
        return <ListSkeleton />;
      case 'table':
        return <TableSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  if (variant === 'table') {
    return (
      <div className={className}>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className={`${variant === 'card' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};
