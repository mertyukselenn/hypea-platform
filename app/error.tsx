'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Something went wrong!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              An unexpected error occurred. Please try again.
            </p>
          </div>

          {error.digest && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Error ID: {error.digest}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          
          <Button asChild variant="gradient">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
