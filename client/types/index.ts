export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  isPublic: boolean;
  author: {
    _id: string;
    username: string;
  };
  lastEditedBy?: {
    _id: string;
    username: string;
  };
  collaborators: User[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content?: string;
  isPublic?: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  isPublic?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface NotesResponse {
  notes: Note[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ConnectedUser {
  id: string;
  username: string;
}

export interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface CursorUpdate {
  userId: string;
  username: string;
  cursorPosition: number;
}

export interface NoteUpdate {
  content: string;
  lastEditedBy: {
    id: string;
    username: string;
  };
  version: number;
  timestamp: Date;
}
