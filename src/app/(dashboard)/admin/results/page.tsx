import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    redirect('/dashboard')
  }

  // Fetch matches that need results (kickoff time passed, no result)
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .lt('kickoff_time', new Date().toISOString())
    .is('home_score', null)
    .order('kickoff_time', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Admin - Match Results</h1>
              <p className="text-green-200 text-sm md:text-base">Enter match results to update rankings</p>
            </div>
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
          <h2 className="text-2xl font-bold text-gray-900">Matches Needing Results</h2>
          <p className="text-gray-600">Enter the final scores for completed matches</p>
        </div>

        {matches && matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {matches.map((match: any) => (
              <Card key={match.id}>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">
                    {match.home_team} vs {match.away_team}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {new Date(match.kickoff_time).toLocaleDateString()} at{' '}
                    {new Date(match.kickoff_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  <form action={`/api/matches/${match.id}/result`} method="POST" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {match.home_team} Score
                        </label>
                        <Input
                          type="number"
                          name="home_score"
                          min="0"
                          required
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {match.away_team} Score
                        </label>
                        <Input
                          type="number"
                          name="away_score"
                          min="0"
                          required
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Result
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No matches need results at this time</p>
              <p className="text-sm text-gray-500">Matches will appear here after kickoff time passes</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
