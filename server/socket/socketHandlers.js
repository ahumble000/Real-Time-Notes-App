const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Note = require('../models/Note');

const activeConnections = new Map();
const noteRooms = new Map();
const previewingUsers = new Map(); // noteId -> Set of {userId, username}

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io) => {
  return async (socket) => {
    console.log(`User ${socket.user.username} connected`);
    
    activeConnections.set(socket.id, {
      userId: socket.user._id.toString(),
      username: socket.user.username,
      socket
    });

    socket.on('join-note', async (noteId) => {
      try {
        const note = await Note.findById(noteId);
        if (!note) {
          socket.emit('error', { message: 'Note not found' });
          return;
        }

        const hasAccess = note.isPublic || 
                         note.author.toString() === socket.user._id.toString() ||
                         note.collaborators.includes(socket.user._id);

        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        socket.join(noteId);
        
        if (!noteRooms.has(noteId)) {
          noteRooms.set(noteId, new Set());
        }
        noteRooms.get(noteId).add(socket.user._id.toString());

        const connectedUsers = Array.from(noteRooms.get(noteId)).map(userId => {
          const connection = Array.from(activeConnections.values()).find(conn => conn.userId === userId);
          return connection ? { id: userId, username: connection.username } : null;
        }).filter(Boolean);

        io.to(noteId).emit('users-in-note', connectedUsers);
        
        console.log(`User ${socket.user.username} joined note ${noteId}`);
      } catch (error) {
        console.error('Error joining note:', error);
        socket.emit('error', { message: 'Failed to join note' });
      }
    });

    socket.on('leave-note', (noteId) => {
      socket.leave(noteId);
      
      if (noteRooms.has(noteId)) {
        noteRooms.get(noteId).delete(socket.user._id.toString());
        
        if (noteRooms.get(noteId).size === 0) {
          noteRooms.delete(noteId);
        } else {
          const connectedUsers = Array.from(noteRooms.get(noteId)).map(userId => {
            const connection = Array.from(activeConnections.values()).find(conn => conn.userId === userId);
            return connection ? { id: userId, username: connection.username } : null;
          }).filter(Boolean);

          io.to(noteId).emit('users-in-note', connectedUsers);
        }
      }
      
      console.log(`User ${socket.user.username} left note ${noteId}`);
    });

    socket.on('note-update', async (data) => {
      try {
        const { noteId, content, cursorPosition } = data;
        
        const note = await Note.findById(noteId);
        if (!note) {
          socket.emit('error', { message: 'Note not found' });
          return;
        }

        const hasEditAccess = note.author.toString() === socket.user._id.toString() ||
                             note.collaborators.includes(socket.user._id) ||
                             note.isPublic;

        if (!hasEditAccess) {
          socket.emit('error', { message: 'No edit permission' });
          return;
        }

        note.content = content;
        note.lastEditedBy = socket.user._id;
        note.version += 1;
        await note.save();

        socket.to(noteId).emit('note-updated', {
          content,
          lastEditedBy: {
            id: socket.user._id,
            username: socket.user.username
          },
          version: note.version,
          timestamp: new Date()
        });

        console.log(`Note ${noteId} updated by ${socket.user.username}`);
      } catch (error) {
        console.error('Error updating note:', error);
        socket.emit('error', { message: 'Failed to update note' });
      }
    });

    socket.on('cursor-update', (data) => {
      const { noteId, cursorPosition } = data;
      socket.to(noteId).emit('cursor-updated', {
        userId: socket.user._id,
        username: socket.user.username,
        cursorPosition
      });
    });

    socket.on('typing', (data) => {
      const { noteId, isTyping } = data;
      socket.to(noteId).emit('user-typing', {
        userId: socket.user._id,
        username: socket.user.username,
        isTyping
      });
    });

    socket.on('preview-mode-change', (data) => {
      const { noteId, userId, username, isPreview } = data;
      
      if (!previewingUsers.has(noteId)) {
        previewingUsers.set(noteId, new Set());
      }
      
      const previewSet = previewingUsers.get(noteId);
      const userKey = `${userId}:${username}`;
      
      if (isPreview) {
        previewSet.add(userKey);
      } else {
        previewSet.delete(userKey);
      }
      
      // Convert Set to array of user objects
      const previewingUsersList = Array.from(previewSet).map(userKey => {
        const [id, name] = userKey.split(':');
        return { id, username: name };
      });
      
      // Broadcast to all users in the note room
      io.to(noteId).emit('preview-mode-updated', {
        previewingUsers: previewingUsersList
      });
      
      console.log(`Preview mode changed for note ${noteId}: ${username} ${isPreview ? 'started' : 'stopped'} previewing`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      activeConnections.delete(socket.id);
      
      // Clean up from note rooms
      noteRooms.forEach((users, noteId) => {
        if (users.has(socket.user._id.toString())) {
          users.delete(socket.user._id.toString());
          
          if (users.size === 0) {
            noteRooms.delete(noteId);
          } else {
            const connectedUsers = Array.from(users).map(userId => {
              const connection = Array.from(activeConnections.values()).find(conn => conn.userId === userId);
              return connection ? { id: userId, username: connection.username } : null;
            }).filter(Boolean);

            socket.to(noteId).emit('users-in-note', connectedUsers);
          }
        }
      });
      
      // Clean up from preview mode tracking
      previewingUsers.forEach((previewSet, noteId) => {
        const userKey = `${socket.user._id}:${socket.user.username}`;
        if (previewSet.has(userKey)) {
          previewSet.delete(userKey);
          
          // Notify remaining users about the update
          const previewingUsersList = Array.from(previewSet).map(userKey => {
            const [id, name] = userKey.split(':');
            return { id, username: name };
          });
          
          socket.to(noteId).emit('preview-mode-updated', {
            previewingUsers: previewingUsersList
          });
          
          // Clean up empty preview sets
          if (previewSet.size === 0) {
            previewingUsers.delete(noteId);
          }
        }
      });
    });
  };
};

module.exports = {
  socketAuth,
  handleConnection
};
