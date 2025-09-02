"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { LoadingSpinner, LoadingPage } from "@/components/ui/loading"
import { useToast } from "@/components/ui/use-toast"
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [email, setEmail] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const token = searchParams.get("token")
  const emailParam = searchParams.get("email")

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }

    if (token) {
      verifyEmail()
    }
  }, [token, emailParam])

  async function verifyEmail() {
    setIsVerifying(true)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsVerified(true)
        toast({
          title: "Success",
          description: "Your email has been verified successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to verify email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify email",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  async function resendVerification() {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Verification email sent! Please check your inbox.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return <LoadingPage />
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="w-full max-w-md space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Email Verified!</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Your email address has been successfully verified
              </p>
            </div>

            <GlassCard className="p-6 text-center">
              <p className="text-muted-foreground mb-6">
                You can now access all features of your account.
              </p>
              
              <Button
                onClick={() => router.push("/auth/signin")}
                variant="gradient"
                className="w-full"
              >
                Continue to Sign In
              </Button>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Verify Your Email</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              We've sent a verification link to your email address
            </p>
            {email && (
              <p className="text-primary font-medium mt-1">{email}</p>
            )}
          </div>

          <GlassCard className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">
                  Didn't receive the email?
                </span>
              </div>
              
              <ul className="text-sm text-muted-foreground text-left space-y-1">
                <li>• Check your spam or junk mail folder</li>
                <li>• Make sure the email address is correct</li>
                <li>• Wait a few minutes for the email to arrive</li>
              </ul>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={resendVerification}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && <LoadingSpinner className="mr-2" />}
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </Button>

                <Button
                  onClick={() => router.push("/auth/signin")}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </GlassCard>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link href="/support" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
