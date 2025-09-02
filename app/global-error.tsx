'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Critical Error
                </h1>
                <p className="text-gray-600 mt-2">
                  A critical error occurred. Please refresh the page.
                </p>
              </div>

              {error.digest && (
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    Error ID: {error.digest}
                  </p>
                </div>
              )}
            </div>

            <Button onClick={reset} variant="outline" className="flex items-center gap-2 mx-auto">
              <RefreshCw className="w-4 h-4" />
              Refresh page
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
