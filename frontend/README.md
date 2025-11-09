# SHH Chatroom Frontend

A modern, real-time chatroom frontend built with React, TypeScript, and Vite. Features a beautiful UI with dark mode support, real-time messaging via WebSockets, and a responsive design using shadcn/ui components.

## Tech Stack

- **React 18.3.1** - UI library
- **TypeScript 5.6.2** - Type safety
- **Vite 6.0.5** - Build tool and dev server
- **React Router DOM 7.1.1** - Client-side routing
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Axios 1.7.9** - HTTP client
- **React Hot Toast 2.5.1** - Toast notifications
- **Framer Motion 11.15.0** - Animation library
- **next-themes 0.4.4** - Theme management
- **Lucide React** - Icon library
- **date-fns 4.1.0** - Date formatting utilities

## Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running (see backend README)
- Redis server running (for WebSocket support)

## Installation

### 1. Clone the repository

```bash
cd frontend
```

### 2. Install dependencies

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

### 3. Create environment file

Create a `.env` file in the `frontend` directory:

```env
VITE_BASE_URL=http://localhost:8000/
```

For production, update this to your backend server URL:

```env
VITE_BASE_URL=https://api.yourdomain.com/
```

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BASE_URL` | Backend API base URL | `http://localhost:8000/` |

Create a `.env` file in the `frontend` directory to override defaults.

## Available Scripts

### Development

```bash
npm run dev
```
Starts the Vite development server with hot module replacement.

### Build

```bash
npm run build
```
Builds the app for production. Outputs to `dist/` directory.

### Preview

```bash
npm run preview
```
Preview the production build locally.

### Lint

```bash
npm run lint
```
Run ESLint to check for code quality issues.

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── LogoDark.svg
│   ├── LogoLight.svg
│   └── vite.svg
├── src/
│   ├── api/               # API client functions
│   │   ├── auth.ts        # Authentication API
│   │   ├── messages.ts    # Messages API
│   │   └── rooms.ts       # Rooms API
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── AppSidebar.tsx
│   │   ├── ChatArea.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatLayout.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ...
│   ├── context/          # React context providers
│   │   └── theme-provider.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useChatWebSocket.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/              # Utility functions
│   │   ├── authUtils.ts
│   │   ├── theme-colors.ts
│   │   └── utils.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── chat-types.ts
│   │   └── theme-types.tsx
│   ├── App.tsx           # Main app component
│   ├── App.css           # Global styles
│   └── main.tsx          # App entry point
├── index.html            # HTML template
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Features

### Authentication

- User registration and login
- JWT token-based authentication
- Automatic token validation
- Protected routes
- Cookie-based token storage

### Chat Features

- Real-time messaging via WebSockets
- Multiple chat rooms
- Create and join rooms
- Delete rooms
- Message history
- User list display
- Responsive chat interface

### UI/UX

- Dark mode support
- Theme customization
- Responsive design (mobile, tablet, desktop)
- Smooth animations
- Toast notifications
- Accessible components (Radix UI)
- Modern, clean interface

### Room Management

- Create new chat rooms
- Join existing rooms via room ID
- View all user's rooms
- Delete rooms
- Room selection sidebar

## API Integration

The frontend communicates with the backend through REST APIs and WebSockets.

### REST API Endpoints

All API calls are made to `${VITE_BASE_URL}`:

- **POST** `/register/` - User registration
- **POST** `/login/` - User login
- **GET** `/api/users/` - Get user list
- **GET** `/rooms/` - Get user's rooms
- **POST** `/rooms/create/` - Create a room
- **POST** `/room/join/` - Join a room
- **DELETE** `/room/delete/<room_id>/` - Delete a room
- **GET** `/messages/<room_name>/` - Get messages
- **POST** `/messages/<room_name>/send/` - Send a message

### Authentication

JWT tokens are stored in cookies and automatically included in API requests via the `Authorization: Bearer <token>` header.

## WebSocket Integration

Real-time messaging is handled via WebSocket connections:

