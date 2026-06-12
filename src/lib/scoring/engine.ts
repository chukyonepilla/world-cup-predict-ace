import { createClient } from '@/lib/supabase/server'
import { calculatePredictionPoints, getMaxPoints } from './calculator'

export async function scoreMatch(matchId: string) {
  const supabase = await createClient()

  // Fetch match details
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    throw new Error('Match not found')
  }

  // Fetch match result
  const { data: result, error: resultError } = await supabase
    .from('match_results')
    .select('*')
    .eq('match_id', matchId)
    .single()

  if (resultError || !result) {
    throw new Error('Match result not found')
  }

  // Fetch all predictions for this match
  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', matchId)

  if (predictionsError) {
    throw predictionsError
  }

  // Score each prediction
  const scoredPredictions = predictions?.map((prediction) => {
    const breakdown = calculatePredictionPoints(
      {
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        bonus_type: prediction.bonus_type,
        bonus_prediction: prediction.bonus_prediction,
        extra_time_prediction: prediction.extra_time_prediction,
        penalty_shootout_prediction: prediction.penalty_shootout_prediction,
        eventual_winner: prediction.eventual_winner,
      },
      {
        home_score: result.home_score,
        away_score: result.away_score,
        penalty_occurred: result.penalty_occurred,
        red_card_occurred: result.red_card_occurred,
        extra_time_played: result.extra_time_played,
        penalty_shootout_occurred: result.penalty_shootout_occurred,
        eventual_winner: result.eventual_winner,
      },
      match.stage
    )

    return {
      id: prediction.id,
      points_earned: breakdown.total_points,
      points_breakdown: breakdown,
    }
  })

  // Update all predictions with scores
  if (scoredPredictions) {
    for (const scored of scoredPredictions) {
      await supabase
        .from('predictions')
        .update({
          points_earned: scored.points_earned,
          points_breakdown: scored.points_breakdown,
        })
        .eq('id', scored.id)
    }
  }

  // Update rankings for all affected leagues
  await updateRankingsForMatch(matchId)

  // Mark scoring as complete
  await supabase
    .from('match_results')
    .update({ scoring_completed: true })
    .eq('match_id', matchId)

  return { scored: scoredPredictions?.length || 0 }
}

async function updateRankingsForMatch(matchId: string) {
  const supabase = await createClient()

  // Get all unique leagues from predictions
  const { data: leagues } = await supabase
    .from('predictions')
    .select('league_id')
    .eq('match_id', matchId)

  const leagueIds = [...new Set(leagues?.map((l) => l.league_id))]

  // Update rankings for each league
  for (const leagueId of leagueIds) {
    await updateLeagueRankings(leagueId)
  }
}

async function updateLeagueRankings(leagueId: string) {
  const supabase = await createClient()

  // Get all users in the league
  const { data: members } = await supabase
    .from('league_members')
    .select('user_id')
    .eq('league_id', leagueId)

  const userIds = members?.map((m) => m.user_id) || []

  // Calculate total points and tie-break stats for each user
  const rankings: any[] = []

  for (const userId of userIds) {
    const { data: predictions } = await supabase
      .from('predictions')
      .select('points_earned, points_breakdown, submitted_at, match_id')
      .eq('user_id', userId)
      .eq('league_id', leagueId)

    const totalPoints = predictions?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0

    // Calculate tie-break stats
    let exactScoresCount = 0
    let correctBonusCount = 0
    let correctWinnerCount = 0
    let earliestSubmission: Date | null = null

    predictions?.forEach((p) => {
      const breakdown = p.points_breakdown as any
      if (breakdown?.is_exact_score) exactScoresCount++
      if (breakdown?.is_correct_bonus) correctBonusCount++
      if (breakdown?.winner_points === 1) correctWinnerCount++

      const submittedAt = new Date(p.submitted_at)
      if (!earliestSubmission || submittedAt < earliestSubmission) {
        earliestSubmission = submittedAt
      }
    })

    // Get previous rank
    const { data: existingRanking } = await supabase
      .from('rankings')
      .select('current_rank')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single()

    rankings.push({
      league_id: leagueId,
      user_id: userId,
      total_points: totalPoints,
      exact_scores_count: exactScoresCount,
      correct_bonus_count: correctBonusCount,
      correct_winner_count: correctWinnerCount,
      earliest_submission: earliestSubmission,
      previous_rank: existingRanking?.current_rank || null,
    })
  }

  // Sort by tie-break rules:
  // 1. Total points (descending)
  // 2. Most exact score predictions (descending)
  // 3. Most correct bonus predictions (descending)
  // 4. Most correct winner predictions (descending)
  // 5. Earliest prediction submission time (ascending)
  rankings.sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points
    if (b.exact_scores_count !== a.exact_scores_count) return b.exact_scores_count - a.exact_scores_count
    if (b.correct_bonus_count !== a.correct_bonus_count) return b.correct_bonus_count - a.correct_bonus_count
    if (b.correct_winner_count !== a.correct_winner_count) return b.correct_winner_count - a.correct_winner_count
    if (a.earliest_submission && b.earliest_submission) {
      return a.earliest_submission.getTime() - b.earliest_submission.getTime()
    }
    return 0
  })

  // Assign ranks (handle ties)
  rankings.forEach((ranking, index) => {
    if (index === 0) {
      ranking.current_rank = 1
    } else {
      const prev = rankings[index - 1]
      const isTie =
        prev.total_points === ranking.total_points &&
        prev.exact_scores_count === ranking.exact_scores_count &&
        prev.correct_bonus_count === ranking.correct_bonus_count &&
        prev.correct_winner_count === ranking.correct_winner_count &&
        prev.earliest_submission?.getTime() === ranking.earliest_submission?.getTime()

      ranking.current_rank = isTie ? prev.current_rank : index + 1
    }
  })

  // Update or insert rankings
  for (const ranking of rankings) {
    const { data: existing } = await supabase
      .from('rankings')
      .select('id')
      .eq('league_id', leagueId)
      .eq('user_id', ranking.user_id)
      .single()

    if (existing) {
      await supabase
        .from('rankings')
        .update({
          total_points: ranking.total_points,
          exact_scores_count: ranking.exact_scores_count,
          correct_bonus_count: ranking.correct_bonus_count,
          correct_winner_count: ranking.correct_winner_count,
          current_rank: ranking.current_rank,
          previous_rank: ranking.previous_rank,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('rankings').insert({
        league_id: leagueId,
        user_id: ranking.user_id,
        total_points: ranking.total_points,
        exact_scores_count: ranking.exact_scores_count,
        correct_bonus_count: ranking.correct_bonus_count,
        correct_winner_count: ranking.correct_winner_count,
        current_rank: ranking.current_rank,
        previous_rank: ranking.previous_rank,
      })
    }
  }
}
