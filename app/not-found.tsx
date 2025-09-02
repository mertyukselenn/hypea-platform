import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-2">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go back
            </Link>
          </Button>
          
          <Button asChild variant="gradient">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