```typescript
ws://localhost:8000/ws/chat/<room_id>/?token=<jwt_token>
```

### WebSocket Events

- **message_history** - Received when connecting to a room (contains message history)
- **message** - Received when a new message is sent
- **chat_message** - Real-time message updates

### Custom Hook

The `useChatWebSocket` hook manages WebSocket connections:

```typescript
const { messages, socketRef, setMessages, connectionFailed } = useChatWebSocket(selectedRoom);
```

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with a custom configuration that includes:

- Dark mode support
- Custom color palette
- Responsive breakpoints
- Custom animations
- shadcn/ui component styles

### Theme System

The app supports theme switching via `next-themes`:

- Light mode
- Dark mode
- System preference

Theme preferences are stored in localStorage and persist across sessions.

### Components

UI components are built with shadcn/ui, which provides:

- Accessible components
- Customizable styling
- TypeScript support
- Consistent design system

## Routing

The app uses React Router for client-side routing:

- `/login` - Login page
- `/register` - Registration page
- `/` - Chat layout (protected route)

### Protected Routes

Routes are protected by checking for a valid JWT token in cookies. Unauthenticated users are redirected to the login page.

## State Management

- **Local State** - React `useState` for component-level state
- **Context API** - Theme provider for theme management
- **Custom Hooks** - Reusable stateful logic (WebSocket, toast, etc.)
- **Cookies** - Token storage
- **LocalStorage** - User email and theme preferences

## TypeScript

The project is fully typed with TypeScript. Key type definitions:

- `Message` - Chat message structure
- `Room` - Chat room structure
- `ChatAreaProps` - Component prop types

## Building for Production

### 1. Build the application

```bash
npm run build
```

### 2. Preview the production build

```bash
npm run preview
```

### 3. Deploy

The `dist/` directory contains the production build. Deploy this to your hosting service:

- **Vercel** - Automatic deployment with GitHub integration
- **Netlify** - Drag and drop the `dist` folder
- **AWS S3 + CloudFront** - Static site hosting
- **Nginx** - Serve the `dist` directory

### Production Environment

Update `.env` for production:

```env
VITE_BASE_URL=https://api.yourdomain.com/
```

Rebuild after changing environment variables:

```bash
npm run build
```

## Development Tips

### Adding New Components

1. Use shadcn/ui CLI to add components:
```bash
npx shadcn-ui@latest add [component-name]
```

2. Or create custom components in `src/components/`

### Adding API Endpoints

1. Create functions in `src/api/` directory
2. Use axios with authentication headers
3. Handle errors appropriately
4. Update types in `src/types/` if needed

### Styling Guidelines

- Use Tailwind utility classes
- Follow shadcn/ui component patterns
- Maintain consistent spacing and colors
- Ensure responsive design
- Support dark mode

## Troubleshooting

### WebSocket Connection Issues

1. **Check backend server** - Ensure backend is running on the correct port
2. **Check Redis** - Ensure Redis is running for WebSocket support
3. **Check token** - Verify JWT token is valid and not expired
4. **Check CORS** - Ensure backend CORS settings allow your frontend URL
5. **Check WebSocket URL** - Verify the WebSocket URL format is correct

### API Request Failures

1. **Check `VITE_BASE_URL`** - Verify environment variable is set correctly
2. **Check authentication** - Ensure token is present in cookies
3. **Check network** - Verify backend server is accessible
4. **Check CORS** - Ensure backend allows requests from frontend origin

### Build Issues

1. **Clear cache** - Delete `node_modules` and reinstall
2. **Check Node version** - Ensure Node.js 18+ is installed
3. **Check TypeScript errors** - Fix any type errors before building
4. **Check environment variables** - Ensure all required variables are set

### Theme Issues

1. **Clear localStorage** - Remove theme preferences
2. **Check theme provider** - Ensure ThemeProvider wraps the app
3. **Check CSS variables** - Verify Tailwind config includes theme colors

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linter: `npm run lint`
5. Test your changes
6. Submit a pull request

## License

This project is part of the SHH Chatroom application.
