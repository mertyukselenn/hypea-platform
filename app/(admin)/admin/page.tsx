import { prisma } from "@/lib/prisma"
import { GlassCard } from "@/components/ui/glass-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  ShoppingBag, 
  Package, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock
} from "lucide-react"
import { formatPrice, formatRelativeTime } from "@/lib/utils"

async function getDashboardData() {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue,
    recentUsers,
    recentOrders,
    userStats,
    orderStats
  ] = await Promise.all([
    // Total counts
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'COMPLETED' }
    }),
    
    // Recent data
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { profile: true }
    }),
    
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { include: { profile: true } } }
    }),

    // Stats for this month vs last month
    prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        }
      }
    }),

    prisma.order.groupBy({
      by: ['createdAt'],
      _count: true,
      _sum: { total: true },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        },
        status: 'COMPLETED'
      }
    })
  ])

  return {
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue._sum.total || 0
    },
    recentUsers,
    recentOrders,
    userStats,
    orderStats
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const statCards = [
    {
      title: "Total Users",
      value: data.stats.totalUsers.toLocaleString(),
      description: "Registered users",
      icon: Users,
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Total Orders",
      value: data.stats.totalOrders.toLocaleString(),
      description: "All time orders",
      icon: ShoppingBag,
      trend: "+8%",
      trendUp: true
    },
    {
      title: "Products",
      value: data.stats.totalProducts.toLocaleString(),
      description: "Active products",
      icon: Package,
      trend: "+3%",
      trendUp: true
    },
    {
      title: "Revenue",
      value: formatPrice(Number(data.stats.totalRevenue)),
      description: "Total revenue",
      icon: DollarSign,
      trend: "+15%",
      trendUp: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <GlassCard key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{stat.description}</span>
                <div className="flex items-center">
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trendUp ? "text-green-500" : "text-red-500"}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Users
            </CardTitle>
            <CardDescription>
              Latest user registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.profile?.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.profile?.displayName || user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {user.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>

        {/* Recent Orders */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest order activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      #
                    </div>
                    <div>
                      <p className="font-medium">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.user.profile?.displayName || order.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(Number(order.total))}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          order.status === 'COMPLETED' ? 'success' : 
                          order.status === 'PENDING' ? 'warning' : 
                          'destructive'
                        }
                      >
                        {order.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Users className="h-8 w-8 mb-2 text-blue-500" />
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm text-muted-foreground">
                View and manage user accounts
              </p>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Package className="h-8 w-8 mb-2 text-green-500" />
              <h3 className="font-medium">Add Product</h3>
              <p className="text-sm text-muted-foreground">
                Create new products for sale
              </p>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Clock className="h-8 w-8 mb-2 text-orange-500" />
              <h3 className="font-medium">View Orders</h3>
              <p className="text-sm text-muted-foreground">
                Process pending orders
              </p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  )
}
