# Setup Guide - Sports Pundits' World Cup Primetime Predict Ace

## What's Been Built

✅ **Completed Features:**

1. **Project Setup**
   - Next.js 14 with TypeScript and Tailwind CSS
   - Supabase integration (auth, database, realtime)
   - shadcn/ui components
   - Complete folder structure

2. **Authentication System**
   - User registration with email/password
   - Login/logout functionality
   - Protected routes with middleware
   - Session management

3. **Database Schema**
   - Complete database schema with 10 tables
   - Row-Level Security (RLS) policies
   - Database triggers for timestamps
   - Migration files ready to run

4. **League Management**
   - Create private leagues with unique codes
   - Join leagues via invitation code
   - League detail pages with member lists
   - League sharing functionality

5. **Match & Prediction System**
   - Match listing page
   - Match detail with prediction form
   - Score predictions (home/away)
   - Bonus predictions (penalty/red card)
   - Knockout stage predictions (extra time, shootout, winner)
   - Prediction window enforcement

6. **Scoring Engine**
   - Points calculation based on business rules
   - Group stage scoring (max 5 points)
   - Knockout stage scoring (max 8 points)
   - Automatic ranking updates
   - Detailed points breakdown

7. **Leaderboards**
   - League rankings display
   - Rank movement indicators
   - Member statistics

## Next Steps to Get Running

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API to get your credentials:
   - Project URL
   - anon/public key
   - service_role key (for admin operations)

### 2. Configure Environment Variables

Copy the template and create your local environment file:

```bash
# The .env.local file is git-ignored, so create it manually
# Copy the values from .env.template and fill in your Supabase credentials
```

Create `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Sports Pundits' World Cup Primetime Predict Ace
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true
NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS=true
ADMIN_EMAIL=your-email@example.com
```

### 3. Run Database Migrations

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and run the contents of `supabase/migrations/001_initial_schema.sql`
4. Copy and run the contents of `supabase/migrations/002_rls_policies.sql`

**Option B: Using Supabase CLI (Recommended for development)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

### 4. Create an Admin User

After running migrations, you'll need to create an admin user. You can do this via the Supabase Dashboard:

1. Go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. After creation, go to Table Editor → users table
5. Find your user and set `is_admin` to `true`

### 5. Add Sample Data (Optional)

To test the app, you'll need some sample data:

1. **Create a league** via the UI after logging in
2. **Add matches** - You can insert sample matches via SQL Editor:

```sql
INSERT INTO matches (home_team, away_team, kickoff_time, stage, prediction_window_open, prediction_window_close) VALUES
('Brazil', 'Croatia', NOW() + INTERVAL '1 day', 'group', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '30 minutes'),
('Argentina', 'Mexico', NOW() + INTERVAL '2 days', 'group', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '30 minutes');
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test the Application

1. **Register a new account** at `/register`
2. **Create a league** from the dashboard
3. **Share the league code** with friends (or use a second browser to test)
4. **Join the league** with the code
5. **Make predictions** on upcoming matches
6. **Enter match results** (as admin) via SQL Editor:

```sql
INSERT INTO match_results (match_id, home_score, away_score, penalty_occurred, red_card_occurred, entered_by) 
VALUES 
('match-id-here', 2, 1, true, false, 'your-user-id');
```

7. **Trigger scoring** by calling the API endpoint (or create an admin page for this)

## Deployment

### Deploy to Vercel (FREE)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify (FREE - Alternative)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Add environment variables
4. Deploy!

## Known Limitations & Future Enhancements

### Current Limitations

- No admin dashboard for entering match results (must use SQL)
- No fixture sync from FIFA API (must add matches manually)
- No email notifications
- No real-time leaderboard updates (requires Supabase Realtime setup)
- No mobile app (responsive web only)

### Recommended Next Steps

1. **Admin Dashboard**: Create `/admin` routes for:
   - Match result entry
   - Fixture management
   - User management
   - Manual scoring trigger

2. **Fixture Sync**: Implement FIFA API integration to automatically load fixtures

3. **Real-time Updates**: Set up Supabase Realtime subscriptions for live leaderboard updates

4. **Email Notifications**: Integrate Supabase Auth emails or SendGrid for notifications

5. **Statistics Dashboard**: Add detailed user statistics and achievements

6. **Activity Feed**: Implement social activity feed for league interactions

7. **Mobile App**: Consider React Native or PWA for mobile experience

## Troubleshooting

### "Not authenticated" errors

- Ensure you've set up the environment variables correctly
- Check that Supabase Auth is enabled in your project
- Verify the middleware is working correctly

### Database connection errors

- Double-check your Supabase URL and keys
- Ensure migrations have been run
- Check that RLS policies are not blocking access

### Prediction window errors

- Ensure match `prediction_window_open` and `prediction_window_close` are set correctly
- Check that your system timezone matches the match times

## Support

For issues or questions:
- Check the `TECHNICAL_BLUEPRINT.md` for detailed architecture
- Review Supabase documentation for specific features
- Check Next.js documentation for framework questions
