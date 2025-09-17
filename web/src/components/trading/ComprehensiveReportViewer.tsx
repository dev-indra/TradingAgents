'use client'

import { ArrowLeftIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

interface ComprehensiveReportViewerProps {
  report: string
  onBack: () => void
}

const parseMarkdown = (text: string) => {
  // Enhanced markdown parsing for comprehensive reports
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-blue-200">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 pb-3 border-b-4 border-blue-300 bg-gradient-to-r from-blue-50 to-transparent pl-4 -ml-4 pr-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-8 pb-4 border-b-4 border-gray-300">$1</h1>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-gray-700">$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 bg-yellow-100 px-1 py-0.5 rounded">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-6 text-gray-800 leading-relaxed">')
  
  // Wrap in paragraphs and handle lists
  html = '<p class="mb-6 text-gray-800 leading-relaxed">' + html + '</p>'
  html = html.replace(/<li class="ml-4 mb-2 text-gray-700">(.*?)<\/li>/g, '<li class="ml-4 mb-2 text-gray-700 list-disc">$1</li>')
  html = html.replace(/(<li class="ml-4 mb-2 text-gray-700 list-disc">.*?<\/li>)/gs, '<ul class="space-y-2 mb-6 ml-4">$1</ul>')
  
  return html
}

const downloadReport = (report: string) => {
  const element = document.createElement('a')
  const file = new Blob([report], { type: 'text/markdown' })
  element.href = URL.createObjectURL(file)
  element.download = `trading-analysis-${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

const printReport = () => {
  window.print()
}

export default function ComprehensiveReportViewer({ report, onBack }: ComprehensiveReportViewerProps) {
  const parsedReport = parseMarkdown(report)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Non-printable */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">Complete Analysis Report</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={printReport}
              className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Print</span>
            </button>
            
            <button
              onClick={() => downloadReport(report)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Report Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 print:shadow-none print:border-none">
          {/* Print Header */}
          <div className="hidden print:block p-8 border-b border-gray-200 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TradingAgents Analysis Report</h1>
            <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="p-8 print:p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: parsedReport }}
            />
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:p-8 {
            padding: 2rem !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          h1, h2, h3 {
            break-after: avoid;
          }
          p, li {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}