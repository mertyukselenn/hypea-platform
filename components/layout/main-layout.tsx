"use client"

import { ReactNode } from "react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
// import { motion } from "framer-motion" // Disabled for server compatibility

interface MainLayoutProps {
  children: ReactNode
  showFooter?: boolean
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  )
}
