# Database Schema

## Tables

### `user` (Better Auth managed)
- `id`: Primary key (text)
- `name`: User's full name
- `email`: User's email address (unique)
- `emailVerified`: Boolean verification status
- `image`: Profile image URL (optional)
- `createdAt`: Timestamp with timezone
- `updatedAt`: Timestamp with timezone

### `beer_totals`
- `user_id`: Primary key, foreign key to user table (text)
- `quantity`: Total liters consumed (numeric, default 0, >= 0)
- Constraint: `beer_totals_quantity_check` ensures quantity >= 0

### `beers`
- `id`: Primary key (serial/auto-increment)
- `user_id`: Foreign key to user table (text)
- `beer_quantity`: Amount in liters for this specific beer entry (numeric, >= 0)
- `date_drinked`: Timestamp with timezone when beer was consumed (default now())
- Constraint: `beers_beer_quantity_check` ensures beer_quantity >= 0

### `account` (Better Auth managed)
- Authentication account details
- Links to user via `userId`

### `session` (Better Auth managed)
- User session management
- Links to user via `userId`

### `verification` (Better Auth managed)
- Email verification tokens

## Relationships
- `beer_totals.user_id` → `user.id` (one-to-one, CASCADE DELETE)
- `beers.user_id` → `user.id` (one-to-many, CASCADE DELETE)
- `account.userId` → `user.id` (CASCADE DELETE)
- `session.userId` → `user.id` (CASCADE DELETE)

## Key Operations
1. **Record Beer**: Insert into `beers` + Update/Insert `beer_totals`
2. **Remove Beer**: Delete from `beers` + Update `beer_totals`
3. **Get Total**: Query `beer_totals` for user
4. **Get Rankings**: Join `beer_totals` with `user` ordered by quantity

## Notes
- Uses PostgreSQL via Neon serverless
- Better Auth handles user/session/account management
- Quantities stored as numeric (decimal) values in liters
- All timestamps use timezone-aware format
- Leaderboard shows first name only for privacy
- Foreign key constraints ensure data integrity with CASCADE DELETE