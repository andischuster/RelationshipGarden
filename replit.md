# Growing Us - Relationship Card Game Landing Page

## Overview

Growing Us is a relationship card game landing page designed to promote and sell a physical card game that helps couples strengthen their relationships through meaningful conversations. The application is built as a modern web application with both dynamic (full-stack) and static deployment capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system following brand guidelines
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Hook Form with Zod validation for forms, TanStack Query for server state
- **UI Components**: Custom component library built on Radix UI primitives (shadcn/ui)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with `/api` prefix
- **Session Management**: Express sessions with connect-pg-simple
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Database Layer
- **Database**: PostgreSQL (configurable with different providers)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Design System
- **Color Palette**: Warm, nature-inspired colors (warm white, deep green, sunflower yellow, soft tangerine, deep teal)
- **Typography**: Playfair Display for headings, Inter for body text
- **Visual Elements**: Card-like design with rounded corners, black borders, and drop shadows
- **Animations**: Floating blob backgrounds, gentle hover effects, fade-in animations

### Page Structure
1. **Header/Navigation**: Sticky header with logo and CTA button
2. **Hero Section**: Main product showcase with pre-order functionality
3. **Features Section**: Product highlights and benefits
4. **FAQ Section**: Common questions with accordion interface
5. **Footer**: Contact information and social links

### Form Handling
- **Validation**: Zod schemas for runtime type safety
- **User Experience**: Real-time validation with clear error messages
- **Submission**: Dual-mode handling (Google Forms + database backup)

## Data Flow

### Pre-order Process
1. User enters email in pre-order form
2. Client-side validation using Zod schema
3. Form submission to `/api/preorders` endpoint
4. Primary submission to Google Forms for immediate collection
5. Fallback to PostgreSQL database if Google Forms fails
6. Success/error feedback to user via toast notifications

### Static Deployment Flow
- Alternative configuration for static hosting
- Direct Google Forms integration without backend
- Environment-based feature toggling

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration
- **drizzle-orm**: Database ORM and query builder
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **wouter**: Lightweight routing library
- **lucide-react**: Icon library

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives for complex components
- **class-variance-authority**: Utility for component variant styling
- **tailwindcss**: Utility-first CSS framework
- **clsx & tailwind-merge**: Conditional styling utilities

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Dynamic Deployment (Default)
- **Environment**: Full-stack application with Express.js backend
- **Database**: PostgreSQL with Drizzle ORM
- **Features**: Complete functionality including database backup
- **Build Command**: `npm run build` (includes both client and server)
- **Start Command**: `npm start`

### Static Deployment (Alternative)
- **Environment**: Static site with Google Forms integration
- **Configuration**: `static-deployment-config.ts` for environment setup
- **Features**: Simplified form handling via Google Forms
- **Build Command**: `npm run build:static`
- **Hosting**: Can be deployed to any static hosting service

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **Google Forms**: `GOOGLE_FORM_SUBMISSION_URL` and `GOOGLE_FORM_EMAIL_ENTRY` for static deployment
- **Development**: Automatic environment detection and appropriate feature enablement

## Changelog
- January 3, 2025: Implemented comprehensive image loading optimizations
  - Removed loading animations from card stack for cleaner UX
  - Implemented lazy loading with smooth transitions for all card images  
  - Moved pulsating writing activity icon to activity generation loading state
  - Simplified image loading logic for better performance
  - Added loading="eager" for current card, loading="lazy" for background cards
  - Fixed TypeScript errors and removed complex preloading dependencies
  - Optimized image rendering with smooth opacity transitions
- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.