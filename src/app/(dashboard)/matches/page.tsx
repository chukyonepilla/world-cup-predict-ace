import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const GLOBAL_LEAGUE_ID = '00000000-0000-0000-0000-000000000001'

// Country flag mapping using emoji flags
const countryFlags: Record<string, string> = {
  'Mexico': '🇲🇽',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  'Czechia': '🇨🇿',
  'Canada': '🇨🇦',
  'Bosnia and Herzegovina': '🇧🇦',
  'Qatar': '🇶🇦',
  'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷',
  'Morocco': '🇲🇦',
  'Haiti': '🇭🇹',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA': '🇺🇸',
  'Paraguay': '🇵🇾',
  'Australia': '🇦🇺',
  'Turkiye': '🇹🇷',
  'Germany': '🇩🇪',
  'Curacao': '🇨🇼',
  'Ivory Coast': '🇨🇮',
  'Ecuador': '🇪🇨',
  'Netherlands': '🇳🇱',
  'Japan': '🇯🇵',
  'Sweden': '🇸🇪',
  'Tunisia': '🇹🇳',
  'Argentina': '🇦🇷',
  'Nigeria': '🇳🇬',
  'Costa Rica': '🇨🇷',
  'Ghana': '🇬🇭',
  'Portugal': '🇵🇹',
  'Uruguay': '🇺🇾',
  'Egypt': '🇪🇬',
  'Panama': '🇵🇦',
  'Spain': '🇪🇸',
  'Croatia': '🇭🇷',
  'Italy': '🇮🇹',
  'Albania': '🇦🇱',
  'New Zealand': '🇳🇿',
  'France': '🇫🇷',
  'Poland': '🇵🇱',
  'Saudi Arabia': '🇸🇦',
  'Denmark': '🇩🇰',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Serbia': '🇷🇸',
  'Belgium': '🇧🇪',
  'Senegal': '🇸🇳',
  'Jamaica': '🇯🇲',
  'TBD': '❓',
}

