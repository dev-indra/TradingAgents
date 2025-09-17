'use client'

import { AgentStatus } from '@/app/api/trading/analyze/route'
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface AgentProgressPanelProps {
  agentStatus: AgentStatus
  isRunning: boolean
}

interface Team {
  name: string
  color: string
  agents: string[]
}

const teams: Team[] = [
  {
    name: 'Analyst Team',
    color: 'cyan',
    agents: ['Market Analyst', 'Social Analyst', 'News Analyst', 'Fundamentals Analyst']
  },
  {
    name: 'Research Team',
    color: 'magenta',
    agents: ['Bull Researcher', 'Bear Researcher', 'Research Manager']
  },
  {
    name: 'Trading Team',
    color: 'yellow',
    agents: ['Trader']
  },
  {
    name: 'Risk Management',
    color: 'red',
    agents: ['Risky Analyst', 'Neutral Analyst', 'Safe Analyst']
  },
  {
    name: 'Portfolio Management',
    color: 'green',
    agents: ['Portfolio Manager']
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />
    case 'in_progress':
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )
    case 'error':
      return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
    default:
      return <ClockIcon className="w-4 h-4 text-yellow-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600'
    case 'in_progress':
      return 'text-blue-600'
    case 'error':
      return 'text-red-600'
    default:
      return 'text-yellow-600'
  }
}

const getTeamBorderColor = (teamColor: string) => {
  switch (teamColor) {
    case 'cyan':
      return 'border-l-cyan-500'
    case 'magenta':
      return 'border-l-pink-500'
    case 'yellow':
      return 'border-l-yellow-500'
    case 'red':
      return 'border-l-red-500'
    case 'green':
      return 'border-l-green-500'
    default:
      return 'border-l-gray-500'
  }
}

export default function AgentProgressPanel({ agentStatus, isRunning }: AgentProgressPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Progress</h3>
        {isRunning && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            <span className="text-xs text-blue-600">Running</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {teams.map((team, teamIndex) => (
            <div key={team.name} className={`border-l-4 ${getTeamBorderColor(team.color)} pl-4 space-y-2`}>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {team.name}
              </h4>
              
              <div className="space-y-1">
                {team.agents.map((agent, agentIndex) => {
                  const status = agentStatus[agent] || 'pending'
                  return (
                    <div key={agent} className="flex items-center justify-between py-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className="text-sm text-gray-700">{agent}</span>
                      </div>
                      <span className={`text-xs font-medium capitalize ${getStatusColor(status)}`}>
                        {status === 'in_progress' ? 'Running' : status}
                      </span>
                    </div>
                  )
                })}
              </div>
              
              {/* Add a subtle divider between teams except for the last one */}
              {teamIndex < teams.length - 1 && (
                <div className="border-b border-gray-100 pt-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}