# Helfer AI Voice Assistant

## Overview

Helfer is a full-stack AI voice assistant web application featuring wake phrase activation, real-time speech processing, and a neon sci-fi themed interface. The application enables continuous voice interaction through a "hot-mic" style listening mode that activates upon detecting the wake phrase "Helfer, wake up." The system combines multiple AI models (ChatGPT and DeepSeek R1) for advanced reasoning and conversational capabilities, with speech-to-text and text-to-speech powered by OpenAI's APIs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript as the core framework
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query for server state management and API caching

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant)
- Tailwind CSS for styling with custom neon sci-fi color scheme
- Custom CSS variables for theming (neon-cyan, neon-magenta, neon-purple, neon-blue)

**Design System:**
- Dark theme with high contrast and glowing neon elements
- Typography: Orbitron (headers), Inter/Space Grotesk (body), JetBrains Mono (monospace)
- Responsive layout: 60/40 split (chat/avatar) on desktop, stacked on mobile
- Glass morphism effects and neon border treatments

**Voice Processing (Client-Side):**
- Web Speech API for wake word detection and continuous listening
- Browser's native SpeechRecognition API for speech-to-text fallback
- Web Audio API for real-time audio visualization and playback
- Base64 audio encoding for transmission over WebSocket

**State Management:**
- React hooks for local component state
- Custom hook `useVoiceAssistant` for voice interaction orchestration
- WebSocket-based real-time communication with server
- In-memory message history and settings persistence

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server framework
- Node.js HTTP module wrapped for WebSocket support
- TypeScript for type safety across the stack
- ESBuild for server bundling in production

**WebSocket Communication:**
- ws library for bidirectional real-time communication
- Message types: user_audio, user_text, assistant_response, state_change, error, settings_update
- Client state management per WebSocket connection
- Stateful connections maintaining user settings and conversation context

**AI Model Integration:**
- **Primary AI:** OpenAI GPT-5 (latest model as of August 2025) for conversational responses
- **Reasoning AI:** DeepSeek R1 (deepseek-reasoner) for advanced reasoning preprocessing
- **Hybrid Flow:** User input → DeepSeek analysis → GPT-5 response generation
- **TTS:** OpenAI Text-to-Speech API with configurable voices (alloy, echo, fable, onyx, nova, shimmer)
- Voice speed control (0.25x to 4.0x)

**Data Storage:**
- In-memory storage implementation (MemStorage class)
- Message history stored per session
- User settings (voice gender, speed, continuous listening mode)
- No persistent database currently configured (prepared for Drizzle ORM + PostgreSQL)

**Session Management:**
- Stateless HTTP endpoints
- Stateful WebSocket connections with per-client settings
- No authentication system currently implemented

### Database Schema

**Prepared Infrastructure:**
- Drizzle ORM configured for PostgreSQL
- Schema definitions in `shared/schema.ts` using Zod validation
- Migration system ready but not actively used (database-free operation mode)
- Connection string expected via `DATABASE_URL` environment variable

**Data Models:**
- Message: id, role (user/assistant), content, timestamp, optional audioUrl
- Settings: voiceGender, voiceSpeed, continuousListening
- AssistantState: idle, listening, processing, speaking, wake-detected

### API Architecture

**WebSocket Protocol:**
- Single WebSocket endpoint for real-time bidirectional communication
- JSON message format with discriminated union types
- Zod schema validation for message payloads
- State synchronization between client and server

**Message Flow:**
1. Client sends user_audio (base64) or user_text
2. Server processes through DeepSeek R1 for reasoning
3. Server queries GPT-5 with enhanced context
4. Server generates audio response via OpenAI TTS
5. Server sends assistant_response with text and audioBase64
6. Client plays audio and updates UI state

**Error Handling:**
- Graceful fallback when AI APIs unavailable (demo mode)
- WebSocket reconnection logic
- Error messages propagated to client via error message type

## External Dependencies

### Third-Party AI Services

**OpenAI Platform:**
- API Key: `OPENAI_API_KEY` environment variable
- GPT-5 model for conversational AI (latest as of August 2025)
- Text-to-Speech API for voice synthesis
- Supports 6 voice options with speed control
- Realtime API available but not currently implemented

**DeepSeek API:**
- API Key: `DEEPSEEK_API_KEY` environment variable
- Base URL: https://api.deepseek.com
- deepseek-reasoner model for advanced reasoning
- Used for preprocessing user queries before GPT-5

### Database & Storage

**PostgreSQL (Prepared):**
- Connection via Drizzle ORM
- Currently operates in database-free mode
- Ready for future persistence layer
- Connection pooling via pg library

### Development & Build Tools

**Replit Platform:**
- Vite plugin for runtime error modal
- Cartographer plugin for development insights
- Development banner plugin
- Designed for Replit deployment environment

### UI Component Libraries

**Radix UI Primitives:**
- Complete set of 20+ accessible component primitives
- Dialog, Sheet, Popover, Tooltip, and form controls
- Keyboard navigation and ARIA compliance built-in

**Additional UI Dependencies:**
- embla-carousel-react for carousel functionality
- cmdk for command palette
- react-day-picker for date selection
- vaul for drawer components
- Lucide React for icon system

### Styling & Design

**Tailwind CSS:**
- Custom color system based on HSL with CSS variables
- Neon-themed accent colors
- Dark mode class-based theming
- PostCSS with Autoprefixer

**Typography:**
- Google Fonts: Orbitron, Inter, Space Grotesk, JetBrains Mono
- Font loading optimized with preconnect

### Form & Validation

**React Hook Form:**
- Form state management
- Hookform/resolvers for schema validation integration

**Zod:**
- Runtime type validation
- Shared schema definitions between client and server
- drizzle-zod for database schema integration

### Session & Security

**Express Middleware (Prepared but Unused):**
- express-session with connect-pg-simple store
- Passport.js for authentication strategies
- CORS configuration
- Express rate limiting
- Currently running without authentication