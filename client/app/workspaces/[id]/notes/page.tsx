'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WorkspaceNotesPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  useEffect(() => {
    // Redirect to the main workspace page which shows notes
    router.push(`/workspaces/${workspaceId}`);
  }, [workspaceId, router]);

  return null;
}
