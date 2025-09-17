import { NextRequest, NextResponse } from 'next/server'

export interface AnalysisRequest {
  ticker: string
  analysis_date: string
  analysts: string[]
  research_depth: number
  llm_provider: string
  backend_url?: string
  shallow_model: string
  deep_model: string
}

export interface AgentStatus {
  [key: string]: 'pending' | 'in_progress' | 'completed' | 'error'
}

export interface MessageEntry {
  timestamp: string
  type: 'Tool' | 'Reasoning' | 'System' | 'Analysis'
  content: string
}

export interface AnalysisState {
  agent_status: AgentStatus
  messages: MessageEntry[]
  tool_calls: Array<{
    timestamp: string
    tool_name: string
    args: Record<string, any>
  }>
  report_sections: {
    market_report?: string
    sentiment_report?: string
    news_report?: string
    fundamentals_report?: string
    investment_plan?: string
    trader_investment_plan?: string
    final_trade_decision?: string
  }
  current_report?: string
  final_report?: string
  is_complete: boolean
}

// Store for active analysis sessions
const activeSessions = new Map<string, AnalysisState>()

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()
    
    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Initialize session state
    const initialState: AnalysisState = {
      agent_status: {
        "Market Analyst": "pending",
        "Social Analyst": "pending",
        "News Analyst": "pending",
        "Fundamentals Analyst": "pending",
        "Bull Researcher": "pending",
        "Bear Researcher": "pending",
        "Research Manager": "pending",
        "Trader": "pending",
        "Risky Analyst": "pending",
        "Neutral Analyst": "pending",
        "Safe Analyst": "pending",
        "Portfolio Manager": "pending"
      },
      messages: [
        {
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          type: 'System',
          content: `Starting analysis for ${body.ticker} on ${body.analysis_date}`
        },
        {
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          type: 'System',
          content: `Selected analysts: ${body.analysts.join(', ')}`
        }
      ],
      tool_calls: [],
      report_sections: {},
      is_complete: false
    }
    
    activeSessions.set(sessionId, initialState)
    
    // Start the analysis in the background
    startAnalysis(sessionId, body)
    
    return NextResponse.json({ 
      success: true, 
      sessionId,
      message: 'Analysis started successfully'
    })
    
  } catch (error) {
    console.error('Analysis request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to start analysis' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }
  
  const state = activeSessions.get(sessionId)
  if (!state) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  
  return NextResponse.json(state)
}

