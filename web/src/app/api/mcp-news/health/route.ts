import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if the MCP News service is running
    const mcpNewsUrl = process.env.MCP_NEWS_URL || 'http://localhost:9001'
    
    const response = await fetch(`${mcpNewsUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      return NextResponse.json({ status: 'healthy', service: 'mcp-news' })
    } else {
      return NextResponse.json(
        { status: 'unhealthy', service: 'mcp-news', error: 'Service not responding' },
        { status: 503 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', service: 'mcp-news', error: (error as Error).message },
      { status: 503 }
    )
  }
}