import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { PortfolioProvider } from '@/context/PortfolioContext'
import { LLMProviderProvider } from '@/context/LLMProviderContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TradingAgents - Crypto Analysis Dashboard',
  description: 'Multi-Agent LLM Cryptocurrency Trading Analysis Framework',
  keywords: 'crypto, trading, AI, agents, analysis, blockchain, bitcoin, ethereum',
  authors: [{ name: 'TradingAgents Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <PortfolioProvider>
          <LLMProviderProvider>
            <div className="min-h-screen">
              {children}
            </div>
          </LLMProviderProvider>
        </PortfolioProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}