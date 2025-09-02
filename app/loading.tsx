import { LoadingSpinner } from '@/components/ui/loading'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center space-y-4">
        <LoadingSpinner className="w-12 h-12 mx-auto" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
