'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function MatchDetailPage() {
  const [match, setMatch] = useState<any>(null)
  const [leagues, setLeagues] = useState<any[]>([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [bonusType, setBonusType] = useState<'penalty' | 'red_card'>('penalty')
  const [bonusPrediction, setBonusPrediction] = useState<'yes' | 'no'>('yes')
  const [extraTime, setExtraTime] = useState<'yes' | 'no' | ''>('')
  const [penaltyShootout, setPenaltyShootout] = useState<'yes' | 'no' | ''>('')
  const [eventualWinner, setEventualWinner] = useState<'home' | 'away' | ''>('')
  const [existingPrediction, setExistingPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchMatch()
    fetchUserLeagues()
  }, [params.id])

  const fetchMatch = async () => {
    const { data } = await supabase.from('matches').select('*').eq('id', params.id).single()
    setMatch(data)
  }

  const fetchUserLeagues = async () => {
    // Use global league only
    const globalLeagueId = '00000000-0000-0000-0000-000000000001'
    setSelectedLeague(globalLeagueId)
    fetchExistingPrediction(globalLeagueId)
  }

  const fetchExistingPrediction = async (leagueId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('match_id', params.id)
      .eq('user_id', user.id)
      .eq('league_id', leagueId)
      .single()

    setExistingPrediction(data)
    if (data) {
      setHomeScore(data.home_score.toString())
      setAwayScore(data.away_score.toString())
      setBonusType(data.bonus_type)
      setBonusPrediction(data.bonus_prediction ? 'yes' : 'no')
      if (match?.stage !== 'group') {
        setExtraTime(data.extra_time_prediction ? 'yes' : 'no')
        setPenaltyShootout(data.penalty_shootout_prediction ? 'yes' : 'no')
        setEventualWinner(data.eventual_winner || '')
      }
    }
  }

  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId)
    fetchExistingPrediction(leagueId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!selectedLeague) throw new Error('Please select a league')

      // Validate knockout predictions
      if (match?.stage !== 'group') {
        if (!extraTime) throw new Error('Extra Time prediction is required for knockout matches')
        if (!penaltyShootout) throw new Error('Penalty Shootout prediction is required for knockout matches')
        if (!eventualWinner) throw new Error('Eventual Winner prediction is required for knockout matches')
      }

      const predictionData: any = {
        match_id: params.id,
        user_id: user.id,
        league_id: selectedLeague,
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
        bonus_type: bonusType,
        bonus_prediction: bonusPrediction === 'yes',
      }

      // Add knockout predictions if applicable
      if (match?.stage !== 'group') {
        predictionData.extra_time_prediction = extraTime === 'yes'
        predictionData.penalty_shootout_prediction = penaltyShootout === 'yes'
        predictionData.eventual_winner = eventualWinner
      }

      if (existingPrediction) {
        const { error } = await supabase
          .from('predictions')
          .update(predictionData)
          .eq('id', existingPrediction.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('predictions').insert(predictionData)

        if (error) throw error
      }

      router.push('/matches')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!match) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  const isKnockout = match.stage !== 'group'
  const windowOpen = new Date(match.prediction_window_open) <= new Date()
  const windowClosed = new Date(match.prediction_window_close) <= new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Match Prediction</h1>
            <a
              href="/matches"
              className="text-green-200 hover:text-white transition-colors"
            >
              ← Back to Matches
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              {match.home_team} vs {match.away_team}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-gray-600">
              <p>Stage: {match.stage}</p>
              <p>
                {new Date(match.kickoff_time).toLocaleDateString()} at{' '}
                {new Date(match.kickoff_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {match.venue && <p>Venue: {match.venue}</p>}
              <div className="pt-2 border-t">
                {!windowOpen && (
                  <p className="text-orange-600 font-medium">
                    Predictions open {new Date(match.prediction_window_open).toLocaleString()}
                  </p>
                )}
                {windowClosed && (
                  <p className="text-red-600 font-medium">
                    Predictions closed - deadline passed
                  </p>
                )}
                {windowOpen && !windowClosed && (
                  <p className="text-green-600 font-medium">
                    Predictions open until {new Date(match.prediction_window_close).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {windowOpen && !windowClosed && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {match.home_team} Score *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {match.away_team} Score *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bonus Prediction *
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Choose ONE bonus prediction (either penalty OR red card)</p>
                  <Select value={bonusType} onValueChange={(value: any) => setBonusType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="penalty">Penalty in Match?</SelectItem>
                      <SelectItem value="red_card">Red Card in Match?</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2">
                    <Select
                      value={bonusPrediction}
                      onValueChange={(value: any) => setBonusPrediction(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isKnockout && (
                  <>
                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                      <p className="font-medium mb-1">Knockout Stage Rules:</p>
                      <p>Score predictions are based on 90-minute result only (extra time and penalties don't affect score prediction).</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra Time? *
                      </label>
                      <Select value={extraTime} onValueChange={(value: any) => setExtraTime(value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Penalty Shootout? *
                      </label>
                      <Select
                        value={penaltyShootout}
                        onValueChange={(value: any) => setPenaltyShootout(value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Eventual Winner *
                      </label>
                      <Select value={eventualWinner} onValueChange={(value: any) => setEventualWinner(value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">{match.home_team}</SelectItem>
                          <SelectItem value="away">{match.away_team}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Submitting...' : existingPrediction ? 'Update Prediction' : 'Submit Prediction'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {!windowOpen && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Predictions are not yet open for this match</p>
            </CardContent>
          </Card>
        )}

        {windowClosed && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">The prediction window has closed for this match</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
