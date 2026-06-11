import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 px-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Sports Pundits' World Cup
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold text-green-300 mb-8">
          Primetime Predict Ace
        </h2>
        
        <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto">
          Predict. Compete. Climb the Rankings. Become the Predict Ace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-white text-green-800 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors text-lg"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-green-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors text-lg border-2 border-green-500"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Private Leagues</h3>
            <p className="text-green-200">Compete with friends, family, and colleagues in private leagues.</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Real-time Rankings</h3>
            <p className="text-green-200">Live leaderboards that update instantly as matches conclude.</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Bonus Predictions</h3>
            <p className="text-green-200">Earn extra points with penalty and red card predictions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
