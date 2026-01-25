# Component Architecture

## Main Components

### `AuthenticatedHome.tsx`
- **Purpose**: Main app container with navigation
- **State**: `activePage` (counter | leaderboard | stats)
- **Features**: Bottom navigation bar, page switching
- **Providers**: Wraps content in `BeerProvider`

### `BeerCounter.tsx`
- **Purpose**: Core beer tracking interface
- **Features**: 
  - Beer size buttons (20cl, 25cl, 33cl, 50cl, 1L)
  - Undo functionality with history tracking
  - Real-time total display
  - Motivational messages
- **State**: Local history for undo operations
- **Context**: Uses `useBeer()` hook

### `BeerLeaderboard.tsx`
- **Purpose**: Ranking display of all users
- **Features**:
  - Top 10 users by consumption
  - Medal emojis for top 3
  - Responsive table design
  - Shows both liters and beer count
- **Data**: Fetches from `getBeerRankings()`

### `BeerStats.tsx`
- **Purpose**: Visual statistics and comparisons
- **Features**:
  - Scrollable cards with snap behavior
  - Weight comparisons (animals, objects)
  - Height comparisons (bottle stacking)
  - Humorous mocking phrases
  - Dot indicators for navigation
- **State**: `activeCard` tracking, scroll handling

## Context Providers

### `BeerContext.tsx`
- **State**: `totalLiters`, `isLoading`
- **Methods**: `updateTotal()`, `refreshTotal()`
- **Purpose**: Global beer consumption state

### `UserContext.tsx`
- **State**: `user`, `isLoading`
- **Purpose**: User session management
- **Data**: Fetches from `/api/auth/session`

## Component Patterns

### Loading States
- Skeleton loading with pulsing animations
- Consistent loading indicators across components
- Graceful error handling

### Responsive Design
- Mobile-first approach
- Safe area handling for iOS
- Tailwind CSS utility classes
- Dark theme (zinc color palette)

### Accessibility
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Screen reader considerations