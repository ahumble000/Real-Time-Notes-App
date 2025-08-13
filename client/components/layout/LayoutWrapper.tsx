'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useState, useEffect } from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Don't show layout on auth pages
  const isAuthPage = pathname?.startsWith('/auth/');
  
  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent<{ collapsed: boolean }>) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
        <div className="relative">
          {/* Neubrutalism loading card */}
          <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] transform rotate-1">
            <div className="bg-yellow-300 border-3 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000] -rotate-2">
              <LoadingSpinner size="xl" variant="gentle" />
              <p className="mt-6 text-xl font-black text-black tracking-tight">
                Loading your workspace...
              </p>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-pink-400 border-3 border-black rounded-full shadow-[4px_4px_0px_0px_#000]"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-400 border-3 border-black rounded-full shadow-[3px_3px_0px_0px_#000]"></div>
        </div>
      </div>
    );
  }

  if (isAuthPage || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
      <AppSidebar />
      <main 
        className="flex-1 transition-all duration-300" 
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '256px',
          width: sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)'
        }}
      >
        {children}
      </main>
    </div>
  );
};
