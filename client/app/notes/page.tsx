'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { NoteCard } from '@/components/layout/NoteCard';
import { Modal } from '@/components/ui/Modal';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Note, CreateNoteData } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid,
  List,
  Clock,
  User,
  Globe
} from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'my'>('public');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const { isAuthenticated, user, loading: authLoading } = useAuth();
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
      
      // Use real API calls
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
      
      setNotes(response.data.notes || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      }));
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData: CreateNoteData) => {
    try {
      const response = await api.post('/notes', noteData);
      
      toast.success('Note created successfully!');
      setShowCreateModal(false);
      fetchNotes(); // Refresh the notes list
      
      // Navigate to the new note
      router.push(`/notes/${response.data._id}`);
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error(error.response?.data?.error || 'Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/notes/${noteId}`);
      
      toast.success('Note deleted successfully!');
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error(error.response?.data?.error || 'Failed to delete note');
    }
  };

  const handleViewNote = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  const handleEditNote = (noteId: string) => {
    router.push(`/notes/${noteId}?mode=edit`);
  };

  const handlePreviewNote = (noteId: string) => {
    router.push(`/notes/${noteId}?mode=preview`);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
        <div className="relative">
          <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] transform rotate-1">
            <div className="bg-yellow-300 border-3 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000] -rotate-2">
              <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-6 text-xl font-black text-black tracking-tight">
                Loading notes...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
      <Header title="My Notes">
        <div className="flex items-center justify-between">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 px-4 py-2 border-4 border-black rounded-2xl font-bold text-black placeholder-gray-500 bg-white focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 focus:outline-none"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border-4 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 font-bold transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-purple-400 text-black' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 font-bold transition-all duration-200 border-l-4 border-black ${
                  viewMode === 'list' 
                    ? 'bg-purple-400 text-black' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="brutal"
              className="bg-green-400 hover:bg-green-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Note
            </Button>
          </div>
        </div>
      </Header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex border-4 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_#000] bg-white">
              {[
                { key: 'public', label: 'Public Notes', icon: Globe },
                { key: 'private', label: 'Private Notes', icon: User },
                { key: 'my', label: 'My Notes', icon: Clock }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-3 px-6 py-4 font-black text-lg transition-all duration-200 border-r-4 border-black last:border-r-0 ${
                    activeTab === key
                      ? 'bg-yellow-400 text-black shadow-[inset_4px_4px_0px_0px_#000]'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] transform rotate-1">
                <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-xl font-black text-black">Loading notes...</p>
              </div>
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
              }
            `}>
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onClick={() => handleViewNote(note._id)}
                  onDelete={() => handleDeleteNote(note._id)}
                  onEdit={() => handleEditNote(note._id)}
                  onPreview={() => handlePreviewNote(note._id)}
                  showAuthor={activeTab !== 'my'}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="bg-white border-4 border-black rounded-2xl p-12 shadow-[8px_8px_0px_0px_#000] text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_#000]">
                  <Search className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-black text-black mb-4">No notes found</h3>
                <p className="text-gray-600 font-bold mb-6">
                  {searchTerm 
                    ? `No notes match "${searchTerm}"`
                    : 'Start by creating your first note!'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    variant="brutal"
                    className="bg-green-400 hover:bg-green-300"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Note
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2 bg-white border-4 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_#000]">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-4 py-2 font-black rounded-xl border-3 border-black transition-all duration-200 ${
                      pagination.page === page
                        ? 'bg-purple-400 text-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
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

// Create Note Modal Component
interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (noteData: CreateNoteData) => void;
}

function CreateNoteModal({ isOpen, onClose, onSubmit }: CreateNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        isPublic: !isPrivate
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setIsPrivate(false);
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Create New Note"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Note Title"
          value={title}
          onChange={setTitle}
          placeholder="Enter a catchy title..."
          required
        />

        <div>
          <label className="block text-lg font-black text-black mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            required
            rows={8}
            className="w-full px-4 py-3 border-4 border-black rounded-2xl font-bold text-black placeholder-gray-500 bg-white focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-5 h-5 border-3 border-black rounded accent-purple-400"
          />
          <label htmlFor="isPrivate" className="font-bold text-black">
            Make this note private
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="brutal"
            className="flex-1 bg-green-400 hover:bg-green-300"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
