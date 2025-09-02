import { MainLayout } from "@/components/layout/main-layout"
import { DiscordWidget } from "@/components/discord/discord-widget"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  MessageSquare, 
  Award, 
  Crown,
  Shield,
  Star,
  ExternalLink,
  Calendar,
  TrendingUp
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatRelativeTime } from "@/lib/utils"

async function getCommunityData() {
  const [teamTags, recentNews, stats] = await Promise.all([
    // Get team members with their tags
    prisma.userTeamTag.findMany({
      include: {
        user: {
          include: {
            profile: true
          }
        },
        teamTag: true
      },
      orderBy: {
        teamTag: {
          priority: 'desc'
        }
      }
    }),

    // Get recent news
    prisma.news.findMany({
      where: {
        status: 'PUBLISHED'
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 3
    }),

    // Get community stats
    Promise.all([
      prisma.user.count(),
      prisma.news.count({ where: { status: 'PUBLISHED' } }),
      prisma.userTeamTag.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } })
    ])
  ])

  const [totalUsers, totalNews, totalTeamMembers, totalOrders] = stats

  return {
    teamMembers: teamTags,
    recentNews,
    stats: {
      totalUsers,
      totalNews,
      totalTeamMembers,
      totalOrders
    }
  }
}

export default async function CommunityPage() {
  const data = await getCommunityData()

  const getRoleIcon = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'ceo':
        return <Crown className="h-4 w-4" />
      case 'staff-manager':
        return <Shield className="h-4 w-4" />
      case 'admin':
        return <Award className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
                Join Our Community
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect with fellow members, get support, and stay updated with the latest news and announcements
              </p>
              
              {/* Stats */}
              <div className="flex justify-center space-x-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.stats.totalUsers}+</div>
                  <div className="text-sm text-muted-foreground">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.stats.totalTeamMembers}</div>
                  <div className="text-sm text-muted-foreground">Staff</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.stats.totalNews}</div>
                  <div className="text-sm text-muted-foreground">Announcements</div>
                </div>
              </div>

              <Button variant="gradient" size="lg" asChild>
                <a href="#discord" className="scroll-smooth">
                  Join Discord Server
                  <ExternalLink className="h-5 w-5 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Team Members */}
              <section>
                <div className="flex items-center mb-6">
                  <Users className="h-6 w-6 mr-2" />
                  <h2 className="text-2xl font-bold">Meet Our Team</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.teamMembers.map((member) => (
                    <GlassCard key={member.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.user.profile?.avatar || undefined} />
                          <AvatarFallback>
                            {(member.user.profile?.displayName || member.user.email || 'U').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {member.user.profile?.displayName || member.user.profile?.username || 'Unknown'}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className="flex items-center gap-1"
                              style={{ 
                                borderColor: member.teamTag.color,
                                color: member.teamTag.color 
                              }}
                            >
                              {getRoleIcon(member.teamTag.name)}
                              {member.teamTag.displayName}
                            </Badge>
                          </div>
                          
                          {member.teamTag.description && (
                            <p className="text-sm text-muted-foreground">
                              {member.teamTag.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>

              {/* Recent News */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-6 w-6 mr-2" />
                    <h2 className="text-2xl font-bold">Latest News</h2>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="/news">View All</a>
                  </Button>
                </div>

                <div className="space-y-4">
                  {data.recentNews.map((news) => (
                    <GlassCard key={news.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                            <a href={`/news/${news.slug}`}>
                              {news.title}
                            </a>
                          </h3>
                          {news.excerpt && (
                            <p className="text-muted-foreground mb-3">
                              {news.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatRelativeTime(news.publishedAt || news.createdAt)}
                            </div>
                            {news.featured && (
                              <Badge variant="warning">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>

              {/* Community Guidelines */}
              <section>
                <GlassCard className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Community Guidelines
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <p>Be respectful and kind to all community members</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <p>No spam, self-promotion, or inappropriate content</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <p>Use appropriate channels for different topics</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <p>Follow Discord's Terms of Service and Community Guidelines</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <p>Report any issues to our moderation team</p>
                    </div>
                  </div>
                </GlassCard>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Discord Widget */}
              <section id="discord">
                <DiscordWidget 
                  serverId={process.env.DISCORD_SERVER_ID} 
                  variant="wide"
                />
              </section>

              {/* Community Stats */}
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Community Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Members</span>
                    <span className="font-medium">{data.stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Staff Members</span>
                    <span className="font-medium">{data.stats.totalTeamMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Announcements</span>
                    <span className="font-medium">{data.stats.totalNews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Orders Completed</span>
                    <span className="font-medium">{data.stats.totalOrders}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Quick Links */}
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="/support">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Support Center
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="/forms">
                      <Award className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="/store">
                      <Star className="h-4 w-4 mr-2" />
                      Browse Store
                    </a>
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
