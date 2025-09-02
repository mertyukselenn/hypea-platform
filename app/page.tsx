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
import { motion } from "framer-motion"

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
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built with Next.js 14 for optimal performance and user experience.",
    color: "text-yellow-600 dark:text-yellow-400"
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Support for multiple languages with internationalization built-in.",
    color: "text-indigo-600 dark:text-indigo-400"
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
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Modern Platform for
              <br />
              Community & Commerce
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Hypea combines community management with e-commerce in one powerful platform. 
              Build your community, sell your products, and manage everything from a single dashboard.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlassCard className="h-full p-6 hover:shadow-xl transition-shadow">
                  <feature.icon className={`h-12 w-12 mb-4 ${feature.color}`} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of communities and businesses already using Hypea to grow their success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link href="/contact">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Loved by Communities
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about Hypea
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Hypea has transformed how we manage our community and sell our products. 
                    The integration with Discord is seamless and the admin panel is incredibly powerful."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      U{i}
                    </div>
                    <div>
                      <div className="font-semibold">User {i}</div>
                      <div className="text-sm text-muted-foreground">Community Manager</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
