'use client'

import { useState, useEffect, useRef } from 'react'
import { ChartBarIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline'
import { AnalysisRequest, AnalysisState } from '@/app/api/trading/analyze/route'
import AgentProgressPanel from './trading/AgentProgressPanel'
import MessagesPanel from './trading/MessagesPanel'
import CurrentReportPanel from './trading/CurrentReportPanel'
import ComprehensiveReportViewer from './trading/ComprehensiveReportViewer'
import AnalysisConfigModal from './trading/AnalysisConfigModal'

interface TradingDashboardProps {
  onBack?: () => void
}

export default function TradingDashboard({ onBack }: TradingDashboardProps) {
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false)
  const [analysisState, setAnalysisState] = useState<AnalysisState | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showCompleteReport, setShowCompleteReport] = useState(false)
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])
  
  const startAnalysis = async (config: AnalysisRequest) => {
    try {
      setIsAnalysisRunning(true)
      setShowConfigModal(false)
      
      const response = await fetch('/api/trading/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSessionId(result.sessionId)
        startPolling(result.sessionId)
      } else {
        throw new Error(result.error || 'Failed to start analysis')
      }
      
    } catch (error) {
      console.error('Failed to start analysis:', error)
      setIsAnalysisRunning(false)
      // You could show an error toast here
    }
  }
  
  const startPolling = (sessionId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/trading/analyze?sessionId=${sessionId}`)
        const state: AnalysisState = await response.json()
        
        setAnalysisState(state)
        
        if (state.is_complete) {
          setIsAnalysisRunning(false)
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 1000)
  }
  
  const stopAnalysis = () => {
    setIsAnalysisRunning(false)
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setSessionId(null)
    setAnalysisState(null)
  }
  
  const handleViewCompleteReport = () => {
    setShowCompleteReport(true)
  }
  
  if (showCompleteReport && analysisState?.final_report) {
    return (
      <ComprehensiveReportViewer 
        report={analysisState.final_report}
        onBack={() => setShowCompleteReport(false)}
      />
    )
  }
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TradingAgents CLI</h1>
                <p className="text-sm text-gray-500">Multi-Agents LLM Financial Trading Framework</p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {!isAnalysisRunning ? (
              <button
                onClick={() => setShowConfigModal(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Start Analysis</span>
              </button>
            ) : (
              <button
                onClick={stopAnalysis}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopIcon className="w-4 h-4" />
                <span>Stop Analysis</span>
              </button>
            )}
            
            {analysisState?.is_complete && (
              <button
                onClick={handleViewCompleteReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Complete Report
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 h-full overflow-hidden">
        {/* Left Column - Progress & Messages */}
        <div className="col-span-5 flex flex-col space-y-6 h-full overflow-hidden">
          {/* Agent Progress */}
          <div className="flex-1 min-h-0">
            <AgentProgressPanel 
              agentStatus={analysisState?.agent_status || {}}
              isRunning={isAnalysisRunning}
            />
          </div>
          
          {/* Messages & Tools */}
          <div className="flex-1 min-h-0">
            <MessagesPanel 
              messages={analysisState?.messages || []}
              toolCalls={analysisState?.tool_calls || []}
            />
          </div>
        </div>
        
        {/* Right Column - Current Report */}
        <div className="col-span-7 h-full overflow-hidden">
          <CurrentReportPanel 
            currentReport={analysisState?.current_report}
            isAnalysisRunning={isAnalysisRunning}
          />
        </div>
      </div>
      
      {/* Footer Stats */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-center">
          <div className="text-sm text-gray-500">
            Tool Calls: {analysisState?.tool_calls.length || 0} | 
            LLM Calls: {analysisState?.messages.filter(m => m.type === 'Reasoning').length || 0} | 
            Generated Reports: {Object.values(analysisState?.report_sections || {}).filter(Boolean).length || 0}
          </div>
        </div>
      </div>
      
      {/* Analysis Configuration Modal */}
      <AnalysisConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSubmit={startAnalysis}
      />
    </div>
  )
}