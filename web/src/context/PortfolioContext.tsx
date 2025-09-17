'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface PortfolioAsset {
  symbol: string
  name: string
  quantity: number
  averagePrice: number // USD
  icon: string
  addedAt: string
  notes?: string
  coinGeckoId?: string // CoinGecko API ID for fetching real-time data
  currentPrice?: number // Real-time price from CoinGecko
  priceChange24h?: number // 24h price change percentage
  marketCapRank?: number // CoinGecko market cap ranking
}

export interface PortfolioContextType {
  assets: PortfolioAsset[]
  addAsset: (asset: PortfolioAsset) => void
  updateAsset: (symbol: string, updates: Partial<PortfolioAsset>) => void
  removeAsset: (symbol: string) => void
  getAsset: (symbol: string) => PortfolioAsset | undefined
  getTotalValue: () => number // Current market value
  getTotalCost: () => number // Total amount paid (average cost)
  getTotalGainLoss: () => { amount: number; percentage: number }
  getPortfolioSymbols: () => string[]
  clearPortfolio: () => void
  refreshPrices: () => Promise<void>
  isLoading: boolean
  isLoadingPrices: boolean
  priceError: string | null
  lastPriceUpdate: Date | null
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

const PORTFOLIO_STORAGE_KEY = 'tradingagents_portfolio'

// Default crypto assets for new users
const DEFAULT_ASSETS: PortfolioAsset[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    quantity: 0.1,
    averagePrice: 45000,
    icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    addedAt: new Date().toISOString(),
    notes: 'Digital gold',
    coinGeckoId: 'bitcoin'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    quantity: 2.5,
    averagePrice: 3000,
    icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    addedAt: new Date().toISOString(),
    notes: 'Smart contract platform',
    coinGeckoId: 'ethereum'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    quantity: 50,
    averagePrice: 80,
    icon: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    addedAt: new Date().toISOString(),
    notes: 'Fast and low-cost blockchain',
    coinGeckoId: 'solana'
  },
  {
    symbol: 'LINEA',
    name: 'Linea',
    quantity: 1000,
    averagePrice: 0.5,
    icon: 'https://assets.coingecko.com/coins/images/68507/large/linea-logo.png',
    addedAt: new Date().toISOString(),
    notes: 'Layer 2 scaling solution',
    coinGeckoId: 'linea'
  }
]

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<PortfolioAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)

  // Icon mapping for migration from emoji to CoinGecko image URLs
  const ICON_MAPPING: Record<string, string> = {
    'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', 
    'SOL': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    'AVAX': 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    'ADA': 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    'DOT': 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    'LINK': 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    'UNI': 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    'LTC': 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    'LINEA': 'https://assets.coingecko.com/coins/images/68507/large/linea-logo.png'
  }

  // Migrate asset icons to CoinGecko image URLs
  const migrateAssetIcons = (assets: PortfolioAsset[]): PortfolioAsset[] => {
    return assets.map(asset => {
      // If icon is empty, emoji, or we have a mapping, use CoinGecko image
      if (!asset.icon || !asset.icon.startsWith('http') || asset.icon.length <= 3) {
        const coinGeckoIcon = ICON_MAPPING[asset.symbol.toUpperCase()]
        if (coinGeckoIcon) {
          return {
            ...asset,
            icon: coinGeckoIcon
          }
        }
      }
      return asset
    })
  }

  // Load portfolio from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY)
      if (stored) {
        const parsedAssets = JSON.parse(stored)
        const migratedAssets = migrateAssetIcons(parsedAssets)
        setAssets(migratedAssets)
        // Save the migrated assets back to localStorage
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(migratedAssets))
      } else {
        // First time user - set default portfolio
        setAssets(DEFAULT_ASSETS)
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(DEFAULT_ASSETS))
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error)
      setAssets(DEFAULT_ASSETS)
    } finally {
      setIsLoading(false)
      // Fetch real-time prices after loading assets
      refreshPrices()
    }
  }, [])

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading && assets.length > 0) {
      try {
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(assets))
      } catch (error) {
        console.error('Failed to save portfolio:', error)
      }
    }
  }, [assets, isLoading])

  const addAsset = (asset: PortfolioAsset) => {
    setAssets(prev => {
      // Check if asset already exists
      const existingIndex = prev.findIndex(a => a.symbol === asset.symbol)
      if (existingIndex >= 0) {
        // Update existing asset
        const updated = [...prev]
        updated[existingIndex] = asset
        return updated
      } else {
        // Add new asset
        return [...prev, asset]
      }
    })
  }

  const updateAsset = (symbol: string, updates: Partial<PortfolioAsset>) => {
    setAssets(prev =>
      prev.map(asset =>
        asset.symbol === symbol
          ? { ...asset, ...updates }
          : asset
      )
    )
  }

  const removeAsset = (symbol: string) => {
    setAssets(prev => prev.filter(asset => asset.symbol !== symbol))
  }

  const getAsset = (symbol: string) => {
    return assets.find(asset => asset.symbol === symbol)
  }

  // Fetch real-time prices for all assets in the portfolio
  const refreshPrices = async (retryCount = 0) => {
    if (assets.length === 0) return
    
    setIsLoadingPrices(true)
    setPriceError(null)
    
    try {
      // Get portfolio symbols for batch request
      const symbols = assets.map(asset => asset.symbol)
      
      // Call our new batch market data API
      const response = await fetch('/api/mcp-crypto/batch-market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.markets) {
        // Update assets with real-time price data
        setAssets(prev => prev.map(asset => {
          const marketData = data.markets[asset.symbol]
          if (marketData) {
            return {
              ...asset,
              currentPrice: marketData.current_price,
              priceChange24h: marketData.price_change_percentage_24h,
              marketCapRank: marketData.market_cap_rank
            }
          }
          return asset
        }))
        
        setLastPriceUpdate(new Date())
        setPriceError(null)
        console.log('✅ Updated portfolio with real-time prices', data.markets)
      } else {
        throw new Error(data.error || 'Failed to fetch price data')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Failed to fetch real-time prices:', errorMessage)
      
      // Retry logic - retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        setTimeout(() => {
          console.log(`Retrying price fetch (attempt ${retryCount + 2}/3) in ${delay}ms...`)
          refreshPrices(retryCount + 1)
        }, delay)
        return
      }
      
      setPriceError(errorMessage)
    } finally {
      setIsLoadingPrices(false)
    }
  }
  
  // Refresh prices every 60 seconds when the app is active
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        refreshPrices()
      }, 60000) // 60 seconds
      
      return () => clearInterval(interval)
    }
  }, [isLoading, assets.length])
  
  // Calculate current market value using real-time prices
  const getTotalValue = () => {
    return assets.reduce((total, asset) => {
      // Use currentPrice if available, fallback to averagePrice
      const price = asset.currentPrice || asset.averagePrice
      return total + (asset.quantity * price)
    }, 0)
  }
  
  // Calculate total cost basis (what was paid)
  const getTotalCost = () => {
    return assets.reduce((total, asset) => total + (asset.quantity * asset.averagePrice), 0)
  }
  
  // Calculate total gain/loss
  const getTotalGainLoss = () => {
    const cost = getTotalCost()
    const value = getTotalValue()
    const amount = value - cost
    const percentage = cost > 0 ? (amount / cost) * 100 : 0
    
    return { amount, percentage }
  }

  const getPortfolioSymbols = () => {
    return assets.map(asset => asset.symbol)
  }

  const clearPortfolio = () => {
    setAssets([])
    localStorage.removeItem(PORTFOLIO_STORAGE_KEY)
  }

  const value: PortfolioContextType = {
    assets,
    addAsset,
    updateAsset,
    removeAsset,
    getAsset,
    getTotalValue,
    getTotalCost,
    getTotalGainLoss,
    getPortfolioSymbols,
    clearPortfolio,
    refreshPrices,
    isLoading,
    isLoadingPrices,
    priceError,
    lastPriceUpdate
  }

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export const usePortfolio = () => {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}