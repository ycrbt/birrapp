# Birrapp - Project Overview

## Application Description
Birrapp is a beer tracking Progressive Web App (PWA) built with Next.js 16 and React 19. The app allows users to track their beer consumption, view statistics, compete on leaderboards, and receive push notifications when others drink.

## Core Features
- **Beer Counter**: Track beer consumption by different sizes (20cl, 25cl, 33cl, 50cl, 1L)
- **Leaderboard**: Ranking system showing top beer consumers
- **Statistics**: Visual comparisons of beer consumption (weight equivalents, height of bottles)
- **Push Notifications**: Real-time notifications when users drink
- **Google Authentication**: OAuth login via Better Auth
- **PWA Support**: Installable app with offline capabilities

## Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Authentication**: Better Auth with Google OAuth
- **Database**: PostgreSQL via Neon (serverless)
- **Deployment**: Vercel-ready configuration

## Architecture
- **App Router**: Next.js 16 app directory structure
- **Server Actions**: Used for database operations
- **Context Providers**: React Context for state management (Beer, User, Notifications)
- **Component-based**: Modular React components
- **API Routes**: Next.js API routes for auth and notifications

## Key Directories
- `/app`: Next.js app router pages and API routes
- `/components`: React components
- `/lib`: Utilities, contexts, and business logic
- `/public`: Static assets and PWA files