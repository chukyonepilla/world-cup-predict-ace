import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const formData = await request.formData()
  const homeScore = formData.get('home_score') as string
  const awayScore = formData.get('away_score') as string

  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()
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
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Update match result
    const { error: matchError } = await serviceSupabase
      .from('matches')
      .update({
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
      })
      .eq('id', id)

    if (matchError) throw matchError

    // Create match result record
    const { error: resultError } = await serviceSupabase
      .from('match_results')
      .insert({
        match_id: id,
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
        recorded_by: user.id,
      })

    if (resultError) throw resultError

    // Score all predictions for this match
    const { data: predictions } = await serviceSupabase
      .from('predictions')
      .select('*')
      .eq('match_id', id)

    if (predictions) {
      for (const prediction of predictions) {
        let points = 0

        // Exact score prediction: 10 points
        if (prediction.home_score === parseInt(homeScore) && 
            prediction.away_score === parseInt(awayScore)) {
          points += 10
        }
        // Correct outcome: 3 points
        else if (
          (prediction.home_score > prediction.away_score && parseInt(homeScore) > parseInt(awayScore)) ||
          (prediction.home_score < prediction.away_score && parseInt(homeScore) < parseInt(awayScore)) ||
          (prediction.home_score === prediction.away_score && parseInt(homeScore) === parseInt(awayScore))
        ) {
          points += 3
        }

        // Bonus prediction: 2 points
        // Check if bonus prediction matches (penalty or red card occurred)
        // This would need to be tracked separately - for now, award points if prediction was "yes"
        if (prediction.bonus_prediction) {
          points += 2
        }

        // Update prediction with points
        await serviceSupabase
          .from('predictions')
          .update({
            points_earned: points,
            is_locked: true,
          })
          .eq('id', prediction.id)
      }
    }

    // Update rankings for all leagues
    const { data: leagues } = await serviceSupabase
      .from('leagues')
      .select('id')

    if (leagues) {
      for (const league of leagues) {
        // Recalculate rankings for this league
        const { data: leaguePredictions } = await serviceSupabase
          .from('predictions')
          .select('user_id, points_earned')
          .eq('league_id', league.id)

        if (leaguePredictions) {
          // Group by user and sum points
          const userPoints: { [key: string]: number } = {}
          leaguePredictions.forEach(p => {
            userPoints[p.user_id] = (userPoints[p.user_id] || 0) + (p.points_earned || 0)
          })

          // Update rankings
          for (const [userId, totalPoints] of Object.entries(userPoints)) {
            await serviceSupabase
              .from('rankings')
              .upsert({
                league_id: league.id,
                user_id: userId,
                total_points: totalPoints,
              }, { onConflict: 'league_id,user_id' })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
