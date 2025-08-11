import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string): Socket {
    this.token = token;
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Note-specific methods
  joinNote(noteId: string) {
    if (this.socket) {
      this.socket.emit('join-note', noteId);
    }
  }

  leaveNote(noteId: string) {
    if (this.socket) {
      this.socket.emit('leave-note', noteId);
    }
  }

  updateNote(noteId: string, content: string, cursorPosition?: number) {
    if (this.socket) {
      this.socket.emit('note-update', {
        noteId,
        content,
        cursorPosition
      });
    }
  }

  updateCursor(noteId: string, cursorPosition: number) {
    if (this.socket) {
      this.socket.emit('cursor-update', {
        noteId,
        cursorPosition
      });
    }
  }

  sendTyping(noteId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', {
        noteId,
        isTyping
      });
    }
  }

  // Event listeners
  onNoteUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('note-updated', callback);
    }
  }

  onUsersInNote(callback: (users: any[]) => void) {
    if (this.socket) {
      this.socket.on('users-in-note', callback);
    }
  }

  onCursorUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('cursor-updated', callback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove event listeners
  offNoteUpdated() {
    if (this.socket) {
      this.socket.off('note-updated');
    }
  }

  offUsersInNote() {
    if (this.socket) {
      this.socket.off('users-in-note');
    }
  }

  offCursorUpdated() {
    if (this.socket) {
      this.socket.off('cursor-updated');
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user-typing');
    }
  }

  offError() {
    if (this.socket) {
      this.socket.off('error');
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
