"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  glow?: boolean
}

export function GlassCard({ children, className, title, description, glow = false }: GlassCardProps) {
  return (
    <Card 
      className={cn(
        "glass-card transition-all duration-300 hover:shadow-2xl",
        glow && "animate-glow",
        className
      )}
      glass
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="gradient-text">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={title || description ? "" : "p-6"}>
        {children}
      </CardContent>
    </Card>
  )
}

export function GlassPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("glass rounded-xl p-6 shadow-xl", className)}>
      {children}
    </div>
  )
}
