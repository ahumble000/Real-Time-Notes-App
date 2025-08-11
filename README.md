# Real-Time Collaborative Notes App

A full-stack real-time collaborative note-taking application built with Next.js, Express.js, Socket.io, and MongoDB.

## Features

### ✅ Completed Features

#### 🔐 User Authentication
- **Signup/Login** with email and password
- **JWT-based authentication** with HTTP-only cookies
- **Protected routes** and API endpoints
- **User session management**

#### 📝 Notes Management
- **Create notes** with title, content, and visibility settings
- **Public & Private notes** support
- **CRUD operations** for notes (Create, Read, Update, Delete)
- **Search functionality** across notes
- **Pagination** for better performance

#### ⚡ Real-time Collaboration
- **Live editing** with Socket.io
- **Connected users** display
- **Typing indicators** 
- **Auto-save** functionality
- **Real-time content synchronization**

#### 🎨 Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Markdown support** with live preview
- **Beautiful, intuitive interface**
- **Loading states** and error handling
- **Toast notifications**

#### 🔒 Security Features
- **JWT token authentication**
- **Protected API routes**
- **Input validation**
- **CORS configuration**
- **Environment variables** for sensitive data

## Tech Stack

### Frontend (Client)
- **Next.js 13** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **React Markdown** - Markdown rendering
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend (Server)
- **Express.js** - Node.js web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## Project Structure

```
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages
│   │   ├── auth/          # Authentication pages
│   │   ├── notes/         # Notes pages
│   │   └── layout.tsx     # Root layout
│   ├── components/        # Reusable components
│   │   ├── ui/            # UI components
│   │   └── layout/        # Layout components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities and services
│   ├── types/             # TypeScript types
│   └── styles/            # Global styles
│
└── server/                # Express.js backend
    ├── models/            # MongoDB models
    ├── routes/            # API routes
    ├── middleware/        # Express middleware
    ├── socket/            # Socket.io handlers
    └── server.js          # Main server file
```

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notes-app
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Setup

1. **Server environment** (`server/.env`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/notes-app
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

2. **Client environment** (`client/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

### Database Setup

1. **Install MongoDB locally** or use **MongoDB Atlas**
2. **Start MongoDB** service (if using local installation)
3. The application will **automatically create** the database and collections

### Running the Application

1. **Start the server** (from `/server` directory):
   ```bash
   npm run dev
   ```

2. **Start the client** (from `/client` directory):
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Notes Routes (`/api/notes`)
- `GET /api/notes/public` - Get all public notes
- `GET /api/notes/private` - Get user's private notes
- `GET /api/notes/my` - Get all user's notes
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### WebSocket Events
- `join-note` - Join a note room
- `leave-note` - Leave a note room
- `note-update` - Send note content update
- `note-updated` - Receive note content update
- `users-in-note` - Receive list of connected users
- `typing` - Send typing indicator
- `user-typing` - Receive typing indicator

## Usage Guide

### Creating an Account
1. Navigate to `/auth/register`
2. Fill in username, email, and password
3. Click "Create Account"

### Creating Notes
1. Click "New Note" button
2. Enter title and content
3. Choose visibility (Public/Private)
4. Click "Create Note"

### Collaborative Editing
1. Open any note by clicking on it
2. Multiple users can edit simultaneously
3. See real-time updates and typing indicators
4. Changes are auto-saved

### Search and Organization
- Use the search bar to find notes
- Browse by tabs: Public Notes, My Private Notes, All My Notes
- Navigate through pages using pagination

## What's Done

### Core Requirements ✅
- [x] **User Authentication** (Signup/Login with JWT)
- [x] **Notes CRUD** (Create, Read, Update, Delete)
- [x] **Public/Private notes** support
- [x] **Real-time collaboration** with Socket.io
- [x] **Connected users** display
- [x] **Modern UI** with Tailwind CSS

### Bonus Features ✅
- [x] **Markdown editor** with live preview
- [x] **Search functionality**
- [x] **Auto-save** with typing indicators
- [x] **Responsive design**
- [x] **Error handling** and loading states
- [x] **Toast notifications**
