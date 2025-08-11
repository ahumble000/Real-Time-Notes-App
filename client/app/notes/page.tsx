'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { NoteCard } from '@/components/layout/NoteCard';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';
import { EmptyState } from '@/components/layout/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Note, CreateNoteData } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'my'>('public');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated) {
      fetchNotes();
    }
  }, [isAuthenticated, authLoading, activeTab, searchTerm, pagination.page]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (activeTab) {
        case 'public':
          endpoint = '/notes/public';
          break;
        case 'private':
          endpoint = '/notes/private';
          break;
        case 'my':
          endpoint = '/notes/my';
          break;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`${endpoint}?${params}`);
      setNotes(response.data.notes);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (data: CreateNoteData) => {
    try {
      const response = await api.post('/notes', data);
      toast.success('Note created successfully!');
      setShowCreateModal(false);
      
      // If we're on the "my" tab or the note matches current view, refresh
      if (activeTab === 'my' || (activeTab === 'public' && data.isPublic)) {
        fetchNotes();
      }
      
      // Navigate to the new note
      router.push(`/notes/${response.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await api.delete(`/notes/${noteId}`);
      toast.success('Note deleted successfully!');
      fetchNotes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete note');
    }
  };

  const handleTabChange = (tab: 'public' | 'private' | 'my') => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCreateNote={() => setShowCreateModal(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={handleLogout}
        user={{
          name: user?.username || 'User',
          email: user?.email || 'user@example.com'
        }}
        variant="glass"
        notificationCount={0}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange('public')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Public Notes
            </button>
            <button
              onClick={() => handleTabChange('private')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'private'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Private Notes
            </button>
            <button
              onClick={() => handleTabChange('my')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All My Notes
            </button>
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : notes.length === 0 ? (
          <EmptyState
            title="No notes found"
            description={
              searchTerm
                ? `No notes match your search "${searchTerm}"`
                : activeTab === 'public'
                ? "No public notes available yet."
                : "You haven't created any notes yet."
            }
            action={
              activeTab !== 'public'
                ? {
                    label: 'Create your first note',
                    onClick: () => setShowCreateModal(true)
                  }
                : undefined
            }
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onClick={() => router.push(`/notes/${note._id}`)}
                  onDelete={() => handleDeleteNote(note._id)}
                  showAuthor={activeTab === 'public'}
                  currentUserId={user?.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateNote}
      />
    </div>
  );
}

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNoteData) => void;
}

function CreateNoteModal({ isOpen, onClose, onSubmit }: CreateNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        isPublic
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setIsPublic(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setContent('');
      setIsPublic(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Note" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="Enter note title"
          required
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            rows={8}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
            Make this note public (visible to everyone)
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Create Note
          </Button>
        </div>
      </form>
    </Modal>
  );
}
