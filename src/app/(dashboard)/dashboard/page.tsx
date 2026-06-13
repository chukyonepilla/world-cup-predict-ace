import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const GLOBAL_LEAGUE_ID = '00000000-0000-0000-0000-000000000001'

// Fun welcome messages based on time of day
function getWelcomeMessage(name: string): string {
  const hour = new Date().getHours()
  const greetings = [
    `⚽ Hey ${name}, ready to predict some World Cup magic?`,
    `🏆 Welcome back, ${name}! Your predictions await!`,
    `🌟 Great to see you, ${name}! Let's make some winning picks!`,
    `⚡ ${name} is in the house! Time to show off your football knowledge!`,
    `🎯 ${name}, your predictions are legendary! Let's keep it going!`,
  ]
  
  if (hour < 12) return `☀️ Good morning, ${name}! Ready for some World Cup action?`
  if (hour < 18) return `🌤️ Good afternoon, ${name}! Time to make your predictions!`
  return `🌙 Good evening, ${name}! Your World Cup journey continues!`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const displayName = userProfile?.display_name || user.email?.split('@')[0] || 'Pundit'

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

  // Fetch upcoming matches (kickoff between 30 mins and 24 hours)
  const { data: upcomingMatches } = await supabase
    .from('matches')
    .select('*')
    .gt('kickoff_time', new Date(Date.now() + 30 * 60 * 1000).toISOString())
    .lte('kickoff_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    .order('kickoff_time', { ascending: true })
    .limit(5)

  // Fetch user's predictions for upcoming matches
  const { data: userPredictions } = await supabase
    .from('predictions')
    .select('*, matches(*)')
    .eq('user_id', user.id)
    .in('match_id', upcomingMatches?.map((m: any) => m.id) || [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Sports Pundits' World Cup</h1>
              <p className="text-green-200 text-sm md:text-base">Primetime Predict Ace</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
              <Link
                href="/matches"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition-colors text-center"
              >
                View Matches
              </Link>
              <span className="text-sm text-center sm:text-left hidden sm:block">{user.email}</span>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-sm transition-colors w-full sm:w-auto"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {getWelcomeMessage(displayName)}
          </h2>
          <p className="text-gray-600 text-sm md:text-base">Predict 2026 World Cup matches and climb the leaderboard.</p>
        </div>

        {/* Rules Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8 border border-blue-200">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📋</span> How to Play
          </h3>
          <ul className="space-y-2 text-sm md:text-base text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Predictions open <strong>24 hours before kickoff</strong> and close <strong>30 minutes before kickoff</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Predict the exact score for both teams (e.g., 2-1, 3-0)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>Exact score</strong> = 10 points | <strong>Correct outcome</strong> = 5 points | <strong>Bonus</strong> = 3 points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>You can <strong>review or delete</strong> your predictions as long as the match hasn't started</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Climb the leaderboard by making accurate predictions!</span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Your Rank</h3>
            <p className="text-2xl md:text-3xl font-bold text-green-600">#{ranking?.current_rank || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Total Points</h3>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{ranking?.total_points || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Global Players</h3>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{memberCount || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Upcoming Matches</h3>
            {upcomingMatches && upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.map((match: any) => {
                  const prediction = userPredictions?.find((p: any) => p.match_id === match.id)
                  return (
                    <Link key={match.id} href={`/matches/${match.id}`}>
                      <div className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs md:text-sm text-gray-600">{match.group_label || match.stage}</span>
                          <span className="text-xs md:text-sm text-gray-600">
                            {new Date(match.kickoff_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm md:text-base">{match.home_team}</span>
                          <span className="text-gray-400 text-sm">vs</span>
                          <span className="font-medium text-sm md:text-base">{match.away_team}</span>
                        </div>
                        {prediction && (
                          <div className="mt-2 text-xs md:text-sm text-green-600 font-medium">
                            ✓ Your prediction: {prediction.home_score} - {prediction.away_score}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4 text-sm md:text-base">No matches available for prediction right now</p>
            )}
          </div>

          <Link href="/matches">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">All Matches</h3>
              <p className="text-gray-600 text-sm md:text-base">View all World Cup matches and make your predictions</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Link href="/leagues/00000000-0000-0000-0000-000000000001">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Leaderboard</h3>
              <p className="text-gray-600 text-sm md:text-base">See how you rank against other predictors</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Your Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Exact Scores</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{ranking?.exact_scores_count || 0}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Correct Outcomes</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{ranking?.correct_outcomes_count || 0}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Bonus Predictions</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{ranking?.correct_bonus_count || 0}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Current Streak</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{ranking?.current_streak || 0}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
