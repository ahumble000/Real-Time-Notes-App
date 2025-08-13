'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Users, 
  BookTemplate, 
  BarChart3, 
  Settings,
  Home,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  User,
  Bell,
  Search
} from 'lucide-react';

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Emit custom event when sidebar collapses/expands
  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    
    // Emit custom event for layout wrapper to listen to
    const event = new CustomEvent('sidebar-toggle', {
      detail: { collapsed: newCollapsed }
    });
    window.dispatchEvent(event);
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      description: 'Overview & Analytics',
      color: 'bg-purple-400'
    },
    {
      label: 'Notes',
      icon: FileText,
      href: '/notes',
      description: 'All your notes',
      color: 'bg-blue-400'
    },
    {
      label: 'New Note',
      icon: Plus,
      href: '/notes/new',
      description: 'Create from templates',
      color: 'bg-green-400'
    },
    {
      label: 'Templates',
      icon: BookTemplate,
      href: '/templates',
      description: 'Note templates',
      color: 'bg-yellow-400'
    },
    {
      label: 'Workspaces',
      icon: Users,
      href: '/workspaces',
      description: 'Collaborate',
      color: 'bg-pink-400'
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      description: 'Usage insights',
      color: 'bg-cyan-400'
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      description: 'Preferences',
      color: 'bg-orange-400'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white border-4 border-black transition-all duration-300 z-50 shadow-[8px_0px_0px_0px_#000] flex flex-col ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b-4 border-black bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-300 border-3 border-black rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <h1 className="text-2xl font-black text-black tracking-tight">NoteApp</h1>
            </div>
          )}
          <button
            onClick={handleToggle}
            className="p-2 bg-white border-3 border-black rounded-xl hover:bg-yellow-200 transition-all duration-200 shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-black font-bold" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-black font-bold" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-3 bg-white flex-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative block group transition-all duration-200 ${
                active ? 'transform -rotate-1' : 'hover:transform hover:rotate-1'
              }`}
            >
              <div className={`relative overflow-hidden rounded-2xl border-4 border-black p-4 transition-all duration-200 ${
                active
                  ? `${item.color} shadow-[6px_6px_0px_0px_#000] transform translate-x-[-3px] translate-y-[-3px]`
                  : 'bg-gray-50 hover:bg-gray-100 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border-3 border-black shadow-[2px_2px_0px_0px_#000] ${
                    active ? 'bg-white' : item.color
                  }`}>
                    <Icon className={`w-5 h-5 text-black font-bold transition-transform group-hover:scale-110`} />
                  </div>
                  
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-black text-lg tracking-tight truncate">
                        {item.label}
                      </div>
                      <div className="text-sm font-bold text-gray-700 truncate opacity-80">
                        {item.description}
                      </div>
                    </div>
                  )}
                </div>

                {/* Active indicator */}
                {active && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-black border-2 border-white rounded-full shadow-[1px_1px_0px_0px_#fff]"></div>
                )}

                {/* Decorative elements */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 border-2 border-black rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-300 border-2 border-black rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Section */}
      <div className="p-4 border-t-4 border-black bg-gradient-to-r from-green-400 to-blue-400">
        {!collapsed ? (
          <div className="space-y-3">
            {/* User Profile */}
            <div className="bg-white border-4 border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-400 border-3 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  <User className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-black text-sm truncate">
                    {user?.email || 'User'}
                  </div>
                  <div className="text-xs font-bold text-gray-600 truncate">
                    {user?.email || 'user@email.com'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button className="flex-1 p-2 bg-white border-3 border-black rounded-xl hover:bg-yellow-200 transition-all duration-200 shadow-[2px_2px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px]">
                <Bell className="w-4 h-4 text-black mx-auto" />
              </button>
              <button className="flex-1 p-2 bg-white border-3 border-black rounded-xl hover:bg-yellow-200 transition-all duration-200 shadow-[2px_2px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px]">
                <Search className="w-4 h-4 text-black mx-auto" />
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 p-2 bg-red-400 border-3 border-black rounded-xl hover:bg-red-300 transition-all duration-200 shadow-[2px_2px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                <LogOut className="w-4 h-4 text-black mx-auto" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button 
              onClick={handleLogout}
              className="w-full p-3 bg-red-400 border-3 border-black rounded-xl hover:bg-red-300 transition-all duration-200 shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-black mx-auto" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
