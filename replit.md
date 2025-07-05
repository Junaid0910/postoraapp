# Postora - Social Media Platform with Gaming Elements

## Overview

Postora is a full-stack social media application that combines the best features of Instagram and Snapchat with gaming elements. Users can create posts, track daily streaks, level up their profiles, and engage with other users through likes, comments, and follows. The platform encourages consistent posting through gamification features like streaks, levels, and achievement tracking.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: express-session with PostgreSQL store
- **API Design**: RESTful API with structured error handling

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database Provider**: Neon PostgreSQL (serverless)
- **Schema**: Relational model with users, posts, follows, likes, comments, and streaks tables

## Key Components

### User Management
- **Authentication**: Replit Auth integration for secure user login
- **Profile System**: User profiles with customizable usernames, bios, and profile images
- **Gamification**: Level system, streak tracking, and achievement counters

### Content System
- **Posts**: Rich text posts with categories, visibility controls, and level assignments
- **Categories**: Organized content classification (travel, food, fitness, etc.)
- **Visibility**: Public/private post visibility controls

### Social Features
- **Following System**: Users can follow/unfollow other users
- **Engagement**: Like and comment system for posts
- **Discovery**: Explore page for discovering public content

### Gaming Elements
- **Streaks**: Daily posting streak tracking with longest streak records
- **Levels**: Progressive leveling system based on post creation
- **Analytics**: User analytics dashboard with posting statistics

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Post Creation**: Users create posts with categories and visibility settings, triggering streak/level updates
3. **Social Interactions**: Follow/unfollow actions update user relationship tables
4. **Content Discovery**: Public posts are aggregated and displayed on explore page
5. **Analytics Generation**: User statistics are computed from post and interaction data

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework

### Authentication & Security
- **openid-client**: OpenID Connect client for Replit Auth
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR (Hot Module Replacement)
- **Database**: Neon PostgreSQL with environment-based configuration
- **Authentication**: Replit Auth with development domain configuration

### Production Build
- **Frontend**: Vite builds React app to static files
- **Backend**: esbuild bundles Express server for Node.js execution
- **Database**: Drizzle migrations for schema management
- **Deployment**: Single-server deployment with static file serving

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPLIT_DOMAINS**: Allowed domains for authentication
- **ISSUER_URL**: OpenID Connect issuer endpoint

## Changelog

- July 05, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.