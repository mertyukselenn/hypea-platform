import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateRandomString } from "@/lib/utils"
import { mailer } from "@/lib/mailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true }
    })

    // Always return success to prevent email enumeration
    // but only send email if user exists
    if (user && user.passwordHash) { // Only for users with password (not OAuth only)
      // Delete any existing reset tokens for this user
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: `reset_${email.toLowerCase()}`
        }
      })

      // Generate new reset token
      const resetToken = generateRandomString(32)
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token
      await prisma.verificationToken.create({
        data: {
          identifier: `reset_${email.toLowerCase()}`,
          token: resetToken,
          expires: resetExpires,
        }
      })

      // Send reset email
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
      
      try {
        await mailer.sendPasswordResetEmail(
          email,
          user.profile?.displayName || user.profile?.username || email,
          resetUrl
        )
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError)
        // Don't expose email sending errors to prevent information disclosure
      }

      // Log password reset request
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_CHANGE',
          resource: 'User',
          resourceId: user.id,
          metadata: JSON.stringify({
            type: 'reset_requested',
          }),
          ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    }

    // Always return success
    return NextResponse.json({
      message: "If an account with that email exists, we've sent password reset instructions"
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
