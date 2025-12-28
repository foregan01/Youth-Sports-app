# TeamBudget

Real-time budget tracking and financial transparency platform for youth sports teams.

## Overview

TeamBudget transforms chaotic youth sports finances into transparent, real-time budget tracking that builds trust between team organizers and parents.

### Key Features

- **Real-Time Dashboard**: Live balance and transaction feed with visual charts
- **Expense Management**: Quick expense entry with receipt capture
- **Parent Portal**: Read-only access for parents to view team finances
- **Notifications**: Automatic alerts for large expenses and budget updates
- **Multi-Team Support**: Manage multiple teams from one account

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT with refresh tokens

## Project Structure

```
teambudget/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── config/   # Configuration
│   │   ├── db/       # Database setup and migrations
│   │   ├── middleware/ # Auth and error handling
│   │   └── routes/   # API endpoints
│   └── package.json
├── frontend/         # React web application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/      # API client and utilities
│   │   ├── pages/    # Page components
│   │   └── store/    # State management (Zustand)
│   └── package.json
├── shared/           # Shared types and utilities
│   └── src/
│       └── index.ts  # TypeScript interfaces and helpers
└── package.json      # Root package.json with workspaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd teambudget
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:3001`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Teams
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `GET /api/teams/:id/dashboard` - Get dashboard data
- `POST /api/teams/:id/members` - Add team member

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id` - Update transaction
- `POST /api/transactions/:id/void` - Void transaction

### Receipts
- `POST /api/receipts` - Upload receipt
- `GET /api/receipts/:id` - Get receipt
- `DELETE /api/receipts/:id` - Delete receipt

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## User Roles

- **Treasurer**: Full access - can add/edit transactions, manage team
- **Coach**: View-only access to team finances
- **Parent**: View-only access to team finances

## License

MIT
