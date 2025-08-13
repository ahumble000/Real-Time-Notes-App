'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { NoteCard } from '@/components/layout/NoteCard';
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
        <div className="relative">
          {/* Neubrutalism loading card */}
          <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] transform rotate-1">
            <div className="bg-yellow-300 border-3 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000] -rotate-2 text-center">
              <div className="w-8 h-8 border-3 border-black rounded-full border-t-black animate-spin mx-auto"></div>
              <p className="mt-6 text-xl font-black text-black tracking-tight">
                Loading...
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] transform -rotate-1 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 border-3 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                  <span className="text-2xl font-black text-black">📝</span>
                </div>
                <div>
                  <h1 className="text-4xl font-black text-black tracking-tight">My Notes</h1>
                  <p className="text-lg font-bold text-gray-700">Create, collaborate, and organize</p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="brutal"
                size="lg"
                icon={<span className="text-xl">+</span>}
              >
                New Note
              </Button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 border-2 border-black rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-300 border-2 border-black rounded-full"></div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search your notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-black placeholder-gray-500 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xl">🔍</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-4 border-black rounded-2xl p-2 shadow-[4px_4px_0px_0px_#000]">
            <nav className="flex gap-2">
              {[
                { key: 'public', label: 'Public Notes', color: 'bg-blue-400' },
                { key: 'private', label: 'My Private Notes', color: 'bg-purple-400' },
                { key: 'my', label: 'All My Notes', color: 'bg-green-400' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as any)}
                  className={`flex-1 py-3 px-4 border-3 border-black rounded-xl font-black text-black transition-all duration-200 ${
                    activeTab === tab.key
                      ? `${tab.color} shadow-[3px_3px_0px_0px_#000] transform translate-x-[-1px] translate-y-[-1px]`
                      : 'bg-gray-100 hover:bg-gray-200 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 border-2 border-black rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 border-2 border-black rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 border-2 border-black rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 border-2 border-black rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white border-4 border-black rounded-2xl p-12 shadow-[8px_8px_0px_0px_#000] transform rotate-1 max-w-lg mx-auto relative">
              <div className="text-6xl mb-6">📝</div>
              <h3 className="text-3xl font-black text-black mb-4 tracking-tight">No notes found</h3>
              <p className="text-lg font-bold text-gray-700 mb-8">
                {searchTerm
                  ? `No notes match your search "${searchTerm}"`
                  : activeTab === 'public'
                  ? "No public notes available yet."
                  : "You haven't created any notes yet."}
              </p>
              {activeTab !== 'public' && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="brutal"
                  size="lg"
                  icon={<span className="text-xl">+</span>}
                >
                  Create your first note
                </Button>
              )}
              
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 border-2 border-black rounded-full"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-300 border-2 border-black rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="mt-12 flex justify-center">
                <div className="bg-white border-4 border-black rounded-2xl p-2 shadow-[4px_4px_0px_0px_#000]">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-4 py-2 border-3 border-black rounded-xl bg-gray-100 hover:bg-gray-200 font-black text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      ←
                    </button>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border-3 border-black rounded-xl font-black text-black transition-all duration-200 ${
                          pagination.page === page
                            ? 'bg-yellow-400 shadow-[3px_3px_0px_0px_#000] transform translate-x-[-1px] translate-y-[-1px]'
                            : 'bg-gray-100 hover:bg-gray-200 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-4 py-2 border-3 border-black rounded-xl bg-gray-100 hover:bg-gray-200 font-black text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      →
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
      <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] relative">
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 border-2 border-black rounded-full"></div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-300 border-2 border-black rounded-full"></div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-black mb-6 tracking-tight">Create New Note</h3>
          </div>

          <InputField
            label="Title"
            value={title}
            onChange={setTitle}
            placeholder="Enter note title"
            required
            disabled={loading}
          />

          <div>
            <label className="block text-lg font-black text-black mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              rows={8}
              disabled={loading}
              className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-black placeholder-gray-500 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] resize-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={loading}
              className="w-5 h-5 border-3 border-black rounded focus:outline-none"
            />
            <label htmlFor="isPublic" className="text-lg font-bold text-black">
              Make this note public (visible to everyone)
            </label>
          </div>

          <div className="flex justify-end gap-4">
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
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Create Note
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
