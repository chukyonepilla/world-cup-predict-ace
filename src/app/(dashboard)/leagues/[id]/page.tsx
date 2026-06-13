import { createClient, createServiceClient } from '@/lib/supabase/server'
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
  const serviceSupabase = await createServiceClient()
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
    // If it's the global league and doesn't exist, create it using service role
    if (id === '00000000-0000-0000-0000-000000000001') {
      const { error: createError } = await serviceSupabase
        .from('leagues')
        .insert({
          id: id,
          name: 'Global League',
          code: 'GLOBAL',
          description: 'The official World Cup prediction league',
          max_members: 10000,
          created_by: user.id,
        })
      
      if (!createError) {
        // Add user as member using service role
        await serviceSupabase
          .from('league_members')
          .insert({
            league_id: id,
            user_id: user.id,
            role: 'member',
          })
        
        // Refetch league
        const { data: newLeague } = await supabase
          .from('leagues')
          .select('*')
          .eq('id', id)
          .single()
        
        if (newLeague) {
          // Continue with the new league
          return <LeagueContent league={newLeague} user={user} />
        }
      }
    }
    notFound()
  }

  return <LeagueContent league={league} user={user} />
}

async function LeagueContent({ league, user }: { league: any, user: any }) {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()
  const id = league.id

  // Check if user is a member
  const { data: membership } = await supabase
    .from('league_members')
    .select('*')
    .eq('league_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    // Auto-add user to global league using service role
    if (id === '00000000-0000-0000-0000-000000000001') {
      await serviceSupabase
        .from('league_members')
        .insert({
          league_id: id,
          user_id: user.id,
          role: 'member',
        })
    } else {
      redirect(`/leagues/${id}/join`)
    }
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
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{league.name}</h1>
              <p className="text-green-200 text-sm md:text-base">Code: {league.code}</p>
            </div>
            <a
              href="/dashboard"
              className="text-green-200 hover:text-white transition-colors text-sm md:text-base"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">League Information</CardTitle>
              </CardHeader>
              <CardContent>
                {league.description && (
                  <p className="text-gray-700 mb-4 text-sm md:text-base">{league.description}</p>
                )}
                <div className="flex gap-4 text-xs md:text-sm text-gray-600">
                  <span>Members: {members?.length || 0}/{league.max_members}</span>
                  <span>Created: {new Date(league.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Leaderboard</CardTitle>
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
                          <span className="font-medium text-sm md:text-base">
                            {(members?.find((m: any) => m.user_id === ranking.user_id)?.users as any)?.display_name || 'Unknown'}
                          </span>
                        </div>
                        <span className="font-bold text-green-600 text-sm md:text-base">{ranking.total_points} pts</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No rankings yet</p>
                    <p className="text-xs text-gray-500">Rankings will appear once match results are entered and predictions are scored</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members?.map((member: any) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-2"
                    >
                      <div>
                        <p className="font-medium text-sm md:text-base">{(member.users as any)?.display_name}</p>
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
                <CardTitle className="text-lg md:text-xl">Share League</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-gray-600 mb-2">
                  Share this code with friends to let them join:
                </p>
                <div className="bg-gray-100 p-3 rounded text-center font-mono text-lg md:text-xl">
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
