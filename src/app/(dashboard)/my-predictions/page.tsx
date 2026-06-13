import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const GLOBAL_LEAGUE_ID = '00000000-0000-0000-0000-000000000001'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MyPredictionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all user's predictions with match details
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*, matches(*)')
    .eq('user_id', user.id)
    .eq('league_id', GLOBAL_LEAGUE_ID)
    .order('submitted_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold">My Predictions</h1>
            <Link
              href="/dashboard"
              className="text-green-200 hover:text-white transition-colors text-sm md:text-base"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Your Predictions</h2>
          <p className="text-gray-600">Review your predictions and track your results</p>
        </div>

        {predictions && predictions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {predictions.map((prediction: any) => {
              const match = prediction.matches
              const isLocked = prediction.is_locked
              const pointsEarned = prediction.points_earned
              const now = new Date()
              const kickoffTime = new Date(match.kickoff_time)
              const matchStarted = kickoffTime <= now

              return (
                <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                      {match.home_team} vs {match.away_team}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span className="capitalize">
                          {match.stage === 'round_of_32' ? 'Round of 32' :
                           match.stage === 'round16' ? 'Round of 16' :
                           match.stage === 'quarter' ? 'Quarterfinal' :
                           match.stage === 'semi' ? 'Semifinal' :
                           match.stage === 'third_place' ? 'Third Place' :
                           match.stage.replace('_', ' ')}
                        </span>
                        <span>
                          {new Date(match.kickoff_time).toLocaleDateString()} at{' '}
                          {new Date(match.kickoff_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Your Prediction:</span>
                          <span className="text-2xl font-bold text-green-700">
                            {prediction.home_score} - {prediction.away_score}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Bonus: {prediction.bonus_type === 'penalty' ? 'Penalty' : 'Red Card'} - {prediction.bonus_prediction ? 'Yes' : 'No'}
                        </div>
                        {match.stage !== 'group' && (
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Extra Time: {prediction.extra_time_prediction ? 'Yes' : 'No'}</div>
                            <div>Penalty Shootout: {prediction.penalty_shootout_prediction ? 'Yes' : 'No'}</div>
                            <div>Eventual Winner: {prediction.eventual_winner === 'home' ? match.home_team : match.away_team}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="flex items-center gap-2">
                          {isLocked ? (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Locked</span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Can Edit</span>
                          )}
                          {matchStarted && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Match Started</span>
                          )}
                        </div>
                        {pointsEarned > 0 && (
                          <span className="text-lg font-bold text-green-600">+{pointsEarned} pts</span>
                        )}
                      </div>

                      {!isLocked && !matchStarted && (
                        <Link
                          href={`/matches/${match.id}`}
                          className="block w-full bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition-colors text-sm"
                        >
                          Edit Prediction
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't made any predictions yet</p>
              <Link
                href="/matches"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
              >
                View Matches to Predict
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
