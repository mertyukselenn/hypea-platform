import { MainLayout } from "@/components/layout/main-layout"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  Shield,
  Zap,
  Globe,
  Heart,
  ArrowRight,
  Star,
  TrendingUp,
  Award
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Community First",
    description: "Build and engage with your community using modern tools and Discord integration.",
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    icon: ShoppingBag,
    title: "Integrated Store",
    description: "Sell digital products, licenses, and services with automated delivery.",
    color: "text-green-600 dark:text-green-400"
  },
  {
    icon: MessageSquare,
    title: "Custom Forms",
    description: "Create powerful forms with Discord notifications and automated workflows.",
    color: "text-purple-600 dark:text-purple-400"
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Enterprise-grade security with role-based access control and audit logging.",
    color: "text-orange-600 dark:text-orange-400"
  }
]

const stats = [
  { label: "Active Users", value: "10K+", icon: Users },
  { label: "Products Sold", value: "50K+", icon: ShoppingBag },
  { label: "Communities", value: "500+", icon: Heart },
  { label: "Uptime", value: "99.9%", icon: TrendingUp },
]

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text mb-6">
              Modern Platform for
              <br />
              Community & Commerce
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Hypea combines community management with e-commerce in one powerful platform. 
              Build your community, sell your products, and manage everything from a single dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="gradient" asChild>
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/store">
                  Explore Store
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you build, manage, and grow your community and business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title}>
                <GlassCard className="h-full p-6 hover:shadow-xl transition-shadow">
                  <feature.icon className={`h-12 w-12 mb-4 ${feature.color}`} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Message */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🎉 Platform Successfully Installed!
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Your Hypea Platform is now running with all core features ready to use.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">✅ Installed Features</h3>
                <ul className="text-white/90 space-y-2">
                  <li>• Next.js 14 + TypeScript</li>
                  <li>• MySQL Database + Prisma ORM</li>
                  <li>• NextAuth Authentication</li>
                  <li>• Admin Panel + User Management</li>
                  <li>• E-commerce Store System</li>
                  <li>• Discord Integration</li>
                  <li>• Email System (SMTP)</li>
                  <li>• Modern UI with Glassmorphism</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🔑 Admin Access</h3>
                <div className="text-white/90 space-y-2">
                  <p><strong>Admin Panel:</strong> <a href="/admin" className="text-yellow-300 hover:underline">/admin</a></p>
                  <p><strong>Email:</strong> admin@hypea.com</p>
                  <p><strong>Password:</strong> admin123</p>
                  <hr className="my-4 border-white/20" />
                  <p className="text-sm">⚠️ Change default password immediately!</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/admin">
                  Access Admin Panel
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}