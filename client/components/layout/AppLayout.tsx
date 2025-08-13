'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />
      
      <main className={`
        flex-1 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
      `}>
        {children}
      </main>
    </div>
  );
};
