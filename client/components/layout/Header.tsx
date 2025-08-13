'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  children?: React.ReactNode;
}

export const Header = ({ 
  title = "Welcome Back!",
  showSearch = true,
  showNotifications = true,
  children 
}: HeaderProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent<{ collapsed: boolean }>) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
  }, []);

  return (
    <header 
      className="bg-white border-4 border-black shadow-[0px_4px_0px_0px_#000] transition-all duration-300 relative z-40"
      style={{ 
        marginLeft: sidebarCollapsed ? '80px' : '256px',
        width: sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)'
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 border-4 border-black rounded-2xl px-4 py-2 shadow-[4px_4px_0px_0px_#000] transform rotate-1">
              <h1 className="text-2xl font-black text-black tracking-tight">
                {title}
              </h1>
            </div>
            
            {/* Decorative elements */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000]"></div>
              <div className="w-3 h-3 bg-green-400 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000]"></div>
              <div className="w-2 h-2 bg-pink-400 border-2 border-black rounded-full shadow-[1px_1px_0px_0px_#000]"></div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            {showSearch && (
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    className="w-64 px-4 py-2 border-4 border-black rounded-2xl font-bold text-black placeholder-gray-500 bg-gray-50 focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 focus:outline-none"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                </div>
              </div>
            )}

            {/* Mobile Search Button */}
            {showSearch && (
              <button className="md:hidden p-3 bg-gray-100 border-4 border-black rounded-2xl hover:bg-gray-200 transition-all duration-200 shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]">
                <Search className="w-5 h-5 text-black" />
              </button>
            )}

            {/* Quick Actions */}
            <Button
              variant="brutal"
              size="sm"
              className="hidden sm:flex items-center gap-2 bg-green-400 hover:bg-green-300"
            >
              <Plus className="w-4 h-4" />
              New Note
            </Button>

            {/* Notifications */}
            {showNotifications && (
              <button className="relative p-3 bg-yellow-400 border-4 border-black rounded-2xl hover:bg-yellow-300 transition-all duration-200 shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
                <Bell className="w-5 h-5 text-black" />
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-400 border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-xs font-black text-black">3</span>
                </div>
              </button>
            )}

            {/* Mobile Menu */}
            <button className="sm:hidden p-3 bg-purple-400 border-4 border-black rounded-2xl hover:bg-purple-300 transition-all duration-200 shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]">
              <Menu className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        {/* Custom content */}
        {children && (
          <div className="mt-4 pt-4 border-t-4 border-black">
            {children}
          </div>
        )}
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-yellow-400 to-pink-400"></div>
    </header>
  );
};
