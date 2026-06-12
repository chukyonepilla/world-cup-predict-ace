import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const GLOBAL_LEAGUE_ID = '00000000-0000-0000-0000-000000000001'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch upcoming matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .gte('prediction_window_open', new Date().toISOString())
    .order('kickoff_time', { ascending: true })
    .limit(20)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Matches</h1>
            <a
              href="/dashboard"
              className="text-green-200 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Matches</h2>
          <p className="text-gray-600">Predict scores before the deadline</p>
        </div>

        {matches && matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match: any) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {match.home_team} vs {match.away_team}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Stage: {match.stage}</span>
                      <span>{new Date(match.kickoff_time).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(match.kickoff_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {match.venue && (
                      <div className="text-sm text-gray-600">{match.venue}</div>
                    )}
                    <div className="pt-3 border-t">
                      <Link
                        href={`/matches/${match.id}`}
                        className="block w-full bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        Make Prediction
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No upcoming matches available</p>
              <p className="text-sm text-gray-500">Check back later for new fixtures</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
