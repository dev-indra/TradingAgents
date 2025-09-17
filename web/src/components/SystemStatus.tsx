'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline'

interface SystemHealth {
  tradingagents: 'healthy' | 'unhealthy' | 'unknown'
  mcpCrypto: 'healthy' | 'unhealthy' | 'unknown'
  mcpNews: 'healthy' | 'unhealthy' | 'unknown'
  redis: 'healthy' | 'unhealthy' | 'unknown'
  llmProvider?: 'healthy' | 'unhealthy' | 'unknown'
  llmProviderName?: string
}

interface SystemStatusProps {
  health: SystemHealth
}

const serviceNames = {
  tradingagents: 'Main App',
  mcpCrypto: 'Crypto MCP',
  mcpNews: 'News MCP',
  redis: 'Redis Cache',
  llmProvider: 'AI Provider'
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircleIcon className="h-4 w-4 text-success-500" />
    case 'unhealthy':
      return <XCircleIcon className="h-4 w-4 text-danger-500" />
    default:
      return <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
  }
}

const getOverallStatus = (health: SystemHealth) => {
  const statuses = Object.values(health)
  if (statuses.every(s => s === 'healthy')) return 'healthy'
  if (statuses.some(s => s === 'unhealthy')) return 'unhealthy'
  return 'unknown'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'bg-success-500'
    case 'unhealthy':
      return 'bg-danger-500'
    default:
      return 'bg-gray-400'
  }
}

export default function SystemStatus({ health }: SystemStatusProps) {
  const overallStatus = getOverallStatus(health)
  
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crypto-500">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(overallStatus)} animate-pulse`} />
            <span>System Status</span>
          </div>
          <ChevronDownIcon className="h-4 w-4" />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Service Health</h3>
            </div>
            
            <div className="space-y-1 p-2">
              {Object.entries(health).map(([service, status]) => {
                // Skip displaying llmProviderName as it's not a status field
                if (service === 'llmProviderName') return null
                
                return (
                  <div
                    key={service}
                    className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(status as string)}
                      <span className="text-sm font-medium text-gray-900">
                        {service === 'llmProvider' && health.llmProviderName
                          ? health.llmProviderName
                          : serviceNames[service as keyof typeof serviceNames]
                        }
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      status === 'healthy'
                        ? 'bg-success-100 text-success-800'
                        : status === 'unhealthy'
                        ? 'bg-danger-100 text-danger-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {status}
                    </span>
                  </div>
                )
              })}
            </div>
            
            <div className="px-4 py-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Updated every 30 seconds
              </p>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}