import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's leagues
  const { data: leagues } = await supabase
    .from('league_members')
    .select(`
      leagues (
        id,
        name,
        code,
        created_at
      )
    `)
    .eq('user_id', user.id)

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
          <p className="text-gray-600">Manage your predictions and compete in leagues.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Leagues</h3>
            <p className="text-3xl font-bold text-green-600">{leagues?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Points</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Rank</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Your Leagues</h3>
            <a
              href="/leagues/create"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Create League
            </a>
          </div>

          {leagues && leagues.length > 0 ? (
            <div className="space-y-3">
              {leagues.map((membership: any) => (
                <div
                  key={membership.leagues.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">{membership.leagues.name}</h4>
                      <p className="text-sm text-gray-600">Code: {membership.leagues.code}</p>
                    </div>
                    <a
                      href={`/leagues/${membership.leagues.id}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't joined any leagues yet.</p>
              <a
                href="/leagues/create"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Create Your First League
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
