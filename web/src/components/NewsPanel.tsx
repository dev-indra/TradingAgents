'use client'

import { useState, useEffect } from 'react'
import { NewspaperIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import useSWR from 'swr'

interface Crypto {
  symbol: string
  name: string
  icon: string
}

interface NewsPanelProps {
  cryptos: Crypto[]
  selectedCrypto: string
  onCryptoSelect: (symbol: string) => void
}

interface NewsArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: { name: string }
  sentiment?: {
    score: number
    label: string
  }
}

interface SentimentData {
  symbol: string
  overall_sentiment: {
    score: number
    label: string
  }
  sources: {
    reddit: {
      score: number
      label: string
      post_count: number
    }
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function NewsPanel({ cryptos, selectedCrypto, onCryptoSelect }: NewsPanelProps) {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null)
  const [fearGreedIndex, setFearGreedIndex] = useState<any>(null)

  // Fetch news and sentiment data
  useEffect(() => {
    fetchNewsData(selectedCrypto)
    fetchSentimentData(selectedCrypto)
  }, [selectedCrypto])

  useEffect(() => {
    fetchFearGreedIndex()
  }, [])

  const fetchNewsData = async (symbol: string) => {
    try {
      const response = await fetch('/api/mcp-news/tools/get_crypto_news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, days: 7 })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.articles) {
          setNewsArticles(data.articles.slice(0, 10)) // Limit to 10 articles
        }
      }
    } catch (error) {
      console.error('Failed to fetch news:', error)
      // Use mock data as fallback
      setNewsArticles(getMockNews(symbol))
    }
  }

  const fetchSentimentData = async (symbol: string) => {
    try {
      const response = await fetch('/api/mcp-news/tools/get_crypto_social_sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSentimentData(data)
      }
    } catch (error) {
      console.error('Failed to fetch sentiment:', error)
      // Use mock data as fallback
      setSentimentData(getMockSentiment(symbol))
    }
  }

  const fetchFearGreedIndex = async () => {
    try {
      const response = await fetch('/api/mcp-news/tools/get_market_fear_greed_index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      if (response.ok) {
        const data = await response.json()
        setFearGreedIndex(data)
      }
    } catch (error) {
      console.error('Failed to fetch fear greed index:', error)
      // Use mock data
      setFearGreedIndex({
        value: 65,
        value_classification: 'Greed',
        interpretation: 'Market sentiment is positive'
      })
    }
  }

  const getMockNews = (symbol: string): NewsArticle[] => [
    {
      title: `${symbol} Surges as Institutional Adoption Grows`,
      description: `Major financial institutions are showing increased interest in ${symbol}, driving positive market sentiment.`,
      url: '#',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: { name: 'CryptoNews' },
      sentiment: { score: 0.8, label: 'positive' }
    },
    {
      title: `Technical Analysis: ${symbol} Shows Strong Support Levels`,
      description: `Chart analysis reveals that ${symbol} has maintained strong support, indicating potential for further gains.`,
      url: '#',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: { name: 'TradingView' },
      sentiment: { score: 0.6, label: 'positive' }
    },
    {
      title: `Market Update: ${symbol} Volatility Expected`,
      description: `Analysts predict increased volatility for ${symbol} following recent regulatory developments.`,
      url: '#',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      source: { name: 'CoinDesk' },
      sentiment: { score: -0.2, label: 'neutral' }
    }
  ]

  const getMockSentiment = (symbol: string): SentimentData => ({
    symbol,
    overall_sentiment: {
      score: 0.65,
      label: 'positive'
    },
    sources: {
      reddit: {
        score: 0.7,
        label: 'positive',
        post_count: 156
      }
    }
  })

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-success-600'
    if (score < -0.1) return 'text-danger-600'
    return 'text-gray-600'
  }

  const getSentimentBadge = (label: string) => {
    switch (label.toLowerCase()) {
      case 'positive':
        return 'status-bullish'
      case 'negative':
        return 'status-bearish'
      default:
        return 'status-neutral'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Crypto Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">News & Sentiment Analysis</h2>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {cryptos.map((crypto) => (
            <button
              key={crypto.symbol}
              onClick={() => onCryptoSelect(crypto.symbol)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedCrypto === crypto.symbol
                  ? 'border-crypto-500 bg-crypto-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{crypto.icon}</div>
                <div className="text-xs font-medium text-gray-700">{crypto.symbol}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Articles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Latest {selectedCrypto} News</h3>
            </div>
            
            <div className="space-y-4">
              {newsArticles.map((article, index) => (
                <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {article.title}
                    </h4>
                    {article.sentiment && (
                      <span className={getSentimentBadge(article.sentiment.label)}>
                        {article.sentiment.label}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.source.name}</span>
                    <span>{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="space-y-6">
          {/* Overall Sentiment */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Sentiment Analysis</h3>
            </div>
            
            {sentimentData && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getSentimentColor(sentimentData.overall_sentiment.score)}`}>
                    {Math.round(sentimentData.overall_sentiment.score * 100)}
                  </div>
                  <div className="text-sm text-gray-500">Sentiment Score</div>
                  <div className={`mt-2 ${getSentimentBadge(sentimentData.overall_sentiment.label)}`}>
                    {sentimentData.overall_sentiment.label}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Sources</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Reddit</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getSentimentColor(sentimentData.sources.reddit.score)}`}>
                          {Math.round(sentimentData.sources.reddit.score * 100)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sentimentData.sources.reddit.post_count} posts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fear & Greed Index */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Fear & Greed Index</h3>
            </div>
            
            {fearGreedIndex && (
              <div className="text-center space-y-3">
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#0ea5e9"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - fearGreedIndex.value / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{fearGreedIndex.value}</div>
                      <div className="text-xs text-gray-500">{fearGreedIndex.value_classification}</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  {fearGreedIndex.interpretation}
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">News Summary</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Articles</span>
                <span className="font-medium">{newsArticles.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Positive</span>
                <span className="font-medium text-success-600">
                  {newsArticles.filter(a => a.sentiment?.label === 'positive').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Neutral</span>
                <span className="font-medium text-gray-600">
                  {newsArticles.filter(a => a.sentiment?.label === 'neutral').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Negative</span>
                <span className="font-medium text-danger-600">
                  {newsArticles.filter(a => a.sentiment?.label === 'negative').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}