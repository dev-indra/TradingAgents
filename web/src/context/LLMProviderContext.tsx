'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { LLMProvider } from '@/components/LLMProviderSelector'
import { CloudIcon, HomeIcon, CpuChipIcon, BoltIcon } from '@heroicons/react/24/outline'

interface LLMProviderContextType {
  selectedProvider: string
  providers: LLMProvider[]
  setSelectedProvider: (providerId: string) => void
  updateProviderStatus: (providerId: string, status: LLMProvider['status']) => void
  testConnection: (providerId: string) => Promise<boolean>
  isConnected: (providerId: string) => boolean
  getCurrentProvider: () => LLMProvider | undefined
}

const LLMProviderContext = createContext<LLMProviderContextType | undefined>(undefined)

// Default providers configuration
const defaultProviders: LLMProvider[] = [
  {
    id: 'lmstudio',
    name: 'LM Studio',
    description: 'Local models running on your machine - completely free!',
    icon: HomeIcon,
    status: 'unknown',
    cost: 'free',
    isLocal: true
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access to Claude, GPT-4, and other premium models',
    icon: CloudIcon,
    status: 'unknown',
    cost: 'paid',
    isLocal: false
  },
  {
    id: 'anthropic',
    name: 'Claude (Direct)',
    description: 'Direct Anthropic Claude API access',
    icon: CpuChipIcon,
    status: 'unknown',
    cost: 'paid',
    isLocal: false
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Direct OpenAI GPT-4 API access',
    icon: BoltIcon,
    status: 'unknown',
    cost: 'paid',
    isLocal: false
  }
]

interface LLMProviderProviderProps {
  children: ReactNode
}

export function LLMProviderProvider({ children }: LLMProviderProviderProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('lmstudio') // Default to LM Studio
  const [providers, setProviders] = useState<LLMProvider[]>(defaultProviders)

  // Load saved provider preference from localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem('selectedLLMProvider')
    if (savedProvider && providers.find(p => p.id === savedProvider)) {
      setSelectedProvider(savedProvider)
    }
  }, [providers])

  // Save provider preference to localStorage
  useEffect(() => {
    localStorage.setItem('selectedLLMProvider', selectedProvider)
  }, [selectedProvider])

  // Test all provider connections on load
  useEffect(() => {
    const testAllConnections = async () => {
      for (const provider of providers) {
        try {
          await testConnection(provider.id)
        } catch (error) {
          console.log(`Failed to test ${provider.id}:`, error)
        }
      }
    }

    testAllConnections()
  }, [])

  const updateProviderStatus = (providerId: string, status: LLMProvider['status']) => {
    setProviders(prev => 
      prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status }
          : provider
      )
    )
  }

  const testConnection = async (providerId: string): Promise<boolean> => {
    updateProviderStatus(providerId, 'testing')
    
    try {
      const response = await fetch('/api/llm-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providerId }),
      })

      const result = await response.json()
      const isConnected = result.success

      updateProviderStatus(providerId, isConnected ? 'connected' : 'disconnected')
      return isConnected
    } catch (error) {
      console.error(`Connection test failed for ${providerId}:`, error)
      updateProviderStatus(providerId, 'disconnected')
      return false
    }
  }

  const isConnected = (providerId: string): boolean => {
    const provider = providers.find(p => p.id === providerId)
    return provider?.status === 'connected'
  }

  const getCurrentProvider = (): LLMProvider | undefined => {
    return providers.find(p => p.id === selectedProvider)
  }

  const handleSetSelectedProvider = async (providerId: string) => {
    setSelectedProvider(providerId)
    // Test connection when switching providers
    await testConnection(providerId)
  }

  const value: LLMProviderContextType = {
    selectedProvider,
    providers,
    setSelectedProvider: handleSetSelectedProvider,
    updateProviderStatus,
    testConnection,
    isConnected,
    getCurrentProvider
  }

  return (
    <LLMProviderContext.Provider value={value}>
      {children}
    </LLMProviderContext.Provider>
  )
}

export function useLLMProvider() {
  const context = useContext(LLMProviderContext)
  if (context === undefined) {
    throw new Error('useLLMProvider must be used within a LLMProviderProvider')
  }
  return context
}

// Hook for checking if a provider needs configuration
export function useProviderConfiguration() {
  const { selectedProvider, getCurrentProvider } = useLLMProvider()
  
  const needsConfiguration = () => {
    const provider = getCurrentProvider()
    if (!provider) return false
    
    // Check if paid providers have API keys configured
    if (provider.cost === 'paid' && provider.status === 'disconnected') {
      return true
    }
    
    return false
  }

  const getConfigurationMessage = () => {
    const provider = getCurrentProvider()
    if (!provider) return ''
    
    switch (provider.id) {
      case 'openrouter':
        return 'Please configure your OpenRouter API key in settings'
      case 'anthropic':
        return 'Please configure your Anthropic API key in settings'
      case 'openai':
        return 'Please configure your OpenAI API key in settings'
      case 'lmstudio':
        return 'Please ensure LM Studio is running with a loaded model'
      default:
        return 'Provider may need additional configuration'
    }
  }

  return {
    needsConfiguration: needsConfiguration(),
    configurationMessage: getConfigurationMessage()
  }
}