// Random football facts about countries
const footballFacts: Record<string, string[]> = {
  'Mexico': ['Mexico has hosted the World Cup twice (1970, 1986)', 'Mexico is the most successful CONCACAF nation in World Cup history'],
  'South Africa': ['South Africa became the first African nation to host the World Cup in 2010', 'South Africa made their World Cup debut in 1998'],
  'South Korea': ['South Korea reached the semifinals in 2002, co-hosting with Japan', 'South Korea has qualified for 10 consecutive World Cups'],
  'Czechia': ['Czechoslovakia finished runners-up in 1934 and 1962', 'Czechia made their first World Cup appearance as an independent nation in 2006'],
  'Canada': ['Canada hosted the 1986 World Cup without winning a match', 'Canada qualified for their first World Cup in 36 years in 2022'],
  'Bosnia and Herzegovina': ['Bosnia made their World Cup debut in 2014', 'Edin Dzeko is Bosnia\'s all-time top scorer'],
  'Qatar': ['Qatar became the first Arab nation to host the World Cup in 2022', 'Qatar is the smallest country to ever host the World Cup'],
  'Switzerland': ['Switzerland reached the quarterfinals three times (1934, 1938, 1954)', 'Switzerland has never lost a World Cup opening match'],
  'Brazil': ['Brazil is the only nation to have played in every World Cup', 'Brazil has won the World Cup a record 5 times'],
  'Morocco': ['Morocco became the first African nation to reach the World Cup semifinals in 2022', 'Morocco won the African Nations Cup in 1976'],
  'Haiti': ['Haiti made their only World Cup appearance in 1974', 'Haiti is the first Caribbean nation to qualify for the World Cup'],
  'Scotland': ['Scotland has qualified for 8 World Cups but never advanced past the group stage', 'Scotland beat the Netherlands 3-2 in 1978, their only World Cup win'],
  'USA': ['USA hosted the World Cup in 1994', 'USA reached the quarterfinals in 2002, their best performance'],
  'Paraguay': ['Paraguay reached the round of 16 three times (1986, 1998, 2002)', 'Paraguay has never missed a World Cup since 1998 until 2018'],
  'Australia': ['Australia reached the round of 16 in 2006', 'Australia holds the record for largest World Cup victory (31-0 vs American Samoa in 2001 qualifiers)'],
  'Turkiye': ['Turkiye finished third in 2002, their best World Cup performance', 'Turkiye has qualified for 2 World Cups'],
  'Germany': ['Germany has won the World Cup 4 times', 'Germany has reached the semifinals 13 times, the most of any nation'],
  'Curacao': ['Curacao is the smallest nation to ever qualify for the Gold Cup', 'Curacao\'s best World Cup finish was reaching the final qualifying round in 2018'],
  'Ivory Coast': ['Ivory Coast has qualified for 3 World Cups', 'Didier Drogba is Ivory Coast\'s all-time top scorer'],
  'Ecuador': ['Ecuador reached the round of 16 in 2006', 'Ecuador has never lost a World Cup opening match'],
  'Netherlands': ['Netherlands has finished runners-up 3 times (1974, 1978, 2010)', 'Netherlands has the highest World Cup win percentage among teams with no titles'],
  'Japan': ['Japan has qualified for 7 consecutive World Cups', 'Japan co-hosted the 2002 World Cup with South Korea'],
  'Sweden': ['Sweden finished second in 1958, their best World Cup performance', 'Sweden has reached the World Cup quarterfinals 5 times'],
  'Tunisia': ['Tunisia beat Mexico 3-1 in 1978, the first African World Cup victory', 'Tunisia has qualified for 6 World Cups'],
  'Argentina': ['Argentina has won the World Cup 3 times', 'Lionel Messi is Argentina\'s all-time top scorer'],
  'Nigeria': ['Nigeria has reached the round of 16 twice (1994, 1998)', 'Nigeria has won the African Nations Cup 3 times'],
  'Costa Rica': ['Costa Rica reached the quarterfinals in 2014, their best performance', 'Costa Rica conceded the fewest goals in 2014 group stage'],
  'Ghana': ['Ghana reached the quarterfinals in 2010', 'Ghana is the only African nation to reach the quarterfinals in the 21st century'],
  'Portugal': ['Portugal won their first World Cup in 2016', 'Cristiano Ronaldo is Portugal\'s all-time top scorer'],
  'Uruguay': ['Uruguay won the first two World Cups (1930, 1950)', 'Uruguay has 4 World Cup titles, tied with Argentina'],
  'Egypt': ['Egypt has qualified for 3 World Cups, all in the 20th century', 'Egypt has won the African Nations Cup a record 7 times'],
  'Panama': ['Panama made their World Cup debut in 2018', 'Panama scored 2 goals in their first World Cup'],
  'Spain': ['Spain won the World Cup in 2010', 'Spain has the most consecutive World Cup appearances (15)'],
  'Croatia': ['Croatia finished second in 2018, their best World Cup performance', 'Croatia has reached the World Cup semifinals twice'],
  'Italy': ['Italy has won the World Cup 4 times', 'Italy has the most World Cup matches played (83)'],
  'Albania': ['Albania made their World Cup debut in 2016', 'Albania has never won a World Cup match'],
  'New Zealand': ['New Zealand has qualified for 2 World Cups', 'New Zealand is the only OFC nation to remain unbeaten in a World Cup (2010)'],
  'France': ['France has won the World Cup 2 times', 'France hosted the World Cup in 1938 and 1998'],
  'Poland': ['Poland finished third twice (1974, 1982)', 'Poland has the most World Cup appearances without winning (8)'],
  'Saudi Arabia': ['Saudi Arabia reached the round of 16 in 1994', 'Saudi Arabia beat Argentina 2-1 in 2022, one of the biggest World Cup upsets'],
  'Denmark': ['Denmark reached the quarterfinals in 1998', 'Denmark won the European Championship in 1992'],
  'England': ['England won the World Cup in 1966', 'England has the most World Cup matches without winning (8)'],
  'Serbia': ['Serbia reached the round of 16 as Yugoslavia in 1998', 'Serbia has never advanced past the group stage as an independent nation'],
  'Belgium': ['Belgium finished third in 2018, their best World Cup performance', 'Belgium has the most World Cup appearances without winning (13)'],
  'Senegal': ['Senegal reached the quarterfinals in 2002', 'Senegal beat defending champions France in their 2002 debut'],
  'Jamaica': ['Jamaica made their World Cup debut in 1998', 'Jamaica is the first Caribbean nation to reach the World Cup'],
}

