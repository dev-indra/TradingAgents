'use client'

import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useLLMProvider, useProviderConfiguration } from '@/context/LLMProviderContext'
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function ProviderStatusNotification() {
  const { selectedProvider, getCurrentProvider } = useLLMProvider()
  const { needsConfiguration, configurationMessage } = useProviderConfiguration()

  useEffect(() => {
    const provider = getCurrentProvider()
    if (!provider) return

    // Show status notifications when provider status changes
    switch (provider.status) {
      case 'connected':
        toast.success(
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-success-600" />
            <div>
              <p className="font-medium">{provider.name} Connected</p>
              {provider.cost === 'free' && (
                <p className="text-sm text-gray-600">💰 Zero API costs!</p>
              )}
            </div>
          </div>,
          {
            id: `provider-${provider.id}-connected`,
            duration: 3000,
          }
        )
        break

      case 'disconnected':
        toast.error(
          <div className="flex items-center space-x-2">
            <XCircleIcon className="h-5 w-5 text-danger-600" />
            <div>
              <p className="font-medium">{provider.name} Disconnected</p>
              <p className="text-sm text-gray-600">{configurationMessage}</p>
            </div>
          </div>,
          {
            id: `provider-${provider.id}-disconnected`,
            duration: 5000,
          }
        )
        break

      case 'testing':
        toast.loading(
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-crypto-600"></div>
            <p>Testing {provider.name} connection...</p>
          </div>,
          {
            id: `provider-${provider.id}-testing`,
          }
        )
        break
    }
  }, [selectedProvider, getCurrentProvider, configurationMessage])

  // Show configuration needed warning for disconnected paid providers
  useEffect(() => {
    if (needsConfiguration) {
      const provider = getCurrentProvider()
      if (provider && provider.cost === 'paid') {
        toast.error(
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />
            <div>
              <p className="font-medium">Configuration Required</p>
              <p className="text-sm text-gray-600">{configurationMessage}</p>
            </div>
          </div>,
          {
            id: `provider-${provider.id}-config-needed`,
            duration: 6000,
          }
        )
      }
    }
  }, [needsConfiguration, configurationMessage, getCurrentProvider])

  return null // This component only handles notifications
}