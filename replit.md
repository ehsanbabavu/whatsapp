# WhatsApp QR Code Display Tool

## Overview

This is a web application that displays WhatsApp Web QR codes for user authentication. The application uses Puppeteer to automate browser interactions with WhatsApp Web and capture the QR code, then serves it to users through a React-based frontend. The tool is designed as a utility-focused application prioritizing clarity and immediate usability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing (SPA architecture)
- TanStack Query (React Query) for server state management and API caching

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom theme configuration
- Material Design principles adapted for utility applications
- RTL (Right-to-Left) support for Persian/Farsi language (indicated by `lang="fa" dir="rtl"` in HTML)

**Design System**
- System-based approach prioritizing function over visual flair
- Centered single-column layout with max-width constraints
- Consistent spacing using Tailwind's spacing scale (2, 4, 6, 8, 12 units)
- Custom color palette defined through CSS variables for theming support
- Typography using Inter/Vazir fonts via Google Fonts for Persian support

**State Management**
- React Query for async server state with disabled auto-refetching (manual refresh pattern)
- Local component state using React hooks
- Toast notifications for user feedback

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- TypeScript for type safety across the stack
- ESM (ECMAScript Modules) throughout the codebase

**Application Structure**
- Monorepo structure with shared types between client and server
- `/server` - Backend Express application
- `/client` - Frontend React application
- `/shared` - Shared TypeScript types and schemas
- Development and production build processes with esbuild for server bundling

**API Design**
- RESTful endpoints:
  - `GET /api/whatsapp/qr` - Returns QR code as PNG image
  - `GET /api/whatsapp/status` - Returns current connection status
  - `GET /api/whatsapp/user` - Returns user information when connected
  - `POST /api/whatsapp/disconnect` - Disconnects from WhatsApp
  - `POST /api/whatsapp/wait-login` - Waits for user to scan QR and login
- No-cache headers to ensure fresh QR codes on each request
- Error handling with structured JSON error responses

**Browser Automation**
- Puppeteer (headless Chromium) for WhatsApp Web interaction
- Dynamic Chromium path detection using `which chromium` or `PUPPETEER_EXECUTABLE_PATH` environment variable
- Singleton browser instance pattern to reuse browser across requests
- Optimized page loading with `domcontentloaded` wait strategy to avoid WhatsApp Web websocket timeouts
- Automatic error recovery with page cleanup on failures
- User-agent spoofing for better compatibility with WhatsApp Web
- Headless mode with security flags for containerized environments (`--no-sandbox`, `--disable-setuid-sandbox`, etc.)
- Connection state management to track login status
- Automatic detection of successful login after QR scan
- User information extraction from WhatsApp Web interface

**Session Management**
- In-memory connection state tracking for WhatsApp sessions
- Real-time connection status monitoring
- Automatic session cleanup on disconnect
- Session support infrastructure using `connect-pg-simple` (configured for PostgreSQL sessions)
- User schema with username/password fields defined via Drizzle ORM

### Data Storage Solutions

**Database ORM**
- Drizzle ORM configured for PostgreSQL dialect
- Schema-first approach with TypeScript type inference
- Zod integration for runtime validation via `drizzle-zod`
- Migration system with `drizzle-kit` outputting to `/migrations` directory

**Database Schema**
- Users table with UUID primary keys, unique usernames, and password fields
- Currently using in-memory storage with database infrastructure prepared for future PostgreSQL integration

**Design Rationale**
- In-memory storage chosen for development simplicity and QR code display use case
- PostgreSQL infrastructure in place for future scaling if user authentication/persistence is needed
- Drizzle ORM provides type-safe database queries and automatic TypeScript types

### External Dependencies

**Third-Party Services**
- WhatsApp Web (web.whatsapp.com) - automated via Puppeteer for QR code extraction
- Google Fonts - for Inter and Vazir typography

**Key npm Packages**
- `puppeteer` - Browser automation for WhatsApp Web interaction
- `@neondatabase/serverless` - Neon Database driver for PostgreSQL
- `drizzle-orm` & `drizzle-kit` - Database ORM and migration tooling
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Accessible UI component primitives
- `tailwindcss` - Utility-first CSS framework
- `wouter` - Lightweight routing library
- `zod` - Schema validation library
- `react-hook-form` - Form state management with validation

**Development Tools**
- `@replit/vite-plugin-*` - Replit-specific development enhancements
- `tsx` - TypeScript execution for development server
- `esbuild` - Fast bundling for production builds

**Browser Environment**
- Requires Chromium installation accessible to Puppeteer
- Auto-detects Chromium path from system (falls back to `which chromium`)
- Optional: Set `PUPPETEER_EXECUTABLE_PATH` environment variable for custom Chromium location
- Configured with security flags for sandboxed/containerized execution
- WebGL and GPU acceleration disabled for headless operation

## Recent Updates (November 12, 2024)

**New Features - User Dashboard & Connection Management**
- ✅ User dashboard page - Displays user information after successful login
- ✅ Connection state management - Tracks and monitors WhatsApp connection status
- ✅ Automatic login detection - Waits for QR scan and redirects to dashboard
- ✅ Smart routing - Automatically redirects based on connection status
- ✅ Real-time monitoring - Checks connection every 5 seconds
- ✅ Disconnect functionality - Allows users to manually disconnect from WhatsApp
- ✅ Auto-redirect on disconnect - Returns to QR page when connection is lost

**API Endpoints**
- `GET /api/whatsapp/status` - Check current connection status
- `GET /api/whatsapp/user` - Get connected user information
- `POST /api/whatsapp/disconnect` - Disconnect from WhatsApp
- `POST /api/whatsapp/wait-login` - Wait for user to scan QR and login

**Completed Features (Previous)**
- ✅ Full WhatsApp Web integration with Puppeteer
- ✅ Dynamic Chromium path detection for Replit environment compatibility
- ✅ QR code screenshot capture and display
- ✅ Real-time error handling and user feedback via toast notifications
- ✅ Persian (RTL) UI with complete localization
- ✅ Responsive design for mobile and desktop
- ✅ Loading states and refresh functionality

**Technical Improvements**
- Content-type validation before JSON parsing to prevent HTML parsing errors
- Comprehensive error handling for API requests with user-friendly messages
- Timeout handling for login wait with proper error surfacing
- Resolved Chromium hard-coded path issue with dynamic detection
- Fixed navigation timeout by switching from `networkidle0` to `domcontentloaded`
- Added comprehensive logging for debugging browser automation
- Implemented error recovery with automatic page cleanup

**Known Considerations**
- QR code fetch may take 30-60 seconds on first request (browser initialization)
- Login wait has 120-second timeout (will show error if user doesn't scan in time)
- Connection status stored in-memory (resets on server restart - user must re-scan QR)
- Real-time monitoring checks status every 5 seconds
- QR codes expire after a few minutes (WhatsApp limitation); users can refresh via UI button