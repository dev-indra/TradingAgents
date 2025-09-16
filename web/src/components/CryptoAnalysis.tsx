'use client'

import { useState } from 'react'
import { PlayIcon, StopIcon } from '@heroicons/react/24/solid'
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Crypto {
  symbol: string
  name: string
  icon: string
}

interface CryptoAnalysisProps {
  cryptos: Crypto[]
  selectedCrypto: string
  onCryptoSelect: (symbol: string) => void
}

interface AnalysisResult {
  symbol: string
  decision: string
  confidence: number
  reasoning: string
  timestamp: string
  agents: {
    market: string
    news: string
    sentiment: string
    risk: string
  }
}

export default function CryptoAnalysis({ cryptos, selectedCrypto, onCryptoSelect }: CryptoAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([])

  const startAnalysis = async (symbol: string) => {
    setIsAnalyzing(true)
    setAnalysisLogs([])
    
    try {
      const response = await fetch('/api/tradingagents/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          date: new Date().toISOString().split('T')[0],
          debug: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const result = await response.json()
      
      // Add result to analysis results
      const newResult: AnalysisResult = {
        symbol,
        decision: result.decision || 'No decision',
        confidence: result.confidence || 50,
        reasoning: result.reasoning || 'Analysis completed',
        timestamp: new Date().toISOString(),
        agents: {
          market: result.market_analysis || 'No market analysis',
          news: result.news_analysis || 'No news analysis',
          sentiment: result.sentiment_analysis || 'No sentiment analysis',
          risk: result.risk_analysis || 'No risk analysis',
        }
      }

      setAnalysisResults(prev => [newResult, ...prev.slice(0, 4)]) // Keep last 5 results
      toast.success(`Analysis completed for ${symbol}`)

    } catch (error) {
      console.error('Analysis error:', error)
      toast.error(`Analysis failed for ${symbol}: ${error}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const runBatchAnalysis = async () => {
    const topCryptos = ['BTC', 'ETH', 'SOL', 'AVAX']
    
    for (const crypto of topCryptos) {
      if (!isAnalyzing) break
      
      setAnalysisLogs(prev => [...prev, `Starting analysis for ${crypto}...`])
      await startAnalysis(crypto)
      
      // Add delay between analyses to avoid overwhelming the system
      if (crypto !== topCryptos[topCryptos.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }

  const getDecisionColor = (decision: string) => {
    const lower = decision.toLowerCase()
    if (lower.includes('buy') || lower.includes('bullish')) return 'text-success-600'
    if (lower.includes('sell') || lower.includes('bearish')) return 'text-danger-600'
    return 'text-gray-600'
  }

  const getDecisionBadge = (decision: string) => {
    const lower = decision.toLowerCase()
    if (lower.includes('buy') || lower.includes('bullish')) {
      return 'status-bullish'
    }
    if (lower.includes('sell') || lower.includes('bearish')) {
      return 'status-bearish'
    }
    return 'status-neutral'
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">AI Trading Analysis</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={runBatchAnalysis}
              disabled={isAnalyzing}
              className="btn-primary"
            >
              {isAnalyzing ? (
                <>
                  <StopIcon className="h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  Batch Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Crypto Selection Grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {cryptos.map((crypto) => (
            <button
              key={crypto.symbol}
              onClick={() => onCryptoSelect(crypto.symbol)}
              disabled={isAnalyzing}
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

        {/* Single Analysis Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => startAnalysis(selectedCrypto)}
            disabled={isAnalyzing}
            className="btn-primary px-8"
          >
            {isAnalyzing ? (
              <>
                <div className="loading-dots text-white" />
                Analyzing {selectedCrypto}...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                Analyze {selectedCrypto}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <div className="grid gap-6">
          {analysisResults.map((result, index) => (
            <div key={`${result.symbol}-${result.timestamp}`} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {cryptos.find(c => c.symbol === result.symbol)?.icon || '?'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {result.symbol} Analysis
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getDecisionColor(result.decision)}`}>
                    {result.decision}
                  </div>
                  <div className="text-sm text-gray-500">
                    Confidence: {result.confidence}%
                  </div>
                </div>
              </div>

              {/* Decision Badge */}
              <div className="mb-4">
                <span className={getDecisionBadge(result.decision)}>
                  {result.decision}
                </span>
              </div>

              {/* Reasoning */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">AI Reasoning:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {result.reasoning}
                </p>
              </div>

              {/* Agent Analysis Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Market Analysis</h5>
                    <p className="text-xs text-gray-600 mt-1">{result.agents.market}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">News Analysis</h5>
                    <p className="text-xs text-gray-600 mt-1">{result.agents.news}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Sentiment Analysis</h5>
                    <p className="text-xs text-gray-600 mt-1">{result.agents.sentiment}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Risk Analysis</h5>
                    <p className="text-xs text-gray-600 mt-1">{result.agents.risk}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Logs */}
      {analysisLogs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Analysis Logs</h3>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-64 overflow-y-auto custom-scrollbar">
            {analysisLogs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isAnalyzing && analysisResults.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Analysis Yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a cryptocurrency and run an AI analysis to get started.
          </p>
        </div>
      )}
    </div>
  )
}