import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LeagueDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch league details
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', id)
    .single()

  if (leagueError || !league) {
    notFound()
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from('league_members')
    .select('*')
    .eq('league_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect(`/leagues/${id}/join`)
  }

  // Fetch league members
  const { data: members } = await supabase
    .from('league_members')
    .select(`
      user_id,
      role,
      users!inner (
        display_name,
        email
      )
    `)
    .eq('league_id', id)

  // Fetch league rankings
  const { data: rankings } = await supabase
    .from('rankings')
    .select('*')
    .eq('league_id', id)
    .order('total_points', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{league.name}</h1>
              <p className="text-green-200">Code: {league.code}</p>
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>League Information</CardTitle>
              </CardHeader>
              <CardContent>
                {league.description && (
                  <p className="text-gray-700 mb-4">{league.description}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Members: {members?.length || 0}/{league.max_members}</span>
                  <span>Created: {new Date(league.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                {rankings && rankings.length > 0 ? (
                  <div className="space-y-3">
                    {rankings.map((ranking: any, index: number) => (
                      <div
                        key={ranking.user_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg w-8">#{index + 1}</span>
                          <span className="font-medium">
                            {(members?.find((m: any) => m.user_id === ranking.user_id)?.users as any)?.display_name || 'Unknown'}
                          </span>
                        </div>
                        <span className="font-bold text-green-600">{ranking.total_points} pts</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No rankings yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members?.map((member: any) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-2"
                    >
                      <div>
                        <p className="font-medium">{(member.users as any)?.display_name}</p>
                        <p className="text-xs text-gray-600">{(member.users as any)?.email}</p>
                      </div>
                      {member.role === 'admin' && (
                        <Badge variant="secondary">Admin</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Share League</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Share this code with friends to let them join:
                </p>
                <div className="bg-gray-100 p-3 rounded text-center font-mono text-lg">
                  {league.code}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
