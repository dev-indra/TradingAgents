export async function POST(request: Request) {
  try {
    const { symbol, days = 7 } = await request.json()
    
    if (!symbol) {
      return Response.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    // Convert symbols to CoinGecko IDs
    const symbolToId: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'AVAX': 'avalanche-2',
      'MATIC': 'matic-network',
      'DOGE': 'dogecoin',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'LINEA': 'linea',
      'LTC': 'litecoin'
    }

    const coinId = symbolToId[symbol.toUpperCase()] || symbol.toLowerCase()

    // Fetch historical price data from CoinGecko
    const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`
    
    const response = await fetch(coingeckoUrl, {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || ''
      }
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform data to match expected format
    const prices = data.prices?.map((price: [number, number]) => ({
      timestamp: price[0],
      price: price[1]
    })) || []

    return Response.json({
      success: true,
      symbol: symbol.toUpperCase(),
      coinId,
      days,
      prices,
      count: prices.length,
      timestamp: new Date().toISOString(),
      source: 'CoinGecko API'
    })

  } catch (error) {
    console.error('Error fetching price history:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch price history',
        details: String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const symbol = url.searchParams.get('symbol') || 'BTC'
  const days = parseInt(url.searchParams.get('days') || '7')
  
  const mockRequest = new Request('', {
    method: 'POST',
    body: JSON.stringify({ symbol, days })
  })
  
  return POST(mockRequest)
}