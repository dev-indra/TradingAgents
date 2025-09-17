'use client'

import { useState } from 'react'

interface CryptoIconRendererProps {
  symbol: string
  name?: string
  iconUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackType?: 'letter' | 'gradient'
}

/**
 * A standardized crypto icon renderer that ensures consistency across the app
 * This component handles image loading, error states, and fallbacks uniformly
 */
export default function CryptoIconRenderer({
  symbol,
  name,
  iconUrl,
  size = 'md',
  className = '',
  fallbackType = 'gradient'
}: CryptoIconRendererProps) {
  const [imageError, setImageError] = useState(false)

  // Size mappings for consistent sizing
  const sizeMap = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-5 h-5 text-xs', 
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
    xl: 'w-10 h-10 text-lg'
  }

  const sizeClasses = sizeMap[size]

  const handleImageError = () => {
    setImageError(true)
  }

  const shouldShowImage = iconUrl && iconUrl.startsWith('http') && !imageError
  
  const renderFallback = () => {
    const letter = symbol.charAt(0).toUpperCase()
    
    if (fallbackType === 'gradient') {
      return (
        <div 
          className={`${sizeClasses} bg-gradient-to-r from-crypto-500 to-crypto-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${className}`}
          title={name || symbol}
        >
          {letter}
        </div>
      )
    } else {
      return (
        <div 
          className={`${sizeClasses} bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold ${className}`}
          title={name || symbol}
        >
          {letter}
        </div>
      )
    }
  }

  if (shouldShowImage) {
    return (
      <div className={`relative ${sizeClasses} ${className}`}>
        <img
          src={iconUrl}
          alt={`${name || symbol} icon`}
          className={`${sizeClasses} rounded-full object-cover`}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    )
  }

  return renderFallback()
}

// Convenience wrapper for common use cases
export function SimpleCryptoIcon({ 
  symbol, 
  iconUrl, 
  size = 'md' 
}: { 
  symbol: string
  iconUrl?: string  
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}) {
  return (
    <CryptoIconRenderer
      symbol={symbol}
      iconUrl={iconUrl}
      size={size}
      fallbackType="gradient"
    />
  )
}