import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const GLOBAL_LEAGUE_ID = '00000000-0000-0000-0000-000000000001'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's ranking in global league
  const { data: ranking } = await supabase
    .from('rankings')
    .select('*')
    .eq('league_id', GLOBAL_LEAGUE_ID)
    .eq('user_id', user.id)
    .single()

  // Fetch total members in global league
  const { count: memberCount } = await supabase
    .from('league_members')
    .select('*', { count: 'exact', head: true })
    .eq('league_id', GLOBAL_LEAGUE_ID)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Sports Pundits' World Cup</h1>
              <p className="text-green-200">Primetime Predict Ace</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/matches"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition-colors"
              >
                View Matches
              </Link>
              <span className="text-sm">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-sm transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Predict 2026 World Cup matches and climb the leaderboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Rank</h3>
            <p className="text-3xl font-bold text-green-600">#{ranking?.current_rank || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Points</h3>
            <p className="text-3xl font-bold text-green-600">{ranking?.total_points || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Players</h3>
            <p className="text-3xl font-bold text-green-600">{memberCount || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link href="/matches">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upcoming Matches</h3>
              <p className="text-gray-600">View all World Cup matches and make your predictions</p>
            </div>
          </Link>

          <Link href="/leagues/00000000-0000-0000-0000-000000000001">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Leaderboard</h3>
              <p className="text-gray-600">See how you rank against other predictors</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Exact Scores</p>
              <p className="text-2xl font-bold text-green-600">{ranking?.exact_scores_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Correct Outcomes</p>
              <p className="text-2xl font-bold text-green-600">{ranking?.correct_outcomes_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bonus Predictions</p>
              <p className="text-2xl font-bold text-green-600">{ranking?.correct_bonus_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-green-600">{ranking?.current_streak || 0}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
