'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AnalysisRequest } from '@/app/api/trading/analyze/route'

interface AnalysisConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (config: AnalysisRequest) => void
}

const analystOptions = [
  { id: 'market', name: 'Market Analyst', description: 'Technical and market data analysis' },
  { id: 'social', name: 'Social Analyst', description: 'Social sentiment and community analysis' },
  { id: 'news', name: 'News Analyst', description: 'News and media sentiment analysis' },
  { id: 'fundamentals', name: 'Fundamentals Analyst', description: 'Financial fundamentals and company analysis' }
]

const providerOptions = [
  { id: 'lmstudio', name: 'LM Studio', defaultUrl: 'http://localhost:1234' },
  { id: 'openrouter', name: 'OpenRouter', defaultUrl: '' },
  { id: 'anthropic', name: 'Anthropic', defaultUrl: '' },
  { id: 'openai', name: 'OpenAI', defaultUrl: '' }
]

const modelOptions = {
  lmstudio: ['llama-3.2-3b-instruct', 'llama-3.1-8b-instruct', 'qwen2.5-7b-instruct'],
  openrouter: ['anthropic/claude-3-5-sonnet-20241022', 'openai/gpt-4o', 'meta-llama/llama-3.1-8b-instruct'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']
}

export default function AnalysisConfigModal({ isOpen, onClose, onSubmit }: AnalysisConfigModalProps) {
  const [ticker, setTicker] = useState('SPY')
  const [analysisDate, setAnalysisDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedAnalysts, setSelectedAnalysts] = useState<string[]>(['market', 'social', 'news', 'fundamentals'])
  const [researchDepth, setResearchDepth] = useState(3)
  const [llmProvider, setLlmProvider] = useState('lmstudio')
  const [backendUrl, setBackendUrl] = useState('http://localhost:1234')
  const [shallowModel, setShallowModel] = useState('llama-3.2-3b-instruct')
  const [deepModel, setDeepModel] = useState('llama-3.2-3b-instruct')

  const handleProviderChange = (provider: string) => {
    setLlmProvider(provider)
    const providerConfig = providerOptions.find(p => p.id === provider)
    setBackendUrl(providerConfig?.defaultUrl || '')
    
    // Set default models for the provider
    const models = modelOptions[provider as keyof typeof modelOptions] || []
    if (models.length > 0) {
      setShallowModel(models[0])
      setDeepModel(models[0])
    }
  }

  const handleAnalystToggle = (analystId: string) => {
    setSelectedAnalysts(prev => 
      prev.includes(analystId)
        ? prev.filter(id => id !== analystId)
        : [...prev, analystId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const config: AnalysisRequest = {
      ticker: ticker.toUpperCase(),
      analysis_date: analysisDate,
      analysts: selectedAnalysts,
      research_depth: researchDepth,
      llm_provider: llmProvider,
      backend_url: backendUrl || undefined,
      shallow_model: shallowModel,
      deep_model: deepModel
    }
    
    onSubmit(config)
  }

  const availableModels = modelOptions[llmProvider as keyof typeof modelOptions] || []

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Configure Trading Analysis
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-md p-2 hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ticker Symbol
                      </label>
                      <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SPY"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Analysis Date
                      </label>
                      <input
                        type="date"
                        value={analysisDate}
                        onChange={(e) => setAnalysisDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Analyst Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Analysts
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {analystOptions.map((analyst) => (
                        <label key={analyst.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedAnalysts.includes(analyst.id)}
                            onChange={() => handleAnalystToggle(analyst.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900">{analyst.name}</div>
                            <div className="text-sm text-gray-500">{analyst.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Research Depth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Depth: {researchDepth} rounds
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={researchDepth}
                      onChange={(e) => setResearchDepth(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Quick (1)</span>
                      <span>Thorough (5)</span>
                    </div>
                  </div>

                  {/* LLM Provider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LLM Provider
                    </label>
                    <select
                      value={llmProvider}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {providerOptions.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Backend URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backend URL (optional)
                    </label>
                    <input
                      type="url"
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="http://localhost:1234"
                    />
                  </div>

                  {/* Model Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shallow Thinking Model
                      </label>
                      <select
                        value={shallowModel}
                        onChange={(e) => setShallowModel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableModels.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deep Thinking Model
                      </label>
                      <select
                        value={deepModel}
                        onChange={(e) => setDeepModel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableModels.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={selectedAnalysts.length === 0}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Start Analysis
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}