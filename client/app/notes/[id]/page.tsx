'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  Save, 
  Users, 
  Eye, 
  Edit3, 
  Globe, 
  Lock,
  Settings,
  Loader2,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { InputField } from '@/components/ui/InputField';
import { Note, ConnectedUser, TypingUser, UpdateNoteData } from '@/types';
import api from '@/lib/api';
import socketService from '@/lib/socket';
import toast from 'react-hot-toast';

export default function NoteEditorPage() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [previewingUsers, setPreviewingUsers] = useState<ConnectedUser[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef('');

  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated && noteId) {
      loadNote();
    }
  }, [isAuthenticated, authLoading, noteId]);

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

  useEffect(() => {
    if (!note || !socketService.isConnected()) return;

    // Join the note room
    socketService.joinNote(noteId);

    // Set up socket event listeners
    socketService.onNoteUpdated(handleNoteUpdated);
    socketService.onUsersInNote(handleUsersInNote);
    socketService.onUserTyping(handleUserTyping);
    socketService.onError(handleSocketError);
    
    // Listen for preview mode changes
    socketService.getSocket()?.on('preview-mode-updated', handlePreviewModeUpdate);

    return () => {
      // Clean up socket listeners
      socketService.offNoteUpdated();
      socketService.offUsersInNote();
      socketService.offUserTyping();
      socketService.offError();
      socketService.getSocket()?.off('preview-mode-updated');
      socketService.leaveNote(noteId);
    };
  }, [note, noteId]);

  useEffect(() => {
    // Auto-save when content changes
    if (content !== lastSavedContentRef.current && canEdit) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 1000); // Auto-save after 1 second of inactivity
    }

    // Handle typing indicator
    if (canEdit) {
      socketService.sendTyping(noteId, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(noteId, false);
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [content, canEdit, noteId]);

  // Cleanup on unmount - notify that user is no longer previewing
  useEffect(() => {
    return () => {
      if (socketService.isConnected() && user?.id) {
        socketService.getSocket()?.emit('preview-mode-change', {
          noteId,
          userId: user.id,
          username: user.username,
          isPreview: false
        });
      }
    };
  }, [noteId, user]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notes/${noteId}`);
      const noteData = response.data;
      
      setNote(noteData);
      setContent(noteData.content);
      lastSavedContentRef.current = noteData.content;
      
      // Check if user can edit this note (author, collaborator, or public note)
      const userCanEdit = user?.id === noteData.author._id || 
                         noteData.collaborators.some((collab: any) => collab._id === user?.id) ||
                         noteData.isPublic;
      setCanEdit(userCanEdit);
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load note');
      router.push('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = useCallback(async () => {
    if (!canEdit || content === lastSavedContentRef.current) return;

    try {
      setSaving(true);
      
      // Send update via socket for real-time sync
      socketService.updateNote(noteId, content);
      
      lastSavedContentRef.current = content;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [content, canEdit, noteId]);

  const handleManualSave = async () => {
    if (!canEdit) return;

    try {
      setSaving(true);
      const response = await api.put(`/notes/${noteId}`, { content });
      setNote(response.data);
      lastSavedContentRef.current = content;
      toast.success('Note saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleNoteUpdated = useCallback((data: any) => {
    if (data.content !== content) {
      setContent(data.content);
      lastSavedContentRef.current = data.content;
      
      // Update textarea cursor position if needed
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const cursorPosition = textarea.selectionStart;
        textarea.value = data.content;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
  }, [content]);

  const handleUsersInNote = useCallback((users: ConnectedUser[]) => {
    setConnectedUsers(users);
  }, []);

  const handleUserTyping = useCallback((data: TypingUser) => {
    setTypingUsers(prev => {
      const filtered = prev.filter(user => user.userId !== data.userId);
      if (data.isTyping) {
        return [...filtered, data];
      }
      return filtered;
    });

    // Clear typing indicator after 3 seconds
    if (data.isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }, 3000);
    }
  }, []);

  const handleSocketError = useCallback((error: any) => {
    toast.error(error.message || 'Socket connection error');
  }, []);

  const handlePreviewModeChange = (isPreview: boolean) => {
    setIsPreviewMode(isPreview);
    
    // Notify other users about preview mode change
    if (socketService.isConnected()) {
      socketService.getSocket()?.emit('preview-mode-change', {
        noteId,
        userId: user?.id,
        username: user?.username,
        isPreview
      });
    }
  };

  const handlePreviewModeUpdate = useCallback((data: any) => {
    setPreviewingUsers(prev => {
      const filtered = prev.filter(u => u.id !== data.userId);
      if (data.isPreview) {
        return [...filtered, { id: data.userId, username: data.username }];
      }
      return filtered;
    });
  }, []);

  const handleUpdateNote = async (data: UpdateNoteData) => {
    if (!canEdit) return;

    try {
      const response = await api.put(`/notes/${noteId}`, data);
      setNote(response.data);
      toast.success('Note updated successfully!');
      setShowSettings(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update note');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Note not found</p>
          <Button onClick={() => router.push('/notes')} className="mt-4">
            Back to Notes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/notes')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                  {note.title}
                </h1>
                <div className="flex items-center space-x-1">
                  {note.isPublic ? (
                    <div className="flex items-center space-x-1">
                      <Globe className="h-5 w-5 text-green-500" />
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                        Public - Anyone can edit
                      </span>
                    </div>
                  ) : (
                    <Lock className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connected Users */}
              {connectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {connectedUsers.length} user{connectedUsers.length !== 1 ? 's' : ''} online
                  </span>
                  <div className="flex -space-x-2">
                    {connectedUsers.slice(0, 3).map((connectedUser, index) => (
                      <div
                        key={connectedUser.id}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-500 text-white text-xs font-medium border-2 border-white"
                        title={connectedUser.username}
                      >
                        {connectedUser.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {connectedUsers.length > 3 && (
                      <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 text-white text-xs font-medium border-2 border-white">
                        +{connectedUsers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handlePreviewModeChange(false)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    !isPreviewMode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handlePreviewModeChange(true)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isPreviewMode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Preview
                </button>
              </div>

              {canEdit && (
                <>
                  <Button
                    onClick={handleManualSave}
                    disabled={saving || content === lastSavedContentRef.current}
                    className="flex items-center space-x-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => setShowSettings(true)}
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                </>
              )}

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="
                    flex items-center space-x-2 p-1.5 rounded-xl 
                    hover:bg-gray-100 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  "
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user?.username?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="
                    absolute right-0 mt-2 w-64 
                    bg-white/95 backdrop-blur-xl rounded-2xl 
                    border border-gray-200/50 shadow-xl
                    py-2 z-50 animate-in slide-in-from-top-2 duration-200
                  ">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-medium">
                          {user?.username?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user?.username || 'User'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowSettings(true);
                        }}
                        className="
                          w-full flex items-center space-x-3 px-4 py-2.5
                          text-gray-700 hover:bg-gray-50 transition-colors duration-200
                          group
                        "
                      >
                        <Settings className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                        <span>Note Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="min-h-[600px]">
          {isPreviewMode ? (
            <div className="relative">
              {/* Preview Users Header */}
              {previewingUsers.length > 0 && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {previewingUsers.length} user{previewingUsers.length !== 1 ? 's' : ''} viewing in preview mode
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {previewingUsers.slice(0, 4).map((previewUser, index) => (
                      <div
                        key={previewUser.id}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-500 text-white text-xs font-medium border-2 border-white shadow-sm"
                        title={`${previewUser.username} is previewing`}
                      >
                        {previewUser.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {previewingUsers.length > 4 && (
                      <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-500 text-white text-xs font-medium border-2 border-white shadow-sm">
                        +{previewingUsers.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="markdown-preview"
                >
                  {content || '*No content yet. Switch to edit mode to start writing.*'}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              {/* Public Note Editor Warning */}
              {note.isPublic && user?.id !== note.author._id && (
                <div className="absolute top-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 z-10">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      <strong>Public Note:</strong> You can edit this note. Changes will be visible to everyone.
                    </span>
                  </div>
                </div>
              )}
              
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => canEdit && setContent(e.target.value)}
                placeholder={canEdit ? "Start writing your note..." : "You don't have permission to edit this note."}
                disabled={!canEdit}
                className="editor-textarea"
                style={{ 
                  minHeight: '600px',
                  paddingTop: note.isPublic && user?.id !== note.author._id ? '80px' : '20px'
                }}
              />
              
              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-md border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {typingUsers.map(user => user.username).join(', ')} 
                    {typingUsers.length === 1 ? ' is' : ' are'} typing...
                  </span>
                </div>
              )}

              {/* Auto-save indicator */}
              {saving && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-md border">
                  <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
                  <span className="text-xs text-gray-600">Saving...</span>
                </div>
              )}
            </div>
          )}
        </Card>
      </main>

      {/* Settings Modal */}
      {canEdit && (
        <NoteSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          note={note}
          onSubmit={handleUpdateNote}
        />
      )}
    </div>
  );
}

interface NoteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  onSubmit: (data: UpdateNoteData) => void;
}

function NoteSettingsModal({ isOpen, onClose, note, onSubmit }: NoteSettingsModalProps) {
  const [title, setTitle] = useState(note.title);
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(note.title);
      setIsPublic(note.isPublic);
    }
  }, [isOpen, note]);

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
        isPublic
      });
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Note Settings">
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="Enter note title"
          required
          disabled={loading}
        />

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
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Update Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
}
