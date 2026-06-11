# Sports Pundits' World Cup Primetime Predict Ace

A modern, mobile-friendly football prediction web application for private leagues. Compete with friends, family, and colleagues by predicting World Cup match outcomes and earning points.

## Features

- **Private League System** - Create and join private leagues with invitation codes
- **Match Predictions** - Predict scores and bonus events (penalties, red cards)
- **Real-time Rankings** - Live leaderboards that update instantly
- **Knockout Stage Support** - Additional predictions for extra time and shootouts
- **Scoring Engine** - Automatic point calculation based on prediction accuracy
- **Timezone Support** - All times displayed in user's local timezone

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Hosting**: Vercel (FREE), GitHub (FREE), Supabase Free Tier
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd windsurf-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings → API to get your credentials
   - Copy the project URL and anon key

4. **Configure environment variables**
   ```bash
   # Copy the template
   cp .env.template .env.local
   ```
   
   Edit `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. **Run database migrations**
   
   Option A: Using Supabase Dashboard
   - Go to SQL Editor in Supabase Dashboard
   - Run the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the contents of `supabase/migrations/002_rls_policies.sql`
   
   Option B: Using Supabase CLI (recommended)
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref your-project-id
   supabase db push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── (admin)/           # Admin pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── league/           # League components
│   ├── match/            # Match components
│   └── ...
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase clients
│   ├── scoring/          # Scoring engine
│   ├── hooks/            # Custom React hooks
│   └── stores/           # State management
├── types/                # TypeScript types
└── config/               # Configuration files
```

## Database Schema

The application uses the following main tables:
- `users` - User profiles
- `leagues` - Private leagues
- `league_members` - League memberships
- `matches` - World Cup fixtures
- `predictions` - User predictions
- `match_results` - Official match results
- `rankings` - League rankings
- `statistics` - User statistics
- `notifications` - User notifications
- `audit_logs` - System audit trail

See `TECHNICAL_BLUEPRINT.md` for complete documentation.

## Scoring System

### Group Stage (Max 5 points)
- Exact score: 3 points
- Correct outcome: 1 point
- Correct bonus prediction: 2 points

### Knockout Stage (Max 8 points)
- Exact score (90 min): 3 points
- Correct outcome (90 min): 1 point
- Correct bonus prediction: 2 points
- Correct extra time prediction: 1 point
- Correct shootout prediction: 1 point
- Correct eventual winner: 1 point

## Deployment

### Free Hosting Stack

This project is designed to run entirely on free tiers:

- **GitHub** - Source code hosting (FREE)
- **Vercel** - Application hosting (FREE - 100GB bandwidth)
- **Supabase** - Database & backend (FREE - 500MB DB, 50K MAU)

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify (Alternative)

1. Push your code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Add environment variables
4. Deploy!

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## License

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
