'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, User, Menu, X, LogOut, Settings, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onCreateNote?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onLogout?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  variant?: 'default' | 'glass' | 'minimal';
  notificationCount?: number;
}

export const Header = ({
  onCreateNote,
  searchTerm = '',
  onSearchChange,
  onLogout,
  user,
  variant = 'default',
  notificationCount = 0
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const variantStyles = {
    default: 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-lg shadow-slate-500/5',
    glass: 'bg-white/20 backdrop-blur-2xl border-b border-white/20 shadow-xl shadow-slate-500/10',
    minimal: 'bg-white border-b border-slate-200'
  };

  return (
    <header className={`sticky top-0 z-40 ${variantStyles[variant]}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left side - Logo/Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <div className="w-4 h-4 bg-white rounded-sm" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                NoteTaker
              </h1>
            </div>
          </div>

          {/* Center - Search (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="w-full relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5 
                  bg-white/80 backdrop-blur-sm
                  border border-slate-200/60 rounded-xl
                  text-slate-700 placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                  transition-all duration-300 hover:bg-white/90
                "
                placeholder="Search notes..."
              />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-all duration-200"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Create Note Button */}
            {onCreateNote && (
              <button
                onClick={onCreateNote}
                className="
                  flex items-center space-x-2 px-3 sm:px-4 py-2.5 
                  bg-gradient-to-r from-blue-600 to-purple-600 
                  text-white rounded-xl font-medium text-sm sm:text-base
                  hover:shadow-lg hover:shadow-blue-500/25
                  transition-all duration-300 hover:scale-105
                  group
                "
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-90" />
                <span className="hidden sm:inline">New Note</span>
                <span className="sm:hidden">New</span>
              </button>
            )}

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-all duration-200 group">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="
                  flex items-center space-x-2 p-1.5 rounded-xl 
                  hover:bg-slate-100/80 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                "
              >
                <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="
                  absolute right-0 mt-2 w-64 
                  bg-white/95 backdrop-blur-xl rounded-2xl 
                  border border-slate-200/50 shadow-xl shadow-slate-500/10
                  py-2 z-50 animate-in slide-in-from-top-2 duration-200
                ">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button className="
                      w-full flex items-center space-x-3 px-4 py-2.5
                      text-slate-700 hover:bg-slate-50 transition-colors duration-200
                      group
                    ">
                      <Settings className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                      <span>Settings</span>
                    </button>
                    
                    {onLogout && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="
                          w-full flex items-center space-x-3 px-4 py-2.5
                          text-red-600 hover:bg-red-50 transition-colors duration-200
                          group
                        "
                      >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span>Sign out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div className="lg:hidden pb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5 
                  bg-white/80 backdrop-blur-sm
                  border border-slate-200/60 rounded-xl
                  text-slate-700 placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                  transition-all duration-300 hover:bg-white/90
                "
                placeholder="Search notes..."
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              {onCreateNote && (
                <button
                  onClick={() => {
                    onCreateNote();
                    setIsMobileMenuOpen(false);
                  }}
                  className="
                    w-full flex items-center space-x-3 px-4 py-3
                    bg-gradient-to-r from-blue-600 to-purple-600 
                    text-white rounded-xl font-medium
                    hover:shadow-lg hover:shadow-blue-500/25
                    transition-all duration-300
                  "
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Note</span>
                </button>
              )}
              
              <button className="
                w-full flex items-center justify-between px-4 py-3
                text-slate-700 hover:bg-slate-100/80 rounded-xl
                transition-all duration-200
              ">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-slate-500" />
                  <span>Notifications</span>
                </div>
                {notificationCount > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating particles effect */}
      <div className="absolute top-2 left-1/4 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse" />
      <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-purple-400/40 rounded-full animate-pulse delay-300" />
    </header>
  );
};
