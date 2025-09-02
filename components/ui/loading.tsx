"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function Loading({ size = "md", text, className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-muted"></div>
        <div className="space-y-2">
          <div className="h-4 w-[250px] animate-pulse rounded bg-muted"></div>
          <div className="h-4 w-[200px] animate-pulse rounded bg-muted"></div>
        </div>
      </div>
    </div>
  )
}
