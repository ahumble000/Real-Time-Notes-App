'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Settings,
  Users,
  Plus,
  BookOpen,
  Edit,
  Share2,
  Globe,
  Lock
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  members: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: string;
    joinedAt: string;
  }>;
  settings: {
    isPublic: boolean;
    allowGuestAccess: boolean;
    theme: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  workspace: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WorkspacePage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);

  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated && workspaceId) {
      fetchWorkspace();
      fetchWorkspaceNotes();
    }
  }, [isAuthenticated, authLoading, workspaceId, router]);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workspaces/${workspaceId}`);
      setWorkspace(response.data.workspace);
    } catch (error: any) {
      console.error('Error fetching workspace:', error);
      toast.error(error.response?.data?.error || 'Failed to load workspace');
      router.push('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceNotes = async () => {
    try {
      setNotesLoading(true);
      const response = await api.get(`/notes?workspace=${workspaceId}`);
      setNotes(response.data.notes || []);
    } catch (error: any) {
      console.error('Error fetching workspace notes:', error);
      toast.error('Failed to load workspace notes');
    } finally {
      setNotesLoading(false);
    }
  };

  const isOwner = workspace?.owner._id === user?.id;
  const isMember = workspace?.members?.some(m => m.user._id === user?.id);
  const canAccess = isOwner || isMember || (workspace?.settings?.isPublic && workspace?.settings?.allowGuestAccess);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 animate-pulse">
            <div className="h-12 bg-gray-300 border-2 border-black w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 border-2 border-black w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6 text-center">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-12 transform -rotate-1">
            <h2 className="text-3xl font-black text-black mb-4">WORKSPACE NOT FOUND</h2>
            <p className="text-lg font-bold text-gray-600 mb-6">
              The workspace you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button
              onClick={() => router.push('/workspaces')}
              className="bg-blue-400 hover:bg-blue-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              BACK TO WORKSPACES
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6 text-center">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-12 transform -rotate-1">
            <div className="w-16 h-16 bg-red-100 border-4 border-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-red-600 mb-4">ACCESS DENIED</h2>
            <p className="text-lg font-bold text-gray-600 mb-6">
              This workspace is private and you don't have permission to access it.
            </p>
            <Button
              onClick={() => router.push('/workspaces')}
              className="bg-blue-400 hover:bg-blue-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              BACK TO WORKSPACES
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/workspaces')}
                className="bg-gray-300 hover:bg-gray-200 text-black font-black p-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-black text-black">{workspace.name}</h1>
                  <div className="flex items-center gap-2">
                    {workspace.settings.isPublic ? (
                      <div className="flex items-center gap-1 bg-green-100 border-2 border-green-600 px-3 py-1 rounded-lg">
                        <Globe className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-green-600">PUBLIC</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-red-100 border-2 border-red-600 px-3 py-1 rounded-lg">
                        <Lock className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-bold text-red-600">PRIVATE</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {workspace.description && (
                  <p className="text-lg font-bold text-gray-700 mb-2">{workspace.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm font-bold text-gray-600">
                  <span>👤 Owner: {workspace.owner.username}</span>
                  <span>👥 {workspace.members.length + 1} member{workspace.members.length > 0 ? 's' : ''}</span>
                  <span>📅 Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(isOwner || isMember) && (
                <Button
                  onClick={() => router.push(`/notes/new?workspace=${workspaceId}`)}
                  className="bg-green-400 hover:bg-green-300 text-black font-black px-4 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  NEW NOTE
                </Button>
              )}
              
              {isOwner && (
                <Button
                  onClick={() => router.push(`/workspaces/${workspaceId}/settings`)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  SETTINGS
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-black">📝 WORKSPACE NOTES</h2>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <span className="font-bold text-gray-600">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {notesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 border-4 border-black p-6 animate-pulse">
                  <div className="h-6 bg-gray-300 border-2 border-black mb-4"></div>
                  <div className="h-4 bg-gray-200 border-2 border-black mb-2"></div>
                  <div className="h-4 bg-gray-200 border-2 border-black w-3/4"></div>
                </div>
              ))}
            </div>
          ) : notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note, index) => (
                <div
                  key={note._id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/notes/${note._id}`)}
                >
                  <Card
                    className={`bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-all duration-200 ${
                      index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'
                    } hover:rotate-0`}
                  >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-black text-black line-clamp-2 flex-1">{note.title}</h3>
                    {note.isPublic && (
                      <div className="ml-2 bg-green-100 border-2 border-green-600 px-2 py-1 rounded-lg">
                        <Globe className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-100 border-3 border-black rounded-xl p-3 mb-4">
                    <p className="text-sm font-bold text-gray-700 line-clamp-3">
                      {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <span>✍️ {note.author.username}</span>
                    <span>📅 {new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {note.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-blue-400 border-2 border-black px-2 py-1 rounded-lg font-bold text-black text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="bg-gray-300 border-2 border-black px-2 py-1 rounded-lg font-bold text-black text-xs">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-2xl font-black text-black mb-4">NO NOTES YET</h3>
              <p className="text-lg font-bold text-gray-600 mb-6">
                This workspace doesn't have any notes yet.
              </p>
              {(isOwner || isMember) && (
                <Button
                  onClick={() => router.push(`/notes/new?workspace=${workspaceId}`)}
                  className="bg-green-400 hover:bg-green-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                >
                  CREATE FIRST NOTE
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
