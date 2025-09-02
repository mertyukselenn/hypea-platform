import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { discord } from "@/lib/discord"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, userId } = body

    // Validate the request (you might want to add webhook signature verification)
    if (!type || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Process different webhook types
    switch (type) {
      case 'user_registered':
        await handleUserRegistration(data)
        break
      
      case 'order_completed':
        await handleOrderCompleted(data)
        break
      
      case 'form_submitted':
        await handleFormSubmission(data)
        break
      
      case 'audit_log':
        await handleAuditLog(data, userId)
        break
      
      default:
        console.warn(`Unknown webhook type: ${type}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Discord webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleUserRegistration(data: any) {
  try {
    await discord.sendUserRegistration({
      username: data.username || data.email,
      email: data.email,
      provider: data.provider || 'email'
    })

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        type: 'USER_REGISTERED',
        payload: JSON.stringify(data),
        status: 'DELIVERED'
      }
    })
  } catch (error) {
    console.error("Failed to send user registration webhook:", error)
    
    await prisma.webhookEvent.create({
      data: {
        type: 'USER_REGISTERED',
        payload: JSON.stringify(data),
        status: 'FAILED',
        response: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}

async function handleOrderCompleted(data: any) {
  try {
    await discord.sendOrderNotification({
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      total: data.total,
      items: data.items
    })

    await prisma.webhookEvent.create({
      data: {
        type: 'ORDER_COMPLETED',
        payload: JSON.stringify(data),
        status: 'DELIVERED'
      }
    })
  } catch (error) {
    console.error("Failed to send order webhook:", error)
    
    await prisma.webhookEvent.create({
      data: {
        type: 'ORDER_COMPLETED',
        payload: JSON.stringify(data),
        status: 'FAILED',
        response: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}

async function handleFormSubmission(data: any) {
  try {
    await discord.sendFormSubmission({
      formTitle: data.formTitle,
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail,
      fields: data.fields
    })

    await prisma.webhookEvent.create({
      data: {
        type: 'FORM_SUBMITTED',
        payload: JSON.stringify(data),
        status: 'DELIVERED'
      }
    })
  } catch (error) {
    console.error("Failed to send form submission webhook:", error)
    
    await prisma.webhookEvent.create({
      data: {
        type: 'FORM_SUBMITTED',
        payload: JSON.stringify(data),
        status: 'FAILED',
        response: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}

async function handleAuditLog(data: any, userId?: string) {
  try {
    await discord.sendAuditLog(
      data.action,
      data.user,
      data.details,
      data.metadata
    )

    await prisma.webhookEvent.create({
      data: {
        type: 'USER_REGISTERED', // This should be a more generic audit type
        payload: JSON.stringify(data),
        status: 'DELIVERED'
      }
    })
  } catch (error) {
    console.error("Failed to send audit log webhook:", error)
    
    await prisma.webhookEvent.create({
      data: {
        type: 'USER_REGISTERED', // This should be a more generic audit type
        payload: JSON.stringify(data),
        status: 'FAILED',
        response: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}
