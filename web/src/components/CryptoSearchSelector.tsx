'use client'

import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import { coinGeckoService, CoinGeckoSearchResult } from '@/lib/coingecko'
import CryptoIcon from './CryptoIcon'

interface CryptoSearchSelectorProps {
  onSelect: (crypto: CoinGeckoSearchResult) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function CryptoSearchSelector({ 
  onSelect, 
  placeholder = "Search for any cryptocurrency...",
  disabled = false,
  className = ""
}: CryptoSearchSelectorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CoinGeckoSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [trendingCoins, setTrendingCoins] = useState<CoinGeckoSearchResult[]>([])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Load trending coins on mount
  useEffect(() => {
    const loadTrendingCoins = async () => {
      try {
        const trending = await coinGeckoService.getTrendingCoins()
        setTrendingCoins(trending.slice(0, 8)) // Show top 8 trending
      } catch (error) {
        console.error('Failed to load trending coins:', error)
      }
    }
    loadTrendingCoins()
  }, [])

  // Search cryptocurrencies
  useEffect(() => {
    const searchCryptos = async () => {
      if (!query.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await coinGeckoService.searchCoins(query)
        setResults(searchResults)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchCryptos, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentResults = query.trim() ? results : trendingCoins

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < currentResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : currentResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && currentResults[selectedIndex]) {
          handleSelect(currentResults[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (crypto: CoinGeckoSearchResult) => {
    onSelect(crypto)
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const displayResults = query.trim() ? results : trendingCoins
  const showTrending = !query.trim() && trendingCoins.length > 0

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-crypto-500 focus:border-crypto-500
            placeholder-gray-500 text-sm
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            transition-colors duration-200
          `}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Trending Section */}
          {showTrending && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                🔥 Trending Cryptocurrencies
              </div>
            </div>
          )}

          {/* Search Section */}
          {!showTrending && query.trim() && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Search Results for "{query}"
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-crypto-600 mx-auto mb-2"></div>
              <div className="text-sm">Searching cryptocurrencies...</div>
            </div>
          )}

          {/* Results List */}
          {!isLoading && (
            <div className="py-2">
              {displayResults.length > 0 ? (
                displayResults.map((crypto, index) => (
                  <button
                    key={crypto.id}
                    onClick={() => handleSelect(crypto)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3
                      transition-colors duration-150 focus:outline-none focus:bg-gray-50
                      ${selectedIndex === index ? 'bg-crypto-50 border-r-2 border-crypto-500' : ''}
                    `}
                  >
                    {/* Coin Image/Icon */}
                    <div className="flex-shrink-0">
                      <CryptoIcon 
                        symbol={crypto.symbol}
                        name={crypto.name}
                        coinGeckoId={crypto.id}
                        iconUrl={crypto.large || crypto.thumb}
                        size="lg"
                      />
                    </div>

                    {/* Coin Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 truncate">
                          {crypto.name}
                        </span>
                        <span className="text-sm text-gray-500 uppercase font-mono">
                          {crypto.symbol}
                        </span>
                      </div>
                      {crypto.market_cap_rank && (
                        <div className="text-xs text-gray-400">
                          Rank #{crypto.market_cap_rank}
                        </div>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {selectedIndex === index && (
                      <CheckIcon className="h-5 w-5 text-crypto-600" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {query.trim() ? (
                    <div>
                      <div className="text-sm font-medium mb-1">No cryptocurrencies found</div>
                      <div className="text-xs">Try searching for Bitcoin, Ethereum, or another coin</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium mb-1">No trending data available</div>
                      <div className="text-xs">Start typing to search cryptocurrencies</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}