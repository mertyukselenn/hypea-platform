import { NextRequest, NextResponse } from "next/server"
import { discord } from "@/lib/discord"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')

    if (!serverId) {
      return NextResponse.json(
        { error: "Server ID is required" },
        { status: 400 }
      )
    }

    const widgetData = await discord.getServerWidget(serverId)

    if (!widgetData) {
      return NextResponse.json(
        { error: "Widget data not available. Make sure the Discord server has widget enabled." },
        { status: 404 }
      )
    }

    return NextResponse.json(widgetData)

  } catch (error) {
    console.error("Discord widget API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch Discord widget data" },
      { status: 500 }
    )
  }
}
