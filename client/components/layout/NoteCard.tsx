'use client';

import { useState } from 'react';
import { Clock, User, Eye, Lock, MoreVertical, Trash2, Edit3, Users, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  showAuthor?: boolean;
  variant?: 'default' | 'glass' | 'minimal';
  currentUserId?: string;
}

export const NoteCard = ({
  note,
  onClick,
  onDelete,
  onEdit,
  showAuthor = false,
  variant = 'default',
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
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getContentStats = (content: string) => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lines = content.split('\n').length;
    const chars = content.length;
    
    return { words, lines, chars };
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    // Remove markdown formatting for preview
    const cleanContent = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  const contentStats = getContentStats(note.content);
  const hasContent = note.content.trim().length > 0;

  return (
    <div onClick={onClick}>
      <Card 
        variant={variant}
        className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 hover:-translate-y-1"
      >
      <div className="p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {note.isPublic ? (
              <Badge variant="success" size="sm" icon={<Eye className="w-3 h-3" />}>
                Public
              </Badge>
            ) : (
              <Badge variant="secondary" size="sm" icon={<Lock className="w-3 h-3" />}>
                Private
              </Badge>
            )}
            
            {/* Collaborators Badge */}
            {note.collaborators && note.collaborators.length > 0 && (
              <Badge variant="info" size="sm" icon={<Users className="w-3 h-3" />}>
                {note.collaborators.length} collaborator{note.collaborators.length !== 1 ? 's' : ''}
              </Badge>
            )}

            {/* Version Badge */}
            {note.version > 1 && (
              <Badge variant="default" size="sm">
                v{note.version}
              </Badge>
            )}
          </div>
          
          <div className="relative">
            {(onEdit || canDelete) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}

            {showMenu && (onEdit || canDelete) && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/50 py-2 z-10">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-800 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
          {note.title}
        </h3>

        {/* Content Preview */}
        {hasContent ? (
          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {truncateContent(note.content)}
          </p>
        ) : (
          <p className="text-slate-400 text-sm italic mb-4">
            No content yet...
          </p>
        )}

        {/* Content Stats */}
        {hasContent && (
          <div className="flex items-center space-x-4 mb-4 text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{contentStats.words} word{contentStats.words !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{contentStats.chars} char{contentStats.chars !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            {showAuthor && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span className="font-medium">{note.author.username}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Updated {formatDate(note.updatedAt)}</span>
            </div>
          </div>

          {/* Last edited by info */}
          {note.lastEditedBy && note.lastEditedBy._id !== note.author._id && (
            <div className="flex items-center space-x-1 text-xs text-slate-400">
              <span>by {note.lastEditedBy.username}</span>
            </div>
          )}
        </div>

        {/* Created date if different from updated */}
        {new Date(note.createdAt).toDateString() !== new Date(note.updatedAt).toDateString() && (
          <div className="mt-2 text-xs text-slate-400">
            Created {formatDate(note.createdAt)}
          </div>
        )}

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 pointer-events-none" />
      </div>
      </Card>
    </div>
  );
};
