import { NextRequest, NextResponse } from 'next/server'

interface TestProviderRequest {
  providerId: string
}

async function testLMStudioConnection(): Promise<boolean> {
  try {
    const lmStudioHost = process.env.LM_STUDIO_HOST || 'localhost'
    const lmStudioPort = process.env.LM_STUDIO_PORT || '1234'
    const lmStudioUrl = `http://${lmStudioHost}:${lmStudioPort}/v1/models`
    
    console.log(`Testing LM Studio connection to: ${lmStudioUrl}`)
    
    const response = await fetch(lmStudioUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    if (!response.ok) {
      console.log(`LM Studio response not ok: ${response.status} ${response.statusText}`)
      return false
    }
    
    const data = await response.json()
    const hasModels = data.data && data.data.length > 0
    console.log(`LM Studio has ${data.data?.length || 0} models loaded`)
    return hasModels
  } catch (error) {
    console.error('LM Studio connection test failed:', error)
    return false
  }
}

async function testOpenRouterConnection(): Promise<boolean> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return false
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    return response.ok
  } catch (error) {
    console.error('OpenRouter connection test failed:', error)
    return false
  }
}

async function testAnthropicConnection(): Promise<boolean> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return false
  
  try {
    // Test with a minimal completion request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      }),
      signal: AbortSignal.timeout(10000)
    })
    
    // Even if the request fails due to billing/quota, a 400/401/403 means the API key is valid
    return response.ok || [400, 401, 403, 429].includes(response.status)
  } catch (error) {
    console.error('Anthropic connection test failed:', error)
    return false
  }
}

async function testOpenAIConnection(): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return false
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    })
    
    return response.ok
  } catch (error) {
    console.error('OpenAI connection test failed:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TestProviderRequest = await request.json()
    const { providerId } = body

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    let isConnected = false
    let details = ''

    switch (providerId) {
      case 'lmstudio':
        isConnected = await testLMStudioConnection()
        details = isConnected 
          ? 'LM Studio server is running with loaded model'
          : 'LM Studio server not reachable or no model loaded'
        break
        
      case 'openrouter':
        isConnected = await testOpenRouterConnection()
        details = isConnected
          ? 'OpenRouter API key is valid and service is accessible'
          : 'OpenRouter API key not configured or invalid'
        break
        
      case 'anthropic':
        isConnected = await testAnthropicConnection()
        details = isConnected
          ? 'Anthropic API key is valid and service is accessible'
          : 'Anthropic API key not configured or invalid'
        break
        
      case 'openai':
        isConnected = await testOpenAIConnection()
        details = isConnected
          ? 'OpenAI API key is valid and service is accessible'
          : 'OpenAI API key not configured or invalid'
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown provider ID' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: isConnected,
      providerId,
      details,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Provider test error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Get status of all providers
  try {
    const providers = ['lmstudio', 'openrouter', 'anthropic', 'openai']
    const results = await Promise.allSettled(
      providers.map(async (providerId) => {
        let isConnected = false
        
        switch (providerId) {
          case 'lmstudio':
            isConnected = await testLMStudioConnection()
            break
          case 'openrouter':
            isConnected = await testOpenRouterConnection()
            break
          case 'anthropic':
            isConnected = await testAnthropicConnection()
            break
          case 'openai':
            isConnected = await testOpenAIConnection()
            break
        }
        
        return { providerId, connected: isConnected }
      })
    )

    const providerStatus = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          providerId: providers[index],
          connected: false,
          error: result.reason?.message || 'Unknown error'
        }
      }
    })

    return NextResponse.json({
      success: true,
      providers: providerStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Provider status check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}