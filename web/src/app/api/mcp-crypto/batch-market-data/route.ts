export async function POST(request: Request) {
  try {
    const { symbols } = await request.json()
    
    if (!symbols || !Array.isArray(symbols)) {
      return Response.json(
        { error: 'Invalid symbols array' },
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

    const coinIds = symbols.map((symbol: string) => 
      symbolToId[symbol.toUpperCase()] || symbol.toLowerCase()
    ).join(',')

    // Fetch from CoinGecko with your API key
    const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
    
    const response = await fetch(coingeckoUrl, {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || ''
      }
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform the data to match our expected format
    const marketData: Record<string, any> = {}
    
    data.forEach((coin: any) => {
      const symbol = coin.symbol.toUpperCase()
      marketData[symbol] = {
        symbol,
        name: coin.name,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap_rank: coin.market_cap_rank,
        image: coin.image,
        last_updated: coin.last_updated,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply
      }
    })

    return Response.json({
      success: true,
      markets: marketData,
      count: Object.keys(marketData).length,
      timestamp: new Date().toISOString(),
      source: 'CoinGecko API'
    })

  } catch (error) {
    console.error('Error fetching batch market data:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch market data',
        details: String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Default symbols for GET request
  const defaultSymbols = ['BTC', 'ETH', 'SOL', 'AVAX']
  
  const request = new Request('', {
    method: 'POST',
    body: JSON.stringify({ symbols: defaultSymbols })
  })
  
  return POST(request)
}