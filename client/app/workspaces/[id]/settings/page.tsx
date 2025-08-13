'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WorkspaceSettings } from '@/components/features/WorkspaceSettings';

export default function WorkspaceSettingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading workspace settings..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <WorkspaceSettings workspaceId={workspaceId} />;
}
