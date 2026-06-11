'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function JoinLeaguePage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Verify league exists
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', params.id)
        .single()

      if (leagueError || !league) {
        throw new Error('League not found')
      }

      // Check if code matches
      if (league.code !== code) {
        throw new Error('Invalid league code')
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('league_members')
        .select('*')
        .eq('league_id', params.id)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        throw new Error('You are already a member of this league')
      }

      // Check if league is full
      const { count: memberCount } = await supabase
        .from('league_members')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', params.id)

      if (memberCount && memberCount >= league.max_members) {
        throw new Error('League is full')
      }

      // Join league
      const { error: joinError } = await supabase.from('league_members').insert({
        league_id: params.id,
        user_id: user.id,
        role: 'member',
      })

      if (joinError) throw joinError

      router.push(`/leagues/${params.id}`)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Join League</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Enter League Code</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  League Code *
                </label>
                <Input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest uppercase"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Joining...' : 'Join League'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/dashboard"
                className="text-green-600 hover:text-green-700 text-sm"
              >
                ← Back to Dashboard
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
