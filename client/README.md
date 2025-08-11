# Real-Time Notes Client

Next.js frontend for the Real-Time Collaborative Notes application.

## Features

- **Modern React** with Next.js 13 App Router
- **TypeScript** for type safety
- **Real-time collaboration** with Socket.io
- **Markdown support** with live preview
- **Responsive design** with Tailwind CSS
- **Authentication** with JWT tokens
- **Auto-save** functionality
- **Search and pagination**

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env.local` file in the client directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Running the Client

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
├── app/                   # Next.js App Router
│   ├── auth/             # Authentication pages
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   ├── notes/            # Notes pages
│   │   ├── [id]/         # Individual note editor
│   │   └── page.tsx      # Notes list page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── layout/          # Layout components
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                 # Utilities and services
│   ├── api.ts           # Axios API client
│   └── socket.ts        # Socket.io client
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

## Components

### UI Components (`/components/ui`)
- **InputField** - Form input with validation
- **Button** - Styled button with variants
- **Modal** - Modal dialog component
- **Card** - Content card component
- **LoadingSpinner** - Loading indicator

### Layout Components (`/components/layout`)
- **Header** - Application header with navigation
- **NoteCard** - Note preview card
- **LoadingSkeleton** - Skeleton loading state
- **EmptyState** - Empty state placeholder

## Pages

### Authentication
- `/auth/login` - User login
- `/auth/register` - User registration

### Notes
- `/notes` - Notes list with tabs and search
- `/notes/[id]` - Collaborative note editor

## Features

### Authentication
- JWT-based authentication
- Protected routes
- User session management
- Automatic token refresh

### Note Management
- Create, edit, delete notes
- Public/private visibility
- Search and filter
- Pagination

### Real-time Collaboration
- Live editing with multiple users
- Connected users display
- Typing indicators
- Auto-save functionality
- Real-time synchronization

### UI/UX
- Responsive design
- Dark/light mode ready
- Loading states
- Error handling
- Toast notifications
- Markdown preview

## Contexts

### AuthContext
Provides authentication state and methods:
- User information
- Login/logout functions
- Authentication status
- Loading states

## Services

### API Client (`/lib/api.ts`)
- Axios-based HTTP client
- Automatic token handling
- Request/response interceptors
- Error handling

### Socket Client (`/lib/socket.ts`)
- Socket.io client wrapper
- Connection management
- Event handling
- Real-time features

## Styling

The application uses Tailwind CSS for styling with:
- Responsive design utilities
- Custom color palette
- Component-based styles
- Dark mode support (ready)

## TypeScript

Full TypeScript support with:
- Type definitions for all data structures
- API response types
- Component prop types
- Event handler types

## Performance

Optimizations include:
- Next.js automatic code splitting
- Image optimization
- Static generation where possible
- Component memoization
- Debounced auto-save

## Browser Support

Supports all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Hot Reload
Development server includes hot reload for:
- React components
- CSS changes
- TypeScript compilation

## Dependencies

### Core
- next - React framework
- react - UI library
- typescript - Type safety

### UI & Styling
- tailwindcss - CSS framework
- lucide-react - Icon library
- react-hot-toast - Notifications

### Real-time & API
- socket.io-client - WebSocket client
- axios - HTTP client

### Content
- react-markdown - Markdown rendering
- remark-gfm - GitHub Flavored Markdown

### Utilities
- js-cookie - Cookie handling
