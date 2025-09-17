'use client'

import { MessageEntry } from '@/app/api/trading/analyze/route'
import { WrenchScrewdriverIcon, ChatBubbleLeftRightIcon, ComputerDesktopIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef } from 'react'

interface MessagesPanelProps {
  messages: MessageEntry[]
  toolCalls: Array<{
    timestamp: string
    tool_name: string
    args: Record<string, any>
  }>
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Tool':
      return <WrenchScrewdriverIcon className="w-4 h-4 text-orange-500" />
    case 'Reasoning':
      return <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-500" />
    case 'System':
      return <ComputerDesktopIcon className="w-4 h-4 text-gray-500" />
    case 'Analysis':
      return <ChartBarIcon className="w-4 h-4 text-green-500" />
    default:
      return <ComputerDesktopIcon className="w-4 h-4 text-gray-500" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Tool':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'Reasoning':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'System':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'Analysis':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const truncateText = (text: string, maxLength: number = 200) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

const formatToolArgs = (args: Record<string, any>) => {
  return Object.entries(args)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(', ')
}

export default function MessagesPanel({ messages, toolCalls }: MessagesPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, toolCalls])
  
  // Combine messages and tool calls, then sort by timestamp
  const allEntries = [
    ...messages.map(msg => ({ ...msg, entryType: 'message' as const })),
    ...toolCalls.map(tool => ({
      timestamp: tool.timestamp,
      type: 'Tool' as const,
      content: `${tool.tool_name}: ${formatToolArgs(tool.args)}`,
      entryType: 'tool' as const
    }))
  ].sort((a, b) => {
    // Simple time comparison - in a real app you might want more robust timestamp parsing
    return a.timestamp.localeCompare(b.timestamp)
  })
  
  // Show only the most recent entries to avoid performance issues
  const recentEntries = allEntries.slice(-50)
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Messages & Tools</h3>
        {allEntries.length > 50 && (
          <p className="text-xs text-gray-500 mt-1">
            Showing last 50 of {allEntries.length} entries
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="p-2 space-y-2">
          {recentEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Messages and tool calls will appear here</p>
            </div>
          ) : (
            recentEntries.map((entry, index) => (
              <div key={index} className="flex space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0 pt-1">
                  {getTypeIcon(entry.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{entry.timestamp}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getTypeColor(entry.type)}`}>
                      {entry.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {entry.entryType === 'tool' ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                        {truncateText(entry.content, 150)}
                      </code>
                    ) : (
                      truncateText(entry.content)
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}