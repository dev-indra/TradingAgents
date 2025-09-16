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
}

export interface PortfolioContextType {
  assets: PortfolioAsset[]
  addAsset: (asset: PortfolioAsset) => void
  updateAsset: (symbol: string, updates: Partial<PortfolioAsset>) => void
  removeAsset: (symbol: string) => void
  getAsset: (symbol: string) => PortfolioAsset | undefined
  getTotalValue: () => number
  getPortfolioSymbols: () => string[]
  clearPortfolio: () => void
  isLoading: boolean
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
    icon: '₿',
    addedAt: new Date().toISOString(),
    notes: 'Digital gold'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    quantity: 2.5,
    averagePrice: 3000,
    icon: 'Ξ',
    addedAt: new Date().toISOString(),
    notes: 'Smart contract platform'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    quantity: 50,
    averagePrice: 80,
    icon: '◎',
    addedAt: new Date().toISOString(),
    notes: 'Fast and low-cost blockchain'
  }
]

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<PortfolioAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load portfolio from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY)
      if (stored) {
        const parsedAssets = JSON.parse(stored)
        setAssets(parsedAssets)
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

  const getTotalValue = () => {
    // This would need real-time prices to be accurate
    // For now, using average price as placeholder
    return assets.reduce((total, asset) => total + (asset.quantity * asset.averagePrice), 0)
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
    getPortfolioSymbols,
    clearPortfolio,
    isLoading
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