'use client'

import { DocumentTextIcon } from '@heroicons/react/24/outline'

interface CurrentReportPanelProps {
  currentReport?: string
  isAnalysisRunning: boolean
}

const parseMarkdown = (text: string) => {
  // Simple markdown parsing for basic formatting
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
  
  // Wrap in paragraphs and handle lists
  html = '<p class="mb-4">' + html + '</p>'
  html = html.replace(/<li class="ml-4">(.*?)<\/li>/g, '<li class="ml-4 list-disc">$1</li>')
  html = html.replace(/(<li class="ml-4 list-disc">.*?<\/li>)/gs, '<ul class="space-y-1 mb-4">$1</ul>')
  
  return html
}

export default function CurrentReportPanel({ currentReport, isAnalysisRunning }: CurrentReportPanelProps) {
  const hasReport = currentReport && currentReport.trim().length > 0
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Current Report</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {hasReport ? (
          <div className="p-6">
            <div 
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(currentReport) }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              {isAnalysisRunning ? (
                <>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-blue-600">Generating analysis...</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Reports will appear here as agents complete their analysis
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Analyze
                  </p>
                  <p className="text-sm text-gray-500">
                    Start a new analysis to see real-time reports from our AI agents
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}