async function startAnalysis(sessionId: string, request: AnalysisRequest) {
  const state = activeSessions.get(sessionId)
  if (!state) return
  
  try {
    // This would integrate with your Python CLI logic
    // For now, we'll simulate the analysis process
    await simulateAnalysis(sessionId, request)
    
  } catch (error) {
    console.error('Analysis error:', error)
    const state = activeSessions.get(sessionId)
    if (state) {
      state.messages.push({
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'System',
        content: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
      state.is_complete = true
    }
  }
}

async function simulateAnalysis(sessionId: string, request: AnalysisRequest) {
  const state = activeSessions.get(sessionId)
  if (!state) return
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  // Simulate Market Analyst
  state.agent_status["Market Analyst"] = "in_progress"
  state.messages.push({
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    type: 'Reasoning',
    content: `Market Analyst: Analyzing ${request.ticker} market data...`
  })
  
  await delay(2000)
  
  state.tool_calls.push({
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    tool_name: 'get_stock_news_openai',
    args: { ticker: request.ticker, curr_date: request.analysis_date }
  })
  
  await delay(1000)
  
  state.report_sections.market_report = `# Market Analysis for ${request.ticker}

Based on comprehensive data retrieved for ${request.ticker} from May 6, 2024, to June 5, 2025, here is a detailed analysis:

## Trend Analysis:
- **Moving Averages (50 SMA and 200 SMA):** The 50 SMA has been gradually increasing from approximately 554.59 to 562.48, indicating a steady medium-term upward trend.
- **MACD:** The MACD value has increased but not directly provided but inferred from the VWAP (Volume Weighted Average Price) suggests increasing momentum.

## Market Conditions:
- The market exhibits a steady upward trend with strong momentum confirmed by MACD and RSI.
- Current position relative to both the 50- and 200-day moving averages suggests sustained bullish momentum.
`
  
  state.agent_status["Market Analyst"] = "completed"
  state.current_report = state.report_sections.market_report
  
  // Continue with other agents...
  await delay(1000)
  
  // Social Analyst
  if (request.analysts.includes('social')) {
    state.agent_status["Social Analyst"] = "in_progress"
    state.messages.push({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'Reasoning',
      content: `Social Analyst: Analyzing sentiment for ${request.ticker}...`
    })
    
    await delay(2000)
    
    state.report_sections.sentiment_report = `# Social Sentiment Analysis

Over the past week (May 29 to June 5, 2025), discussions on social media platforms have highlighted the interplay between SPY and Tesla Inc. (TSLA).

## Reddit Activity:
- Recent data shows a contraction in the U.S. services sector for May, the first in nearly a year, alongside signs of slowing labor market growth.
- Technical analysis suggests SPY remains in a bullish trend, with some analysts recommending buying on dips.
`
    
    state.agent_status["Social Analyst"] = "completed"
    state.current_report = state.report_sections.sentiment_report
    await delay(1000)
  }
  
  // News Analyst
  if (request.analysts.includes('news')) {
    state.agent_status["News Analyst"] = "in_progress"
    state.messages.push({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'Reasoning',
      content: `News Analyst: Gathering and analyzing news for ${request.ticker}...`
    })
    
    await delay(2000)
    
    state.report_sections.news_report = `# Comprehensive Analysis Report for SPDR S&P 500 ETF Trust (SPY) – Week Ending June 5, 2025

## Macroeconomic Environment:
- **U.S. Economy:** Recent data shows a contraction in the U.S. services sector for May, the first in nearly a year, alongside signs of slowing labor market growth.
- **Global Disinflation:** below-target inflation globally, with recent inflows of approximately $2.6 billion.

## Market Performance:
- Despite mixed economic signals, global equity markets, including U.S. indices, have reached record highs.
`
    
    state.agent_status["News Analyst"] = "completed"
    state.current_report = state.report_sections.news_report
    await delay(1000)
  }
  
  // Research Team simulation
  state.agent_status["Bull Researcher"] = "in_progress"
  state.agent_status["Bear Researcher"] = "in_progress"
  state.agent_status["Research Manager"] = "in_progress"
  
  await delay(3000)
  
  state.report_sections.investment_plan = `# Research Team Decision

## Bull Researcher Analysis
The Bull Researcher presents a compelling case for SPY based on:
- Strong technical momentum with moving averages trending upward
- Fed rate cut expectations providing tailwinds
- Continued institutional inflows supporting price action

## Bear Researcher Analysis  
The Bear Researcher highlights potential risks:
- Services sector contraction signaling economic slowdown
- Elevated valuations increasing vulnerability to corrections
- Geopolitical tensions creating uncertainty

## Research Manager Decision
After careful consideration of both perspectives, the Research Manager recommends a **moderate bullish** position with risk management protocols.
`

  state.agent_status["Bull Researcher"] = "completed"
  state.agent_status["Bear Researcher"] = "completed"
  state.agent_status["Research Manager"] = "completed"
  state.agent_status["Trader"] = "completed"
  state.current_report = state.report_sections.investment_plan
  
  await delay(2000)
  
  // Portfolio Manager final decision
  state.agent_status["Portfolio Manager"] = "in_progress"
  
  await delay(2000)
  
  state.report_sections.final_trade_decision = `# Portfolio Management Decision

## Recommendation: Sell (trim SPY exposure by ~25-30%)

### Summary of Key Arguments

**Risky Analyst (Bull):**
- Price is above both the 50- and 200-day SMAs, MACD is positive and rising, and RSI at 64.35 is comfortably below overbought.
- Fed cuts priced in, global disinflation and weaker dollar are tailwinds that can fuel multiple expansion.
- Recent $2.6 billion inflows into SPY underscore ongoing investor confidence.

**Safe Analyst (Bear):**  
- Services sector contraction and slowing labor market growth signal a real economic slowdown that will pressure corporate earnings.
- SPY's 25% P/E is above long-term averages, with pockets at 32.46% heightening vulnerability to corrections.
- Geopolitical tensions and speculative social-media froth can trigger sudden reversals; capital preservation through bonds, cash, and hedges is prudent.

**Neutral Analyst (Balanced):**
Both the Risky and Safe Analysts bring valid points to the table, but each leans too far in their respective directions, which could lead to suboptimal outcomes if...

### Rationale for a Moderate Sell

We agree with the Safe Analyst that "elevated valuations increase vulnerability" and with the Risky Analyst that strong technicals and expected Fed easing support further upside. The Neutral compromise—trimming 20-30% of SPY—captures gains, yet leaves room to participate if bullish forces persist.

**Defined Investment Plan:**

**Recommendation:** Sell 25-30% of current SPY holdings this week via limit orders near today's levels.
**Rationale:** This scaling back locks in partial gains and reduces concentration without forgoing a majority of upside should the technical uptrend and Fed-easing narrative hold.
**Deployment:** 
- 50-20% into laddered U.S. Treasuries or high-grade corporates (2-5 year maturities) for yield and ballast.
- 30-20% in cash or a stable-value fund to maintain powder for tactical redeployment on a 5-8% SPY pullback.
- 15-20% in a cost-effective put spread (2-3 months out, ~3% below spot) to hedge remaining SPY exposure.

**Re-Entry Triggers:**
- SPY falls 5%: Redeploy 25% of cash and cost-effective hedges.
- SPY falls 8%: Redeploy 50% of cash.
- A dovish pivot from the Fed accompanied by stronger ISM/non-jobs data: Consider full redeployment.

On any trigger, redeploy gradually across 2-4 trading sessions to avoid single-day concentration risks.
`

  state.agent_status["Portfolio Manager"] = "completed"
  state.current_report = state.report_sections.final_trade_decision
  
  // Mark analysis as complete
  state.is_complete = true
  state.messages.push({
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    type: 'Analysis',
    content: `Completed analysis for ${request.ticker} on ${request.analysis_date}`
  })
  
  // Build final report
  state.final_report = buildFinalReport(state.report_sections)
}

function buildFinalReport(sections: AnalysisState['report_sections']): string {
  const parts = []
  
  if (sections.market_report || sections.sentiment_report || sections.news_report || sections.fundamentals_report) {
    parts.push('## Analyst Team Reports')
    if (sections.market_report) parts.push(`### Market Analysis\n${sections.market_report}`)
    if (sections.sentiment_report) parts.push(`### Social Sentiment\n${sections.sentiment_report}`)
    if (sections.news_report) parts.push(`### News Analysis\n${sections.news_report}`)
    if (sections.fundamentals_report) parts.push(`### Fundamentals Analysis\n${sections.fundamentals_report}`)
  }
  
  if (sections.investment_plan) {
    parts.push('## Research Team Decision')
    parts.push(sections.investment_plan)
  }
  
  if (sections.trader_investment_plan) {
    parts.push('## Trading Team Plan')
    parts.push(sections.trader_investment_plan)
  }
  
  if (sections.final_trade_decision) {
    parts.push('## Portfolio Management Decision')
    parts.push(sections.final_trade_decision)
  }
  
  return parts.join('\n\n')
}