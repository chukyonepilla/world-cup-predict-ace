import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UpdateResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    redirect('/dashboard')
  }

  // Trigger the update
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/update-results`, {
    method: 'POST',
  })

  const result = await response.json()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Update Match Results</h1>
              <p className="text-green-200 text-sm md:text-base">Auto-update from Football-Data.org</p>
            </div>
            <Link
              href="/dashboard"
              className="text-green-200 hover:text-white transition-colors text-sm md:text-base"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <Card>
          <CardHeader>
            <CardTitle>Update Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                  <p className="font-medium">{result.message}</p>
                </div>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Update Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                  <p className="font-medium">Error: {result.error || result.message}</p>
                  {result.error?.includes('FOOTBALL_DATA_API_KEY') && (
                    <p className="text-sm mt-2">
                      Please add FOOTBALL_DATA_API_KEY to Vercel environment variables.
                      Get a free key from <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer" className="underline">football-data.org</a>
                    </p>
                  )}
                </div>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Setup Automatic Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Option 1: Free Cron Service</h3>
              <p className="text-sm text-gray-600 mb-2">
                Use a free service like cron-job.org to call this endpoint automatically:
              </p>
              <code className="block bg-gray-100 p-3 rounded text-sm">
                POST {process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/api/update-results
              </code>
              <p className="text-sm text-gray-600 mt-2">
                Schedule: Every 30 minutes during World Cup
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Option 2: Manual Updates</h3>
              <p className="text-sm text-gray-600">
                Visit this page periodically to manually trigger updates
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
