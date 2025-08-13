'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useParams, useSearchParams } from 'next/navigation';
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
  ChevronDown,
  Trash2
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
  const searchParams = useSearchParams();
  const noteId = params.id as string;
  const mode = searchParams.get('mode');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated && noteId) {
      loadNote();
    }
  }, [isAuthenticated, authLoading, noteId]);

  // Handle mode parameter from URL
  useEffect(() => {
    if (mode === 'preview') {
      setIsPreviewMode(true);
    } else if (mode === 'edit') {
      setIsPreviewMode(false);
    }
  }, [mode]);

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

  const handleDeleteNote = async () => {
    if (!note) return;
    
    // Check if user can delete this note (must be the author)
    const canDelete = user?.id === note.author._id;
    if (!canDelete) {
      toast.error('You can only delete your own notes');
      return;
    }

    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await api.delete(`/notes/${noteId}`);
        toast.success('Note deleted successfully!');
        router.push('/notes');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete note');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] transform rotate-1">
          <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-xl font-black text-black">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] text-center">
          <p className="text-xl font-black text-black mb-4">Note not found</p>
          <Button onClick={() => router.push('/notes')} variant="brutal" className="bg-blue-400 hover:bg-blue-300">
            Back to Notes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
      {/* Brutal Header */}
      <header className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Button
                variant="secondary"
                onClick={() => router.push('/notes')}
                className="bg-blue-400 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 font-black text-black flex items-center space-x-2 px-4 py-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>BACK TO NOTES</span>
              </Button>
              
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-black text-black truncate max-w-md bg-yellow-300 border-2 border-black px-4 py-2 shadow-[3px_3px_0px_0px_#000] transform -rotate-1">
                  📝 {note.title}
                </h1>
                <div className="flex items-center space-x-2">
                  {note.isPublic ? (
                    <div className="flex items-center space-x-2 bg-green-300 border-3 border-black px-3 py-2 shadow-[3px_3px_0px_0px_#000] transform rotate-1">
                      <Globe className="h-5 w-5 text-black" />
                      <span className="text-sm text-black font-black">
                        PUBLIC - ANYONE CAN EDIT
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 bg-red-300 border-3 border-black px-3 py-2 shadow-[3px_3px_0px_0px_#000] transform -rotate-1">
                      <Lock className="h-5 w-5 text-black" />
                      <span className="text-sm text-black font-black">PRIVATE</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connected Users - Brutal Style */}
              {connectedUsers.length > 0 && (
                <div className="flex items-center space-x-3 bg-purple-300 border-3 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000] transform rotate-1">
                  <Users className="h-5 w-5 text-black" />
                  <span className="text-sm font-black text-black">
                    {connectedUsers.length} USER{connectedUsers.length !== 1 ? 'S' : ''} ONLINE
                  </span>
                  <div className="flex -space-x-2">
                    {connectedUsers.slice(0, 3).map((connectedUser, index) => (
                      <div
                        key={connectedUser.id}
                        className="inline-flex items-center justify-center h-8 w-8 bg-gradient-to-r from-blue-400 to-purple-400 border-3 border-black text-black text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                        title={connectedUser.username}
                        style={{ clipPath: 'circle(50%)' }}
                      >
                        {connectedUser.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {connectedUsers.length > 3 && (
                      <div className="inline-flex items-center justify-center h-8 w-8 bg-gray-500 border-3 border-black text-white text-xs font-black shadow-[2px_2px_0px_0px_#000]" style={{ clipPath: 'circle(50%)' }}>
                        +{connectedUsers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Toggle - Brutal Style */}
              <div className="flex items-center bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-2">
                <button
                  onClick={() => handlePreviewModeChange(false)}
                  className={`px-4 py-2 text-sm font-black border-2 border-black transition-all duration-200 ${
                    !isPreviewMode
                      ? 'bg-orange-400 text-black shadow-[3px_3px_0px_0px_#000] transform -rotate-1'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <Edit3 className="h-4 w-4 inline mr-2" />
                  EDIT MODE
                </button>
                <button
                  onClick={() => handlePreviewModeChange(true)}
                  className={`px-4 py-2 text-sm font-black border-2 border-black transition-all duration-200 ${
                    isPreviewMode
                      ? 'bg-green-400 text-black shadow-[3px_3px_0px_0px_#000] transform rotate-1'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  PREVIEW MODE
                </button>
              </div>

              {canEdit && (
                <>
                  <Button
                    onClick={handleManualSave}
                    disabled={saving || content === lastSavedContentRef.current}
                    className="bg-green-400 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 font-black text-black flex items-center space-x-2 px-4 py-2 transform -rotate-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? 'SAVING...' : 'SAVE NOTE'}</span>
                  </Button>

                  <Button
                    onClick={() => setShowSettings(true)}
                    className="bg-pink-400 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 font-black text-black flex items-center space-x-2 px-4 py-2 transform rotate-1"
                  >
                    <Settings className="h-4 w-4" />
                    <span>SETTINGS</span>
                  </Button>
                </>
              )}

              {/* Delete Button - Only show for note authors */}
              {user?.id === note.author._id && (
                <Button
                  onClick={handleDeleteNote}
                  className="bg-red-400 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 font-black text-white flex items-center space-x-2 px-4 py-2 transform -rotate-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>DELETE NOTE</span>
                </Button>
              )}

              {/* User Menu - Brutal Style */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="
                    flex items-center space-x-3 p-3 border-3 border-black bg-white
                    hover:bg-gray-100 transition-all duration-200 shadow-[4px_4px_0px_0px_#000]
                    hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]
                    focus:outline-none transform rotate-1 hover:rotate-0
                  "
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 border-3 border-black flex items-center justify-center text-white font-black text-sm shadow-[2px_2px_0px_0px_#000]">
                    {user?.username?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-black font-black transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown Menu - Brutal Style */}
                {isUserMenuOpen && (
                  <div className="
                    absolute right-0 mt-4 w-72 
                    bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]
                    z-50 transform -rotate-1
                  ">
                    {/* User Info */}
                    <div className="px-6 py-4 border-b-3 border-black bg-yellow-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 border-3 border-black flex items-center justify-center text-white font-black shadow-[2px_2px_0px_0px_#000]">
                          {user?.username?.charAt(0)?.toUpperCase() || <User className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-black truncate text-lg">
                            {user?.username || 'USER'}
                          </p>
                          <p className="text-sm font-bold text-gray-700 truncate">
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowSettings(true);
                        }}
                        className="
                          w-full flex items-center space-x-4 px-6 py-3
                          text-black hover:bg-blue-200 transition-colors duration-200
                          group font-bold border-b-2 border-black
                        "
                      >
                        <Settings className="w-5 h-5 text-black group-hover:scale-110 transition-transform duration-200" />
                        <span>NOTE SETTINGS</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="
                          w-full flex items-center space-x-4 px-6 py-3
                          text-red-700 hover:bg-red-200 transition-colors duration-200
                          group font-bold
                        "
                      >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span>SIGN OUT</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Brutal Style */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="min-h-[600px] bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          {isPreviewMode ? (
            <div className="relative">
              {/* Preview Users Header - Brutal Style */}
              {previewingUsers.length > 0 && (
                <div className="flex items-center justify-between p-6 border-b-4 border-black bg-gradient-to-r from-blue-300 to-purple-300 shadow-[4px_4px_0px_0px_#000] transform rotate-1">
                  <div className="flex items-center space-x-4">
                    <Eye className="h-6 w-6 text-black" />
                    <span className="text-lg font-black text-black">
                      {previewingUsers.length} USER{previewingUsers.length !== 1 ? 'S' : ''} VIEWING IN PREVIEW MODE
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {previewingUsers.slice(0, 4).map((previewUser, index) => (
                      <div
                        key={previewUser.id}
                        className="inline-flex items-center justify-center h-10 w-10 bg-blue-500 border-3 border-black text-white text-sm font-black shadow-[3px_3px_0px_0px_#000] transform rotate-12"
                        title={`${previewUser.username} is previewing`}
                        style={{ clipPath: 'circle(50%)' }}
                      >
                        {previewUser.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {previewingUsers.length > 4 && (
                      <div className="inline-flex items-center justify-center h-10 w-10 bg-gray-500 border-3 border-black text-white text-sm font-black shadow-[3px_3px_0px_0px_#000] transform -rotate-12" style={{ clipPath: 'circle(50%)' }}>
                        +{previewingUsers.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_0px_#000] transform rotate-1">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="markdown-preview text-black font-medium leading-relaxed"
                  >
                    {content || '*🚀 No content yet. Switch to edit mode to start writing your brutal note!*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              {/* Public Note Editor Warning - Brutal Style */}
              {note.isPublic && user?.id !== note.author._id && (
                <div className="absolute top-6 left-6 right-6 bg-blue-300 border-3 border-black p-4 z-10 shadow-[4px_4px_0px_0px_#000] transform -rotate-1">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-6 w-6 text-black" />
                    <span className="text-sm font-black text-black">
                      🌍 <strong>PUBLIC NOTE:</strong> You can edit this note. Changes will be visible to EVERYONE!
                    </span>
                  </div>
                </div>
              )}
              
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => canEdit && setContent(e.target.value)}
                placeholder={canEdit ? "🚀 Start writing your brutal note... Make it EPIC!" : "❌ You don't have permission to edit this note."}
                disabled={!canEdit}
                className="
                  w-full resize-none border-none outline-none bg-gradient-to-br from-yellow-50 to-orange-50
                  font-mono text-black text-lg leading-relaxed p-8
                  placeholder:text-gray-600 placeholder:font-bold
                  focus:bg-white transition-all duration-300
                "
                style={{ 
                  minHeight: '600px',
                  paddingTop: note.isPublic && user?.id !== note.author._id ? '100px' : '32px'
                }}
              />
              
              {/* Typing Indicators - Brutal Style */}
              {typingUsers.length > 0 && (
                <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-white border-3 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000] transform -rotate-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-primary-500 border border-black animate-bounce"></div>
                    <div className="w-3 h-3 bg-primary-500 border border-black animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-primary-500 border border-black animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm font-black text-black">
                    💬 {typingUsers.map(user => user.username).join(', ')} 
                    {typingUsers.length === 1 ? ' IS' : ' ARE'} TYPING...
                  </span>
                </div>
              )}

              {/* Auto-save indicator - Brutal Style */}
              {saving && (
                <div className="absolute top-6 right-6 flex items-center space-x-3 bg-green-300 border-3 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000] transform rotate-2">
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span className="text-sm font-black text-black">💾 SAVING...</span>
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
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ NOTE SETTINGS">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 transform -rotate-1">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="block text-lg font-black text-black">
              📝 NOTE TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your brutal note title..."
              required
              disabled={loading}
              className="
                w-full px-4 py-3 border-3 border-black shadow-[4px_4px_0px_0px_#000]
                font-bold text-black bg-yellow-100 focus:bg-white
                placeholder:text-gray-600 focus:outline-none
                transition-all duration-200 transform hover:translate-x-[-2px] hover:translate-y-[-2px]
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
          </div>

          <div className="flex items-center space-x-4 bg-blue-100 border-3 border-black p-4 shadow-[4px_4px_0px_0px_#000] transform rotate-1">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={loading}
              className="h-6 w-6 border-3 border-black text-blue-600 focus:ring-blue-500 bg-white shadow-[2px_2px_0px_0px_#000]"
            />
            <label htmlFor="isPublic" className="text-lg font-black text-black">
              🌍 MAKE THIS NOTE PUBLIC (VISIBLE TO EVERYONE)
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t-3 border-black">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-400 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 font-black text-black px-6 py-3 transform rotate-1"
            >
              ❌ CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-400 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 font-black text-black px-6 py-3 transform -rotate-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>UPDATING...</span>
                </span>
              ) : (
                '💾 UPDATE SETTINGS'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
