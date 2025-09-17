'use client'

import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  QuestionMarkCircleIcon,
  HomeIcon,
  CloudIcon,
  CpuChipIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

export interface LLMProvider {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'connected' | 'disconnected' | 'testing' | 'unknown'
  cost: 'free' | 'paid'
  isLocal: boolean
}

interface LLMProviderSelectorProps {
  selectedProvider: string
  onProviderChange: (providerId: string) => void
  providers: LLMProvider[]
  onTestConnection?: (providerId: string) => Promise<boolean>
  onConfigureProvider?: (providerId: string) => void
}

const statusIcons = {
  connected: CheckCircleIcon,
  disconnected: XCircleIcon,
  testing: ExclamationTriangleIcon,
  unknown: QuestionMarkCircleIcon,
}

const statusColors = {
  connected: 'text-success-500',
  disconnected: 'text-danger-500', 
  testing: 'text-warning-500',
  unknown: 'text-gray-400',
}

const getProviderIcon = (provider: LLMProvider) => {
  switch (provider.id) {
    case 'lmstudio':
      return HomeIcon
    case 'openrouter':
      return CloudIcon
    case 'anthropic':
      return CpuChipIcon
    case 'openai':
      return BoltIcon
    default:
      return provider.icon
  }
}

export default function LLMProviderSelector({ 
  selectedProvider, 
  onProviderChange, 
  providers,
  onTestConnection,
  onConfigureProvider 
}: LLMProviderSelectorProps) {
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null)
  
  const currentProvider = providers.find(p => p.id === selectedProvider)
  const ProviderIcon = currentProvider ? getProviderIcon(currentProvider) : CloudIcon
  const StatusIcon = currentProvider ? statusIcons[currentProvider.status] : QuestionMarkCircleIcon

  const handleTestConnection = async (providerId: string) => {
    if (!onTestConnection) return
    
    setIsTestingConnection(providerId)
    try {
      await onTestConnection(providerId)
    } finally {
      setIsTestingConnection(null)
    }
  }

  const handleProviderSelect = (providerId: string) => {
    onProviderChange(providerId)
    // Auto-test connection when switching providers
    if (onTestConnection) {
      handleTestConnection(providerId)
    }
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crypto-500 transition-colors">
          <div className="flex items-center space-x-2">
            <ProviderIcon className="h-4 w-4 text-gray-500" />
            <StatusIcon className={`h-3 w-3 ${statusColors[currentProvider?.status || 'unknown']}`} />
            <span className="hidden sm:block">
              {currentProvider?.name || 'Select LLM'}
            </span>
            {currentProvider?.cost === 'free' && (
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                FREE
              </span>
            )}
          </div>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-20 mt-2 w-80 origin-top-left bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-2">
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">AI Model Provider</h3>
              <p className="text-xs text-gray-500 mt-1">Choose your language model provider</p>
            </div>
            
            {/* Provider List */}
            <div className="py-2">
              {providers.map((provider) => {
                const Icon = getProviderIcon(provider)
                const Status = statusIcons[provider.status]
                const isSelected = provider.id === selectedProvider
                const isTesting = isTestingConnection === provider.id
                
                return (
                  <Menu.Item key={provider.id}>
                    {({ active }) => (
                      <div className={`mx-2 rounded-md ${active ? 'bg-gray-50' : ''}`}>
                        <button
                          onClick={() => handleProviderSelect(provider.id)}
                          className="w-full text-left px-3 py-3 flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Icon className={`h-5 w-5 flex-shrink-0 ${
                              isSelected ? 'text-crypto-600' : 'text-gray-400'
                            }`} />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className={`text-sm font-medium truncate ${
                                  isSelected ? 'text-crypto-600' : 'text-gray-900'
                                }`}>
                                  {provider.name}
                                </p>
                                
                                {/* Status and badges */}
                                <div className="flex items-center space-x-1">
                                  {provider.cost === 'free' && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                                      FREE
                                    </span>
                                  )}
                                  {provider.isLocal && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      LOCAL
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {provider.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-3">
                            {isTesting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-crypto-600"></div>
                            ) : (
                              <Status className={`h-4 w-4 ${statusColors[provider.status]}`} />
                            )}
                            
                            {isSelected && (
                              <CheckCircleIcon className="h-4 w-4 text-crypto-600" />
                            )}
                          </div>
                        </button>
                        
                        {/* Provider actions */}
                        {active && onConfigureProvider && (
                          <div className="px-3 pb-2 border-t border-gray-100 mt-2 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onConfigureProvider(provider.id)
                              }}
                              className="text-xs text-crypto-600 hover:text-crypto-700 font-medium"
                            >
                              Configure Settings
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </Menu.Item>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Current: <span className="font-medium">{currentProvider?.name}</span>
                </p>
                {currentProvider?.cost === 'free' && (
                  <span className="text-xs text-success-600 font-medium">
                    💰 No API costs
                  </span>
                )}
              </div>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}