import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: {
          startsWith: "reset_"
        },
        expires: {
          gt: new Date()
        }
      }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }

    // Extract email from identifier
    const email = resetToken.identifier.replace("reset_", "")

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: user.status === 'PENDING_VERIFICATION' ? 'ACTIVE' : user.status, // Activate account if verifying via password reset
        emailVerified: user.emailVerified || new Date() // Mark email as verified
      }
    })

    // Delete the used reset token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: resetToken.identifier,
          token: resetToken.token
        }
      }
    })

    // Delete any other reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: resetToken.identifier
      }
    })

    // Log password reset
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_CHANGE',
        resource: 'User',
        resourceId: user.id,
        metadata: JSON.stringify({
          type: 'reset_completed',
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: "Password reset successfully"
    })

  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
