'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProductivityDashboard } from '@/components/features/ProductivityDashboard';
import { Header } from '@/components/layout/Header';

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
        <div className="relative">
          {/* Neubrutalism loading card */}
          <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] transform rotate-1">
            <div className="bg-yellow-300 border-3 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000] -rotate-2">
              <LoadingSpinner size="lg" variant="gentle" />
              <p className="mt-6 text-xl font-black text-black tracking-tight">
                Loading dashboard...
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
      <Header title="Dashboard" />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <ProductivityDashboard />
        </div>
      </div>
    </div>
  );
}
