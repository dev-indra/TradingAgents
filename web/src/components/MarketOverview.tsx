'use client'

import { useState, useEffect } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import useSWR from 'swr'
import CryptoIcon from './CryptoIcon'

interface Crypto {
  symbol: string
  name: string
  icon: string
}

interface MarketOverviewProps {
  cryptos: Crypto[]
  selectedCrypto: string
  onCryptoSelect: (symbol: string) => void
}

interface MarketData {
  symbol: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  volume_24h: number
}

interface PriceData {
  timestamp: number
  price: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Special fetcher for batch market data that needs to POST symbols
const batchMarketDataFetcher = async (url: string, symbols: string[]) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols })
  })
  return response.json()
}

export default function MarketOverview({ cryptos, selectedCrypto, onCryptoSelect }: MarketOverviewProps) {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({})
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([])
  const [fearGreedIndex, setFearGreedIndex] = useState<{value: number, sentiment: string, description: string, color: string} | null>(null)

  // Fetch real market data for all cryptos using CoinGecko API
  const symbols = cryptos.map(c => c.symbol)
  const { data: marketResponse, error } = useSWR(
    symbols.length > 0 ? ['/api/mcp-crypto/batch-market-data', symbols] : null,
    ([url, symbols]) => batchMarketDataFetcher(url, symbols),
    { 
      refreshInterval: 60000, // Refresh every 60 seconds (CoinGecko rate limit friendly)
      revalidateOnFocus: false
    }
  )

  useEffect(() => {
    if (marketResponse?.success && marketResponse.markets) {
      // Transform the real data to our expected format
      const transformedData: Record<string, MarketData> = {}
      
      Object.entries(marketResponse.markets).forEach(([symbol, data]: [string, any]) => {
        transformedData[symbol] = {
          symbol: data.symbol,
          current_price: data.current_price || 0,
          price_change_24h: data.price_change_24h || 0,
          price_change_percentage_24h: data.price_change_percentage_24h || 0,
          market_cap: data.market_cap || 0,
          volume_24h: data.total_volume || 0
        }
      })
      
      setMarketData(transformedData)
      console.log('✅ Real market data loaded:', transformedData)
    } else if (marketResponse && !marketResponse.success) {
      console.error('❌ Market data API error:', marketResponse)
    }
    
    if (error) {
      console.error('❌ SWR fetch error:', error)
    }
  }, [marketResponse, error])

  useEffect(() => {
    fetchPriceHistory(selectedCrypto)
    fetchFearGreedIndex()
  }, [selectedCrypto])

  // Fetch Fear & Greed Index data
  const fetchFearGreedIndex = async () => {
    try {
      const response = await fetch('/api/mcp-crypto/fear-greed-index')
      const data = await response.json()
      
      if (data.success && data.index) {
        setFearGreedIndex(data.index)
        console.log('✅ Fear & Greed Index loaded:', data.index.value, data.index.sentiment)
      } else {
        console.error('❌ Fear & Greed Index API error:', data)
      }
    } catch (error) {
      console.error('Failed to fetch Fear & Greed Index:', error)
    }
  }

  const fetchPriceHistory = async (symbol: string) => {
    try {
      const response = await fetch('/api/mcp-crypto/price-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, days: 7 })
      })
      
      const data = await response.json()
      
      if (data.success && data.prices) {
        setPriceHistory(data.prices)
        console.log('✅ Price history loaded:', data.prices.length, 'data points')
      } else {
        console.error('❌ Price history API error:', data)
      }
    } catch (error) {
      console.error('Failed to fetch price history:', error)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toFixed(4)}`
    }
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    }
    return `$${marketCap.toFixed(0)}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`
    }
    return `$${volume.toFixed(0)}`
  }

  // Mock data for demonstration
  const mockMarketData: Record<string, MarketData> = {
    BTC: {
      symbol: 'BTC',
      current_price: 45234.56,
      price_change_24h: 1234.56,
      price_change_percentage_24h: 2.8,
      market_cap: 884500000000,
      volume_24h: 28400000000
    },
    ETH: {
      symbol: 'ETH',
      current_price: 2845.23,
      price_change_24h: -45.67,
      price_change_percentage_24h: -1.6,
      market_cap: 342100000000,
      volume_24h: 15600000000
    },
    SOL: {
      symbol: 'SOL',
      current_price: 98.45,
      price_change_24h: 5.67,
      price_change_percentage_24h: 6.1,
      market_cap: 43200000000,
      volume_24h: 2100000000
    },
    AVAX: {
      symbol: 'AVAX',
      current_price: 34.78,
      price_change_24h: 2.34,
      price_change_percentage_24h: 7.2,
      market_cap: 13400000000,
      volume_24h: 890000000
    }
  }

  // Mock price history data
  const mockPriceHistory = Array.from({ length: 168 }, (_, i) => ({
    timestamp: Date.now() - (167 - i) * 60 * 60 * 1000, // Hourly data for 7 days
    price: 45000 + Math.sin(i / 10) * 2000 + Math.random() * 1000
  }))

  // Use real data if available, fallback to mock data
  const currentData = Object.keys(marketData).length > 0 ? marketData : mockMarketData
  const chartData = priceHistory.length > 0 ? priceHistory : mockPriceHistory

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cryptos.slice(0, 4).map((crypto) => {
          const data = currentData[crypto.symbol]
          if (!data) return null

          const isPositive = data.price_change_percentage_24h >= 0
          
          return (
            <div
              key={crypto.symbol}
              onClick={() => onCryptoSelect(crypto.symbol)}
              className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCrypto === crypto.symbol ? 'ring-2 ring-crypto-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CryptoIcon 
                    symbol={crypto.symbol}
                    name={crypto.name}
                    iconUrl={crypto.icon}
                    size="lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{crypto.symbol}</h3>
                    <p className="text-xs text-gray-500">{crypto.name}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${
                  isPositive ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {isPositive ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(data.price_change_percentage_24h).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(data.current_price)}
                  </p>
                  <p className={`text-sm ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                    {isPositive ? '+' : ''}{formatPrice(data.price_change_24h)}
                  </p>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <div>
                    <p>Market Cap</p>
                    <p className="font-medium">{formatMarketCap(data.market_cap)}</p>
                  </div>
                  <div>
                    <p>Volume 24h</p>
                    <p className="font-medium">{formatVolume(data.volume_24h)}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Price Chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              {cryptos.find(c => c.symbol === selectedCrypto)?.name} Price Chart
            </h2>
            <p className="text-sm text-gray-500">7-day price history</p>
          </div>
          <div className="flex items-center space-x-2">
            {cryptos.map((crypto) => (
              <button
                key={crypto.symbol}
                onClick={() => onCryptoSelect(crypto.symbol)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedCrypto === crypto.symbol
                    ? 'bg-crypto-100 text-crypto-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {crypto.symbol}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                domain={['dataMin - 1000', 'dataMax + 1000']}
                tickFormatter={(value) => formatPrice(value)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [formatPrice(value), 'Price']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#0ea5e9', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="card-title">Fear & Greed Index</h3>
          <div className="mt-4">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={fearGreedIndex?.color || "#0ea5e9"}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - (fearGreedIndex?.value || 65) / 100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{fearGreedIndex?.value || 65}</div>
                    <div className="text-xs text-gray-500">{fearGreedIndex?.sentiment || 'Loading...'}</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
              {fearGreedIndex?.description || 'Market sentiment data loading...'}
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Top Performers</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(currentData)
              .sort(([,a], [,b]) => b.price_change_percentage_24h - a.price_change_percentage_24h)
              .slice(0, 3)
              .map(([symbol, data]) => {
                const crypto = cryptos.find(c => c.symbol === symbol)
                if (!crypto) return null
                
                return (
                  <div key={symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CryptoIcon 
                        symbol={symbol}
                        name={crypto.name}
                        iconUrl={crypto.icon}
                        size="md"
                      />
                      <span className="font-medium text-gray-900">{symbol}</span>
                    </div>
                    <div className="text-success-600 font-medium text-sm">
                      +{data.price_change_percentage_24h.toFixed(1)}%
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Market Cap Leaders</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(currentData)
              .sort(([,a], [,b]) => b.market_cap - a.market_cap)
              .slice(0, 3)
              .map(([symbol, data]) => {
                const crypto = cryptos.find(c => c.symbol === symbol)
                if (!crypto) return null
                
                return (
                  <div key={symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CryptoIcon 
                        symbol={symbol}
                        name={crypto.name}
                        iconUrl={crypto.icon}
                        size="md"
                      />
                      <span className="font-medium text-gray-900">{symbol}</span>
                    </div>
                    <div className="text-gray-600 font-medium text-sm">
                      {formatMarketCap(data.market_cap)}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}