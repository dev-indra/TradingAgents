export async function GET() {
  try {
    // Check if MCP crypto server is available
    const response = await fetch('http://mcp-crypto:9000/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return Response.json({ 
        status: 'healthy', 
        message: 'MCP Crypto server is connected',
        server_response: data 
      })
    } else {
      return Response.json(
        { status: 'unhealthy', message: 'MCP Crypto server not responding' },
        { status: 503 }
      )
    }
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', message: 'Failed to connect to MCP Crypto server', error: String(error) },
      { status: 503 }
    )
  }
}