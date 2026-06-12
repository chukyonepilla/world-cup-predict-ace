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

  // Fetch today's matches (still open for prediction)
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const { data: todayMatches } = await supabase
    .from('matches')
    .select('*')
    .gte('kickoff_time', startOfDay)
    .lte('kickoff_time', endOfDay)
    .gt('prediction_window_close', new Date().toISOString())
    .order('kickoff_time', { ascending: true })

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
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Matches</h3>
            {todayMatches && todayMatches.length > 0 ? (
              <div className="space-y-3">
                {todayMatches.map((match: any) => (
                  <Link key={match.id} href={`/matches/${match.id}`}>
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">{match.group_label}</span>
                        <span className="text-sm text-gray-600">
                          {new Date(match.kickoff_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{match.home_team}</span>
                        <span className="text-gray-400">vs</span>
                        <span className="font-medium">{match.away_team}</span>
                      </div>
                      {match.venue && (
                        <p className="text-xs text-gray-500 mt-2">{match.venue}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No matches available for prediction today</p>
            )}
          </div>

          <Link href="/matches">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Matches</h3>
              <p className="text-gray-600">View all World Cup matches and make your predictions</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
