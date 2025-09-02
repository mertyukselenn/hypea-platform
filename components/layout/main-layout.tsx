"use client"

import { ReactNode } from "react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
import { motion } from "framer-motion"

interface MainLayoutProps {
  children: ReactNode
  showFooter?: boolean
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <motion.main 
        className="flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
      
      {showFooter && <Footer />}
    </div>
  )
}
