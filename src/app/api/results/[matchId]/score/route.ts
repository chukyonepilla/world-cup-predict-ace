import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { scoreMatch } from '@/lib/scoring/engine'

export async function POST(request: Request, { params }: { params: { matchId: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const result = await scoreMatch(params.matchId)

    return NextResponse.json({ success: true, scored: result.scored })
  } catch (error: any) {
    console.error('Scoring error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to score match' },
      { status: 500 }
    )
  }
}
