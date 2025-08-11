# Real-Time Notes Server

Express.js backend for the Real-Time Collaborative Notes application.

## Features

- **RESTful API** for notes management
- **Real-time collaboration** with Socket.io
- **JWT Authentication** with secure cookies
- **MongoDB** integration with Mongoose
- **Input validation** and error handling
- **CORS** support for cross-origin requests

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notes-app
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

## Running the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Notes
- `GET /api/notes/public` - Get public notes
- `GET /api/notes/private` - Get user's private notes
- `GET /api/notes/my` - Get all user's notes
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## WebSocket Events

### Client to Server
- `join-note` - Join a note editing session
- `leave-note` - Leave a note editing session
- `note-update` - Send note content update
- `cursor-update` - Send cursor position
- `typing` - Send typing status

### Server to Client
- `note-updated` - Note content was updated
- `users-in-note` - List of users in note session
- `cursor-updated` - User cursor position update
- `user-typing` - User typing status
- `error` - Error message

## Database Schema

### User Model
```javascript
{
  username: String (required, unique)
  email: String (required, unique)
  password: String (required, hashed)
  createdAt: Date
  updatedAt: Date
}
```

### Note Model
```javascript
{
  title: String (required)
  content: String
  isPublic: Boolean (default: false)
  author: ObjectId (ref: User)
  collaborators: [ObjectId] (ref: User)
  lastEditedBy: ObjectId (ref: User)
  version: Number (default: 1)
  createdAt: Date
  updatedAt: Date
}
```

## Middleware

- **Authentication** - JWT token verification
- **CORS** - Cross-origin request handling
- **Body parsing** - JSON and URL-encoded data
- **Cookie parsing** - HTTP cookie handling

## Error Handling

The server includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database connection errors
- Socket connection errors

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- HTTP-only cookies
- CORS configuration
- Input validation
- Protected routes

## Development

The server uses nodemon for development with auto-restart on file changes.

```bash
npm run dev
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a secure `JWT_SECRET`
3. Configure MongoDB Atlas or production database
4. Set up proper CORS origins
5. Use HTTPS for secure cookie transmission

## Dependencies

### Production
- express - Web framework
- socket.io - Real-time communication
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT handling
- cors - Cross-origin requests
- dotenv - Environment variables
- cookie-parser - Cookie handling

### Development
- nodemon - Auto-restart during development
