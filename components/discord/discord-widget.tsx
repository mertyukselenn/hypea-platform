"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  UserCheck, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Loader2
} from "lucide-react"

interface DiscordMember {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  status: string
  game?: {
    name: string
  }
}

interface DiscordWidgetData {
  id: string
  name: string
  instant_invite: string | null
  channels: Array<{
    id: string
    name: string
    position: number
  }>
  members: DiscordMember[]
  presence_count: number
}

interface DiscordWidgetProps {
  serverId?: string
  variant?: "small" | "wide"
  className?: string
}

export function DiscordWidget({ serverId, variant = "wide", className }: DiscordWidgetProps) {
  const [widgetData, setWidgetData] = useState<DiscordWidgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWidgetData = async () => {
      if (!serverId) {
        setError("No server ID provided")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/discord/widget?serverId=${serverId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch Discord widget data")
        }
        
        const data = await response.json()
        setWidgetData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchWidgetData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchWidgetData, 30000)
    return () => clearInterval(interval)
  }, [serverId])

  if (loading) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading Discord widget...
        </div>
      </GlassCard>
    )
  }

  if (error || !widgetData) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="font-medium mb-2">Discord Widget Unavailable</h3>
          <p className="text-sm text-muted-foreground">
            {error || "Unable to load Discord server information"}
          </p>
        </div>
      </GlassCard>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'dnd':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'idle':
        return 'Away'
      case 'dnd':
        return 'Do Not Disturb'
      default:
        return 'Offline'
    }
  }

  if (variant === "small") {
    return (
      <GlassCard className={`p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-sm">{widgetData.name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {widgetData.presence_count} online
          </Badge>
        </div>
        
        <div className="flex -space-x-2 mb-3">
          {widgetData.members.slice(0, 5).map((member) => (
            <div key={member.id} className="relative">
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarImage 
                  src={member.avatar ? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png` : undefined}
                />
                <AvatarFallback className="text-xs">
                  {member.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background ${getStatusColor(member.status)}`}></div>
            </div>
          ))}
          {widgetData.members.length > 5 && (
            <div className="w-6 h-6 bg-muted rounded-full border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium">+{widgetData.members.length - 5}</span>
            </div>
          )}
        </div>

        {widgetData.instant_invite && (
          <Button size="sm" variant="gradient" className="w-full" asChild>
            <a href={widgetData.instant_invite} target="_blank" rel="noopener noreferrer">
              Join Server
              <ExternalLink className="h-3 w-3 ml-2" />
            </a>
          </Button>
        )}
      </GlassCard>
    )
  }

  return (
    <GlassCard className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <h3 className="font-semibold">{widgetData.name}</h3>
            <p className="text-sm text-muted-foreground">Discord Server</p>
          </div>
        </div>
        <Badge variant="success">
          <Users className="h-3 w-3 mr-1" />
          {widgetData.presence_count} online
        </Badge>
      </div>

      {/* Voice Channels */}
      {widgetData.channels.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-sm mb-3 flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Voice Channels
          </h4>
          <div className="space-y-2">
            {widgetData.channels.slice(0, 3).map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-sm"># {channel.name}</span>
                <div className="flex items-center gap-1">
                  <VolumeX className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">0/∞</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Members */}
      <div className="mb-6">
        <h4 className="font-medium text-sm mb-3 flex items-center">
          <UserCheck className="h-4 w-4 mr-2" />
          Online Members ({widgetData.members.length})
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {widgetData.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={member.avatar ? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png` : undefined}
                  />
                  <AvatarFallback className="text-xs">
                    {member.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {member.username}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {getStatusLabel(member.status)}
                  </Badge>
                </div>
                {member.game && (
                  <p className="text-xs text-muted-foreground truncate">
                    Playing {member.game.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Button */}
      {widgetData.instant_invite && (
        <Button variant="gradient" className="w-full" asChild>
          <a href={widgetData.instant_invite} target="_blank" rel="noopener noreferrer">
            Join Our Discord Server
            <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </Button>
      )}
    </GlassCard>
  )
}
