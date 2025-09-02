"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  FileText,
  MessageSquare,
  Settings,
  Palette,
  Webhook,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react"

interface AdminSidebarProps {
  className?: string
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    name: 'Licenses',
    href: '/admin/licenses',
    icon: Shield,
  },
  {
    name: 'News',
    href: '/admin/news',
    icon: FileText,
  },
  {
    name: 'Forms',
    href: '/admin/forms',
    icon: MessageSquare,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Theme',
    href: '/admin/theme',
    icon: Palette,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    name: 'Webhooks',
    href: '/admin/webhooks',
    icon: Webhook,
  },
]

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex flex-col h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-r border-white/20 dark:border-gray-800/20 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-800/10">
        {!collapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="ml-2 text-lg font-bold gradient-text">
              Admin
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}>
                <item.icon className={cn(
                  "h-5 w-5",
                  collapsed ? "mx-auto" : "mr-3"
                )} />
                {!collapsed && <span>{item.name}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 dark:border-gray-800/10">
        <Link href="/">
          <div className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}>
            <Home className={cn(
              "h-5 w-5",
              collapsed ? "mx-auto" : "mr-3"
            )} />
            {!collapsed && <span>Back to Site</span>}
          </div>
        </Link>
      </div>
    </div>
  )
}
