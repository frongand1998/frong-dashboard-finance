## Frong Finance Dashboard

Responsive financial tracking dashboard with authentication, real-time data fetching, and interactive charts built with Next.js 14, TypeScript, Tailwind CSS v4, Clerk auth, and Supabase PostgreSQL.

### Tech Stack

- **Frontend**: Next.js 16.1.4 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, tailwind-merge, clsx
- **Auth**: Clerk (@clerk/nextjs v6.36.8) with route protection middleware
- **Database**: Supabase (PostgreSQL with RLS policies)
- **Charts**: Recharts for income/expense visualization
- **Validation**: Zod v3.22.4 + React Hook Form v7.50.1
- **Icons**: lucide-react v0.408.0
- **Date handling**: date-fns v3.0.0

### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Copy `.env.example` to `.env.local` and add your Clerk and Supabase credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

3. **Setup Supabase database**

Run the SQL migration script in your Supabase SQL editor:

```bash
# Copy contents of supabase.sql to Supabase SQL Editor
# Or run via Supabase CLI if configured
```

This creates:

- `transactions` table (id, user_id, type, category, amount, date, note)
- `goals` table (id, user_id, name, target_amount, current_amount, due_date, status)
- RLS policies filtering by `auth.uid()::text = user_id`

4. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Features Implemented

✅ **Authentication Flow**

- Sign-up, sign-in pages with Clerk UI components
- Protected dashboard routes with middleware
- User greeting and logout via UserButton
- Public landing page for unauthenticated users

✅ **Dashboard Page**

- Real-time data fetching from Supabase server actions
- Income/expense area chart with dual gradient fills
- Stat cards showing income, expenses, net with trend indicators
- Goal progress indicators with status badges
- Recent transactions table (compact view)
- Loading states with skeleton components
- Error handling with user-friendly messages

✅ **Server Actions** (`src/server-actions/`)

- **Transactions**: `createTransaction`, `getTransactions`, `getTransactionsSummary`, `deleteTransaction`
- **Goals**: `createGoal`, `getGoals`, `updateGoal`, `deleteGoal`
- Clerk auth verification (`auth()` from `@clerk/nextjs/server`)
- Zod validation for data integrity
- Type-safe responses with success/error handling

✅ **UI Component Library**

- Layout: Navbar, Sidebar, PageShell (responsive grid)
- Primitives: Button, Card, Badge, Skeleton
- Dashboard: StatCard, GoalProgress, TransactionsTable, IncomeExpenseChart
- Consistent styling with Tailwind utility classes

✅ **Type Safety**

- TypeScript interfaces for Transaction, Goal, Summary
- Zod schemas for validation: `transactionSchema`, `goalSchema`
- Type-safe server action responses

### Project Structure

```
src/
├── app/
│   ├── (auth)/              # Clerk sign-in/sign-up pages
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── page.tsx         # Main dashboard with real data
│   │   ├── add/page.tsx     # Add transaction (placeholder)
│   │   ├── goals/page.tsx   # Goals management (placeholder)
│   │   └── transactions/page.tsx  # Transaction history (placeholder)
│   ├── layout.tsx           # Root layout with ClerkProvider
│   └── page.tsx             # Public landing page
├── components/
│   ├── auth/                # ProtectedRoute wrapper, UserGreeting
│   ├── charts/              # IncomeExpenseChart
│   ├── dashboard/           # StatCard, GoalProgress, TransactionsTable
│   ├── layout/              # Navbar, Sidebar, PageShell
│   └── ui/                  # Button, Card, Badge, Skeleton
├── lib/
│   ├── validators/          # Zod schemas (transaction, goal)
│   ├── supabaseClient.ts    # Supabase client initialization
│   └── utils.ts             # formatCurrency, formatDate, clamp
├── server-actions/          # Server actions for CRUD operations
│   ├── transactions.ts
│   └── goals.ts
├── types/
│   └── index.ts             # TypeScript type definitions
└── config/
    ├── env.ts               # Environment variable validation
    └── routes.ts            # Navigation config

supabase.sql                 # Database migration script
middleware.ts                # Clerk route protection
```

### Next Steps

1. **Implement Forms**
   - Transaction form with React Hook Form + Zod resolver
   - Goal creation and editing forms
   - Toast notifications for success/error feedback

2. **Transactions Page**
   - Pagination for transaction history
   - Date range and category filters
   - Search functionality
   - Bulk delete/export options

3. **Goals Management**
   - Goal contribution tracking
   - Automated status updates (on_track, at_risk, off_track)
   - Progress notifications

4. **Enhancements**
   - Chart time range selector (day, week, month, year)
   - CSV export for transactions
   - Budget tracking and alerts
   - Responsive mobile optimization

5. **Deployment**
   - Deploy to Vercel with environment variables
   - Configure Supabase production credentials
   - Set up Clerk production instance

### Scripts

- `npm run dev` — Start development server (http://localhost:3000)
- `npm run lint` — Run ESLint for code quality
- `npm run build` — Create production build
- `npm start` — Start production server

### Development Notes

- All dashboard routes use `force-dynamic` rendering to work with Clerk auth
- Supabase server actions use type casting (`as any`) to handle strict TypeScript inference
- Demo Clerk keys (`pk_live_demo`) allow builds without real credentials
- RLS policies ensure data isolation by user ID
