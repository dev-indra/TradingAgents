'use client'

import { useState } from 'react'
import { coinGeckoService } from '@/lib/coingecko'

interface CryptoIconProps {
  symbol: string
  name?: string
  coinGeckoId?: string
  iconUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function CryptoIcon({ 
  symbol, 
  name, 
  coinGeckoId,
  iconUrl,
  size = 'md',
  className = ''
}: CryptoIconProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
    xl: 'w-12 h-12 text-lg'
  }

  const sizeClass = sizeClasses[size]

  // Try to get the best icon URL
  const getIconUrl = (): string => {
    if (iconUrl) return iconUrl
    if (coinGeckoId) {
      const fallbackUrl = coinGeckoService.getCryptoIconUrl(coinGeckoId, 'thumb')
      if (fallbackUrl) return fallbackUrl
    }
    return ''
  }

  const displayIconUrl = getIconUrl()
  const fallbackIcon = coinGeckoService.getFallbackIcon(symbol, name)

  // Handle image load error
  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageStart = () => {
    setIsLoading(true)
    setImageError(false)
  }

  // If we have a valid image URL and no error, show the image
  if (displayIconUrl && !imageError) {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        {isLoading && (
          <div className={`absolute inset-0 ${sizeClass} rounded-full bg-gray-200 animate-pulse flex items-center justify-center`}>
            <div className="text-gray-400">•</div>
          </div>
        )}
        <img
          src={displayIconUrl}
          alt={`${name || symbol} icon`}
          className={`${sizeClass} rounded-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          onLoadStart={handleImageStart}
        />
      </div>
    )
  }

  // Fallback to emoji or text icon
  return (
    <div 
      className={`
        ${sizeClass} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 
        flex items-center justify-center font-bold text-gray-700
        ${className}
      `}
      title={`${name || symbol} icon`}
    >
      {fallbackIcon}
    </div>
  )
}