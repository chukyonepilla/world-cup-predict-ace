import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const serviceSupabase = await createServiceClient()

  try {
    // Fetch matches that don't have results yet
    const { data: matches } = await serviceSupabase
      .from('matches')
      .select('*')
      .lt('kickoff_time', new Date().toISOString())
      .is('home_score', null)

    if (!matches || matches.length === 0) {
      return NextResponse.json({ message: 'No matches to update' })
    }

    // Use Football-Data.org (free API, requires API key but free to get)
    // Get free API key from: https://www.football-data.org/
    const API_KEY = process.env.FOOTBALL_DATA_API_KEY || ''
    
    if (!API_KEY) {
      return NextResponse.json({ 
        error: 'FOOTBALL_DATA_API_KEY not set in environment variables',
        message: 'Get a free API key from https://www.football-data.org/',
        matchesNeedingUpdate: matches.length
      }, { status: 400 })
    }

    // For World Cup 2026, we'll need to use the specific competition ID
    // World Cup 2026 competition ID will be available when the tournament starts
    // For now, we'll show the structure
    
    // Example for World Cup (competition ID will be updated for 2026)
    const WORLD_CUP_ID = '2002' // This is for a past World Cup, will need to update for 2026
    
    const response = await fetch(`https://api.football-data.org/v4/competitions/${WORLD_CUP_ID}/matches`, {
      headers: {
        'X-Auth-Token': API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch data from Football-Data.org')
    }

    const data = await response.json()
    
    // Update matches with results from API
    let updatedCount = 0
    for (const match of matches) {
      // Find matching match from API data
      const apiMatch = data.matches?.find((m: any) => 
        m.homeTeam.name === match.home_team && 
        m.awayTeam.name === match.away_team &&
        new Date(m.utcDate).toISOString() === new Date(match.kickoff_time).toISOString()
      )

      if (apiMatch && apiMatch.status === 'FINISHED') {
        // Update match result
        await serviceSupabase
          .from('matches')
          .update({
            home_score: apiMatch.score.fullTime.home,
            away_score: apiMatch.score.fullTime.away,
            status: 'finished',
          })
          .eq('id', match.id)

        // Create match result record
        await serviceSupabase
          .from('match_results')
          .insert({
            match_id: match.id,
            home_score: apiMatch.score.fullTime.home,
            away_score: apiMatch.score.fullTime.away,
            recorded_by: 'system',
          })

        // Score predictions (same logic as manual entry)
        const { data: predictions } = await serviceSupabase
          .from('predictions')
          .select('*')
          .eq('match_id', match.id)

        if (predictions) {
          for (const prediction of predictions) {
            let points = 0

            // Exact score prediction: 10 points
            if (prediction.home_score === apiMatch.score.fullTime.home && 
                prediction.away_score === apiMatch.score.fullTime.away) {
              points += 10
            }
            // Correct outcome: 3 points
            else if (
              (prediction.home_score > prediction.away_score && apiMatch.score.fullTime.home > apiMatch.score.fullTime.away) ||
              (prediction.home_score < prediction.away_score && apiMatch.score.fullTime.home < apiMatch.score.fullTime.away) ||
              (prediction.home_score === prediction.away_score && apiMatch.score.fullTime.home === apiMatch.score.fullTime.away)
            ) {
              points += 3
            }

            // Bonus prediction: 2 points (simplified - would need actual match stats)
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

        updatedCount++
      }
    }

    // Update rankings for all leagues
    const { data: leagues } = await serviceSupabase
      .from('leagues')
      .select('id')

    if (leagues) {
      for (const league of leagues) {
        const { data: leaguePredictions } = await serviceSupabase
          .from('predictions')
          .select('user_id, points_earned')
          .eq('league_id', league.id)

        if (leaguePredictions) {
          const userPoints: { [key: string]: number } = {}
          leaguePredictions.forEach(p => {
            userPoints[p.user_id] = (userPoints[p.user_id] || 0) + (p.points_earned || 0)
          })

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

    return NextResponse.json({ 
      success: true,
      message: `Updated ${updatedCount} matches`,
      totalMatchesChecked: matches.length
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
