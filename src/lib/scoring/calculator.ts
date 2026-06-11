export interface Prediction {
  home_score: number
  away_score: number
  bonus_type: 'penalty' | 'red_card'
  bonus_prediction: boolean
  extra_time_prediction?: boolean | null
  penalty_shootout_prediction?: boolean | null
  eventual_winner?: 'home' | 'away' | null
}

export interface MatchResult {
  home_score: number
  away_score: number
  penalty_occurred: boolean
  red_card_occurred: boolean
  extra_time_played?: boolean
  penalty_shootout_occurred?: boolean
  eventual_winner?: 'home' | 'away' | 'draw'
}

export interface PointsBreakdown {
  score_points: number
  bonus_points: number
  extra_time_points?: number
  shootout_points?: number
  winner_points?: number
  total_points: number
  is_exact_score: boolean
  is_correct_outcome: boolean
  is_correct_bonus: boolean
}

export function calculatePredictionPoints(
  prediction: Prediction,
  result: MatchResult,
  stage: 'group' | 'round16' | 'quarter' | 'semi' | 'third_place' | 'final'
): PointsBreakdown {
  const breakdown: PointsBreakdown = {
    score_points: 0,
    bonus_points: 0,
    extra_time_points: 0,
    shootout_points: 0,
    winner_points: 0,
    total_points: 0,
    is_exact_score: false,
    is_correct_outcome: false,
    is_correct_bonus: false,
  }

  // Calculate score points
  const predictedHome = prediction.home_score
  const predictedAway = prediction.away_score
  const actualHome = result.home_score
  const actualAway = result.away_score

  // Check for exact score
  if (predictedHome === actualHome && predictedAway === actualAway) {
    breakdown.score_points = 3
    breakdown.is_exact_score = true
    breakdown.is_correct_outcome = true
  } else {
    // Check for correct outcome
    const predictedOutcome = getOutcome(predictedHome, predictedAway)
    const actualOutcome = getOutcome(actualHome, actualAway)

    if (predictedOutcome === actualOutcome) {
      breakdown.score_points = 1
      breakdown.is_correct_outcome = true
    }
  }

  // Calculate bonus points
  if (prediction.bonus_type === 'penalty') {
    if (prediction.bonus_prediction === result.penalty_occurred) {
      breakdown.bonus_points = 2
      breakdown.is_correct_bonus = true
    }
  } else if (prediction.bonus_type === 'red_card') {
    if (prediction.bonus_prediction === result.red_card_occurred) {
      breakdown.bonus_points = 2
      breakdown.is_correct_bonus = true
    }
  }

  // Knockout stage additional predictions
  if (stage !== 'group') {
    // Extra time prediction
    if (prediction.extra_time_prediction !== undefined && prediction.extra_time_prediction !== null) {
      if (prediction.extra_time_prediction === (result.extra_time_played || false)) {
        breakdown.extra_time_points = 1
      }
    }

    // Penalty shootout prediction
    if (prediction.penalty_shootout_prediction !== undefined && prediction.penalty_shootout_prediction !== null) {
      if (prediction.penalty_shootout_prediction === (result.penalty_shootout_occurred || false)) {
        breakdown.shootout_points = 1
      }
    }

    // Eventual winner prediction
    if (prediction.eventual_winner && result.eventual_winner) {
      if (prediction.eventual_winner === result.eventual_winner) {
        breakdown.winner_points = 1
      }
    }
  }

  // Calculate total
  breakdown.total_points =
    breakdown.score_points +
    breakdown.bonus_points +
    (breakdown.extra_time_points || 0) +
    (breakdown.shootout_points || 0) +
    (breakdown.winner_points || 0)

  return breakdown
}

function getOutcome(homeScore: number, awayScore: number): 'home' | 'away' | 'draw' {
  if (homeScore > awayScore) return 'home'
  if (awayScore > homeScore) return 'away'
  return 'draw'
}

export function getMaxPoints(stage: 'group' | 'round16' | 'quarter' | 'semi' | 'third_place' | 'final'): number {
  if (stage === 'group') {
    return 5 // 3 (score) + 2 (bonus)
  }
  return 8 // 3 (score) + 2 (bonus) + 1 (extra time) + 1 (shootout) + 1 (winner)
}
