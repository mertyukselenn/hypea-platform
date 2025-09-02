"use client"

import Link from "next/link"
import { Heart, Github, Twitter, Discord } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Platform: [
      { name: 'Home', href: '/' },
      { name: 'News', href: '/news' },
      { name: 'Store', href: '/store' },
      { name: 'Community', href: '/community' },
    ],
    Account: [
      { name: 'Sign In', href: '/auth/signin' },
      { name: 'Sign Up', href: '/auth/signup' },
      { name: 'My Account', href: '/account' },
      { name: 'Orders', href: '/account/orders' },
    ],
    Support: [
      { name: 'Help Center', href: '/support' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Documentation', href: '/docs' },
      { name: 'Status', href: '/status' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/legal/privacy' },
      { name: 'Terms of Service', href: '/legal/terms' },
      { name: 'Cookie Policy', href: '/legal/cookies' },
      { name: 'Refund Policy', href: '/legal/refunds' },
    ],
  }

  const socialLinks = [
    { name: 'Discord', href: '#', icon: Discord },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'GitHub', href: '#', icon: Github },
  ]

  return (
    <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200/20 dark:border-gray-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="ml-2 text-xl font-bold gradient-text">
                Hypea
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              A modern platform combining community features with an integrated store.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Links sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200/20 dark:border-gray-800/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Hypea Platform. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center mt-4 md:mt-0">
              Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by the Hypea team
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
