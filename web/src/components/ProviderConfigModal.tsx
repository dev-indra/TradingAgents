'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { HomeIcon, CloudIcon, CpuChipIcon, BoltIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useLLMProvider } from '@/context/LLMProviderContext'

interface ProviderConfigModalProps {
  isOpen: boolean
  onClose: () => void
  providerId?: string
}

interface ProviderConfig {
  openrouter_api_key?: string
  anthropic_api_key?: string  
  openai_api_key?: string
  lmstudio_base_url?: string
}

const providerIcons = {
  lmstudio: HomeIcon,
  openrouter: CloudIcon,
  anthropic: CpuChipIcon,
  openai: BoltIcon,
}

export default function ProviderConfigModal({ isOpen, onClose, providerId }: ProviderConfigModalProps) {
  const { providers, testConnection } = useLLMProvider()
  const [config, setConfig] = useState<ProviderConfig>({})
  const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({})
  const [isLoading, setIsLoading] = useState(false)

  const provider = providers.find(p => p.id === providerId)

  useEffect(() => {
    if (isOpen && providerId) {
      // Load existing configuration
      loadProviderConfig(providerId)
    }
  }, [isOpen, providerId])

  const loadProviderConfig = async (id: string) => {
    try {
      // In a real app, you'd fetch from your API/database
      // For now, we'll load from localStorage as a demo
      const savedConfig = localStorage.getItem(`provider-config-${id}`)
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    } catch (error) {
      console.error('Failed to load provider config:', error)
    }
  }

  const saveProviderConfig = async () => {
    if (!providerId) return

    setIsLoading(true)
    try {
      // Save configuration
      localStorage.setItem(`provider-config-${providerId}`, JSON.stringify(config))
      
      // Test connection with new config
      const success = await testConnection(providerId)
      
      if (success) {
        toast.success(`${provider?.name} configured successfully!`)
        onClose()
      } else {
        toast.error(`Configuration saved, but connection test failed. Please verify your settings.`)
      }
    } catch (error) {
      toast.error('Failed to save configuration')
      console.error('Config save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShowApiKey = (field: string) => {
    setShowApiKeys(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const renderConfigField = (
    key: keyof ProviderConfig, 
    label: string, 
    placeholder: string, 
    isSecret: boolean = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className={isSecret ? "relative" : ""}>
        <input
          type={isSecret && !showApiKeys[key] ? "password" : "text"}
          value={config[key] || ''}
          onChange={(e) => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-crypto-500 focus:border-crypto-500"
        />
        {isSecret && (
          <button
            type="button"
            onClick={() => toggleShowApiKey(key)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showApiKeys[key] ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        )}
      </div>
    </div>
  )

  const renderProviderConfig = () => {
    if (!provider) return null

    const Icon = providerIcons[provider.id as keyof typeof providerIcons] || CloudIcon

    switch (provider.id) {
      case 'lmstudio':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <HomeIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">LM Studio Setup</h3>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                <p>1. Download and install LM Studio from <a href="https://lmstudio.ai/" target="_blank" rel="noopener noreferrer" className="underline">lmstudio.ai</a></p>
                <p>2. Download a model (recommended: llama-3.1-8b-instruct)</p>
                <p>3. Load the model and click "Start Server"</p>
                <p>4. Keep LM Studio running in the background</p>
              </div>
            </div>
            
            {renderConfigField(
              'lmstudio_base_url',
              'LM Studio Server URL',
              'http://192.168.0.33:1234/v1'
            )}
            
            <div className="text-sm text-gray-600">
              <p><strong>💰 Cost:</strong> Free - runs on your hardware</p>
              <p><strong>⚡ Speed:</strong> Depends on your GPU/CPU</p>
              <p><strong>🔒 Privacy:</strong> Complete - data never leaves your machine</p>
            </div>
          </div>
        )

      case 'openrouter':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CloudIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-medium text-green-900">OpenRouter Setup</h3>
              </div>
              <div className="mt-2 text-sm text-green-700">
                <p>1. Sign up at <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a></p>
                <p>2. Add credits to your account</p>
                <p>3. Generate an API key from your dashboard</p>
              </div>
            </div>

            {renderConfigField(
              'openrouter_api_key',
              'OpenRouter API Key',
              'sk-or-...',
              true
            )}

            <div className="text-sm text-gray-600">
              <p><strong>💰 Cost:</strong> Pay-per-use (~$0.10-0.50 per analysis)</p>
              <p><strong>⚡ Speed:</strong> Fast API responses</p>
              <p><strong>🤖 Models:</strong> Claude, GPT-4, and many others</p>
            </div>
          </div>
        )

      case 'anthropic':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-medium text-purple-900">Anthropic Claude Setup</h3>
              </div>
              <div className="mt-2 text-sm text-purple-700">
                <p>1. Sign up at <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a></p>
                <p>2. Add credits to your account</p>
                <p>3. Generate an API key</p>
              </div>
            </div>

            {renderConfigField(
              'anthropic_api_key',
              'Anthropic API Key',
              'sk-ant-...',
              true
            )}

            <div className="text-sm text-gray-600">
              <p><strong>💰 Cost:</strong> Direct pricing (~$0.15-0.60 per analysis)</p>
              <p><strong>⚡ Speed:</strong> Fast responses</p>
              <p><strong>🧠 Quality:</strong> Excellent reasoning capabilities</p>
            </div>
          </div>
        )

      case 'openai':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <BoltIcon className="h-5 w-5 text-orange-600" />
                <h3 className="text-sm font-medium text-orange-900">OpenAI Setup</h3>
              </div>
              <div className="mt-2 text-sm text-orange-700">
                <p>1. Sign up at <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></p>
                <p>2. Add credits to your account</p>
                <p>3. Generate an API key</p>
              </div>
            </div>

            {renderConfigField(
              'openai_api_key',
              'OpenAI API Key',
              'sk-...',
              true
            )}

            <div className="text-sm text-gray-600">
              <p><strong>💰 Cost:</strong> Direct pricing (~$0.20-0.70 per analysis)</p>
              <p><strong>⚡ Speed:</strong> Very fast responses</p>
              <p><strong>🤖 Models:</strong> GPT-4, GPT-4 Turbo</p>
            </div>
          </div>
        )

      default:
        return <div>Configuration not available for this provider.</div>
    }
  }

  if (!provider) {
    return null
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="flex items-center justify-between text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const Icon = providerIcons[provider.id as keyof typeof providerIcons];
                      return <Icon className="h-5 w-5" />;
                    })()}
                    <span>Configure {provider.name}</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>

                <div className="space-y-6">
                  {renderProviderConfig()}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProviderConfig}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save & Test'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}