function getCountryFlag(country: string): string {
  return countryFlags[country] || '🏳️'
}

function getRandomFootballFact(country: string): string {
  const facts = footballFacts[country]
  if (!facts || facts.length === 0) {
    return `${country} has a rich football history`
  }
  return facts[Math.floor(Math.random() * facts.length)]
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch upcoming matches (kickoff between 30 mins and 24 hours from now)
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .gt('kickoff_time', new Date(Date.now() + 30 * 60 * 1000).toISOString())
    .lte('kickoff_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    .order('kickoff_time', { ascending: true })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Matches</h1>
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Matches</h2>
          <p className="text-gray-600">Predict scores before the deadline</p>
        </div>

        {matches && matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match: any) => {
              const timeUntilKickoff = new Date(match.kickoff_time).getTime() - new Date().getTime()
              const minutesUntilKickoff = Math.floor(timeUntilKickoff / (1000 * 60))
              const hoursUntilKickoff = Math.floor(minutesUntilKickoff / 60)
              const homeFlag = getCountryFlag(match.home_team)
              const awayFlag = getCountryFlag(match.away_team)
              const homeFact = getRandomFootballFact(match.home_team)
              const awayFact = getRandomFootballFact(match.away_team)

              return (
                <Card key={match.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-700 to-green-800 text-white pb-3">
                    <CardTitle className="text-lg md:text-xl font-bold flex items-center justify-between">
                      <span className="truncate">
                        {homeFlag} {match.home_team}
                      </span>
                      <span className="text-green-200 text-sm">vs</span>
                      <span className="truncate">
                        {awayFlag} {match.away_team}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs md:text-sm text-gray-600">
                      <span className="capitalize font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                        {match.stage === 'round_of_32' ? 'Round of 32' :
                         match.stage === 'round16' ? 'Round of 16' :
                         match.stage === 'quarter' ? 'Quarterfinal' :
                         match.stage === 'semi' ? 'Semifinal' :
                         match.stage === 'third_place' ? 'Third Place' :
                         match.stage.replace('_', ' ')}
                      </span>
                      {match.group_label && <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">Group {match.group_label}</span>}
                    </div>
                    
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {new Date(match.kickoff_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(match.kickoff_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {match.venue && (
                      <div className="text-xs text-gray-500 flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-2">{match.venue}</span>
                      </div>
                    )}

                    {(match.home_team === 'TBD' || match.away_team === 'TBD') && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Teams to be determined
                      </div>
                    )}

                    {/* Football Facts Section */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 space-y-2 border border-amber-200">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{homeFlag}</span>
                        <p className="text-xs text-gray-700 italic leading-relaxed">{homeFact}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{awayFlag}</span>
                        <p className="text-xs text-gray-700 italic leading-relaxed">{awayFact}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {hoursUntilKickoff > 0
                          ? `Kickoff in ${hoursUntilKickoff}h ${minutesUntilKickoff % 60}m`
                          : `Kickoff in ${minutesUntilKickoff}m`}
                      </div>
                      <Link
                        href={`/matches/${match.id}`}
                        className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm md:text-base"
                      >
                        Make Prediction
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No matches available for prediction</p>
              <p className="text-sm text-gray-500">All matches have either started or prediction windows have closed</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
