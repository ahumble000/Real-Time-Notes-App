'use client';

import { useState } from 'react';
import { Clock, User, Eye, Lock, MoreVertical, Trash2, Edit3, Users, FileText } from 'lucide-react';
import { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  showAuthor?: boolean;
  currentUserId?: string;
}

export const NoteCard = ({
  note,
  onClick,
  onDelete,
  onEdit,
  showAuthor = false,
  currentUserId
}: NoteCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  // Check if current user is the author of the note
  const isAuthor = currentUserId === note.author._id;
  const canDelete = isAuthor && onDelete;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks}w ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      }).format(date);
    }
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const noteColors = [
    'bg-yellow-400',
    'bg-pink-400',
    'bg-blue-400',
    'bg-green-400',
    'bg-purple-400',
    'bg-orange-400'
  ];
  
  // Use note ID to consistently assign colors
  const colorIndex = note._id.length % noteColors.length;
  const noteColor = noteColors[colorIndex];

  return (
    <div className="relative group">
      <div
        onClick={onClick}
        className={`
          ${noteColor} border-4 border-black rounded-2xl p-6 
          shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]
          hover:translate-x-[-2px] hover:translate-y-[-2px]
          cursor-pointer transition-all duration-200 transform
          hover:rotate-1 group-hover:scale-[1.02]
          relative overflow-hidden
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-black truncate tracking-tight">
              {note.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {/* Visibility Badge */}
              <div className={`
                flex items-center gap-1 px-2 py-1 rounded-lg border-2 border-black
                ${note.isPublic ? 'bg-green-300' : 'bg-red-300'}
                shadow-[2px_2px_0px_0px_#000]
              `}>
                {note.isPublic ? (
                  <Eye className="w-3 h-3 text-black" />
                ) : (
                  <Lock className="w-3 h-3 text-black" />
                )}
                <span className="text-xs font-bold text-black">
                  {note.isPublic ? 'Public' : 'Private'}
                </span>
              </div>

              {/* Collaborators Badge */}
              {note.collaborators && note.collaborators.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg border-2 border-black bg-blue-300 shadow-[2px_2px_0px_0px_#000]">
                  <Users className="w-3 h-3 text-black" />
                  <span className="text-xs font-bold text-black">
                    +{note.collaborators.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 border-2 border-black rounded-lg bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
            >
              <MoreVertical className="w-4 h-4 text-black" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_#000] z-20">
                <div className="py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick?.();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left font-bold text-black hover:bg-green-200 flex items-center gap-2 transition-colors border-b-2 border-black"
                  >
                    <Eye className="w-4 h-4" />
                    View Note
                  </button>
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left font-bold text-black hover:bg-blue-200 flex items-center gap-2 transition-colors border-b-2 border-black"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Note
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left font-bold text-red-700 hover:bg-red-200 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Note
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <p className="text-sm font-bold text-gray-800 leading-relaxed">
            {truncateContent(note.content || 'No content')}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t-3 border-black">
          <div className="flex items-center gap-3">
            {showAuthor && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-black rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-black" />
                </div>
                <span className="text-xs font-bold text-black">
                  {note.author.username}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
              <Clock className="w-3 h-3" />
              {formatDate(note.updatedAt)}
            </div>
          </div>

          {/* Note Type Icon */}
          <div className="p-1 border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_0px_#000]">
            <FileText className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-black rounded-full"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-black rounded-full"></div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
