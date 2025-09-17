'use client'

import { useState, useEffect } from 'react'
import { ChartBarIcon, CurrencyDollarIcon, NewspaperIcon, ChatBubbleLeftRightIcon, CommandLineIcon } from '@heroicons/react/24/outline'
import CryptoAnalysis from '@/components/CryptoAnalysis'
import MarketOverview from '@/components/MarketOverview'
import NewsPanel from '@/components/NewsPanel'
import SystemStatus from '@/components/SystemStatus'
import PortfolioManager from '@/components/PortfolioManager'
import TradingDashboard from '@/components/TradingDashboard'
import { usePortfolio } from '@/context/PortfolioContext'
import { useLLMProvider } from '@/context/LLMProviderContext'
import LLMProviderSelector from '@/components/LLMProviderSelector'
import ProviderStatusNotification from '@/components/ProviderStatusNotification'
import ProviderConfigModal from '@/components/ProviderConfigModal'

type SystemHealthStatus = 'healthy' | 'unhealthy' | 'unknown'

interface SystemHealth {
  tradingagents: SystemHealthStatus
  mcpCrypto: SystemHealthStatus
  mcpNews: SystemHealthStatus
  redis: SystemHealthStatus
  llmProvider?: SystemHealthStatus
  llmProviderName?: string
}

export default function Dashboard() {
  const { assets, getPortfolioSymbols, isLoading: portfolioLoading } = usePortfolio()
  const { selectedProvider, providers, setSelectedProvider, testConnection } = useLLMProvider()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCrypto, setSelectedCrypto] = useState('')
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [configProviderId, setConfigProviderId] = useState<string | undefined>(undefined)
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    tradingagents: 'unknown',
    mcpCrypto: 'unknown',
    mcpNews: 'unknown',
    redis: 'unknown',
    llmProvider: 'unknown',
    llmProviderName: 'Loading...'
  })

  useEffect(() => {
    // Check system health on load
    checkSystemHealth()
    
    // Set up interval to check health every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Update system health when LLM provider status changes
  useEffect(() => {
    const currentProvider = providers.find(p => p.id === selectedProvider)
    if (currentProvider) {
      setSystemHealth(prev => ({
        ...prev,
        llmProvider: currentProvider.status === 'connected' ? 'healthy' :
                    currentProvider.status === 'disconnected' ? 'unhealthy' : 'unknown',
        llmProviderName: currentProvider.name
      }))
    }
  }, [providers, selectedProvider])

  // Set initial selected crypto when portfolio loads
  useEffect(() => {
    if (!portfolioLoading && assets.length > 0 && !selectedCrypto) {
      setSelectedCrypto(assets[0].symbol)
    }
  }, [portfolioLoading, assets, selectedCrypto])

  const handleConfigureProvider = (providerId: string) => {
    setConfigProviderId(providerId)
    setConfigModalOpen(true)
  }

  const checkSystemHealth = async () => {
    try {
      // Check services health
      const healthChecks = await Promise.allSettled([
        fetch('/api/health').then(r => ({ service: 'tradingagents', ok: r.ok })),
        fetch('/api/mcp-crypto/health').then(r => ({ service: 'mcpCrypto', ok: r.ok })),
        fetch('/api/mcp-news/health').then(r => ({ service: 'mcpNews', ok: r.ok })),
        fetch('/api/redis/health').then(r => ({ service: 'redis', ok: r.ok }))
      ])

      const newHealth = { ...systemHealth }
      healthChecks.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { service, ok } = result.value
          newHealth[service as keyof typeof systemHealth] = ok ? 'healthy' : 'unhealthy'
        } else {
          const services = ['tradingagents', 'mcpCrypto', 'mcpNews', 'redis']
          newHealth[services[index] as keyof typeof systemHealth] = 'unhealthy'
        }
      })

      // Update LLM provider status from context
      const currentProvider = providers.find(p => p.id === selectedProvider)
      if (currentProvider) {
        newHealth.llmProvider = currentProvider.status === 'connected' ? 'healthy' : 
                               currentProvider.status === 'disconnected' ? 'unhealthy' : 'unknown'
        newHealth.llmProviderName = currentProvider.name
      }

      setSystemHealth(newHealth)
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Market Overview', icon: ChartBarIcon },
    { id: 'analysis', name: 'Asset Analysis', icon: ChatBubbleLeftRightIcon },
    { id: 'trading', name: 'AI Report', icon: CommandLineIcon },
    { id: 'news', name: 'News & Sentiment', icon: NewspaperIcon },
    { id: 'portfolio', name: 'Portfolio', icon: CurrencyDollarIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ProviderStatusNotification />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-crypto-500 to-crypto-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TA</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-crypto-600 to-purple-600 bg-clip-text text-transparent">TradingAgents</h1>
                    <p className="text-xs text-gray-500">Crypto AI Analysis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* LLM Provider Selector */}
            <div className="flex-1 flex justify-center">
              <LLMProviderSelector
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
                providers={providers}
                onTestConnection={testConnection}
                onConfigureProvider={handleConfigureProvider}
              />
            </div>

            {/* System Status */}
            <SystemStatus health={systemHealth} />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-crypto-500 text-crypto-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className={`flex-1 ${activeTab === 'trading' ? 'overflow-hidden' : 'overflow-auto'}`}>
        {activeTab === 'trading' ? (
          <TradingDashboard onBack={() => setActiveTab('overview')} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {portfolioLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your portfolio...</p>
                </div>
              ) : assets.length === 0 && activeTab !== 'trading' ? (
                <div className="text-center py-12">
                  <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Assets</h3>
                  <p className="text-gray-500 mb-4">Add crypto assets to your portfolio to start analyzing.</p>
                  <button
                    onClick={() => setActiveTab('portfolio')}
                    className="btn-primary"
                  >
                    Manage Portfolio
                  </button>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && (
                    <MarketOverview 
                      cryptos={assets.map(asset => ({ 
                        symbol: asset.symbol, 
                        name: asset.name, 
                        icon: asset.icon 
                      }))}
                      onCryptoSelect={setSelectedCrypto}
                      selectedCrypto={selectedCrypto}
                    />
                  )}

                  {activeTab === 'analysis' && (
                    <CryptoAnalysis
                      cryptos={assets.map(asset => ({ 
                        symbol: asset.symbol, 
                        name: asset.name, 
                        icon: asset.icon 
                      }))}
                      selectedCrypto={selectedCrypto}
                      onCryptoSelect={setSelectedCrypto}
                    />
                  )}

                  {activeTab === 'news' && (
                    <NewsPanel 
                      cryptos={assets.map(asset => ({ 
                        symbol: asset.symbol, 
                        name: asset.name, 
                        icon: asset.icon 
                      }))}
                      selectedCrypto={selectedCrypto}
                      onCryptoSelect={setSelectedCrypto}
                    />
                  )}

                  {activeTab === 'portfolio' && (
                    <PortfolioManager />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Configuration Modal */}
      <ProviderConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        providerId={configProviderId}
      />
    </div>
  )
}
