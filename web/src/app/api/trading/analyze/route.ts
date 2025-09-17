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

Based on comprehensive data retrieved for ${request.ticker} as of ${request.analysis_date}, here is a detailed analysis:

## Trend Analysis:
- **Moving Averages:** Analyzing recent price action and momentum indicators for ${request.ticker}
- **Technical Indicators:** Current technical setup shows varying signals based on timeframe analysis

## Market Conditions:
- Recent price action for ${request.ticker} shows market-specific dynamics
- Volume and momentum patterns indicate current market sentiment for this asset
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
    
    state.report_sections.sentiment_report = `# Social Sentiment Analysis for ${request.ticker}

Based on recent social media activity and sentiment analysis for ${request.ticker}:

## Community Sentiment:
- Social media discussions showing mixed sentiment regarding ${request.ticker}
- Recent market dynamics have influenced retail investor perception
- Technical analysis discussions suggest varying opinions on current trend direction
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
    
    state.report_sections.news_report = `# News Analysis Report for ${request.ticker} – ${request.analysis_date}

## Recent News Impact:
- Latest news developments affecting ${request.ticker} and related market sectors
- Regulatory and industry-specific updates relevant to this asset

## Market Performance:
- Recent performance metrics for ${request.ticker} in context of broader market conditions
- Key events and announcements impacting price action and investor sentiment
`
    
    state.agent_status["News Analyst"] = "completed"
    state.current_report = state.report_sections.news_report
    await delay(1000)
  }
  
  // Fundamentals Analyst
  if (request.analysts.includes('fundamentals')) {
    state.agent_status["Fundamentals Analyst"] = "in_progress"
    state.messages.push({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'Reasoning',
      content: `Fundamentals Analyst: Analyzing fundamental metrics for ${request.ticker}...`
    })
    
    await delay(2000)
    
    state.report_sections.fundamentals_report = `# Fundamental Analysis for ${request.ticker}

Based on fundamental analysis of ${request.ticker} as of ${request.analysis_date}:

## Financial Metrics:
- Analyzing key performance indicators and valuation metrics for ${request.ticker}
- Revenue growth trends and profitability analysis
- Balance sheet strength and financial health indicators

## Valuation Assessment:
- Current valuation levels relative to historical norms and peer comparison
- Intrinsic value considerations based on fundamental factors
- Risk-adjusted return potential for ${request.ticker}
`
    
    state.agent_status["Fundamentals Analyst"] = "completed"
    state.current_report = state.report_sections.fundamentals_report
    await delay(1000)
  }
  
  // Research Team simulation
  state.agent_status["Bull Researcher"] = "in_progress"
  state.agent_status["Bear Researcher"] = "in_progress"
  state.agent_status["Research Manager"] = "in_progress"
  
  await delay(3000)
  
  state.report_sections.investment_plan = `# Research Team Decision for ${request.ticker}

## Bull Researcher Analysis
The Bull Researcher presents a compelling case for ${request.ticker} based on:
- Current technical momentum and trend analysis
- Favorable market conditions and catalysts
- Positive fundamental factors supporting the asset

## Bear Researcher Analysis  
The Bear Researcher highlights potential risks for ${request.ticker}:
- Technical resistance levels and overbought conditions
- Market headwinds and potential negative catalysts
- Risk factors specific to this asset class

## Research Manager Decision
After careful consideration of both perspectives, the Research Manager recommends a **balanced approach** with appropriate risk management protocols for ${request.ticker}.
`

  state.agent_status["Bull Researcher"] = "completed"
  state.agent_status["Bear Researcher"] = "completed"
  state.agent_status["Research Manager"] = "completed"
  state.agent_status["Trader"] = "completed"
  state.current_report = state.report_sections.investment_plan
  
  await delay(2000)
  
  // Risk Management Team analysis
  state.agent_status["Risky Analyst"] = "in_progress"
  state.agent_status["Neutral Analyst"] = "in_progress"
  state.agent_status["Safe Analyst"] = "in_progress"
  
  state.messages.push({
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    type: 'Reasoning',
    content: `Risk Management Team: Analyzing risk profiles and position sizing for ${request.ticker}...`
  })
  
  await delay(2000)
  
  state.agent_status["Risky Analyst"] = "completed"
  state.agent_status["Neutral Analyst"] = "completed"
  state.agent_status["Safe Analyst"] = "completed"
  
  state.messages.push({
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    type: 'Reasoning',
    content: `Risk Management Team: Completed risk assessment for ${request.ticker}`
  })
  
  await delay(1000)
  
  // Portfolio Manager final decision
  state.agent_status["Portfolio Manager"] = "in_progress"
  
  await delay(2000)
  
  state.report_sections.final_trade_decision = `# Portfolio Management Decision for ${request.ticker}

## Recommendation: Balanced Position Management

### Summary of Key Arguments

**Risky Analyst (Bull):**
- Technical indicators show favorable momentum for ${request.ticker}
- Current market conditions support continued price appreciation
- Fundamental factors remain supportive for this asset

**Safe Analyst (Bear):**  
- Risk factors suggest caution with current ${request.ticker} exposure
- Market conditions show potential headwinds ahead
- Valuation concerns warrant defensive positioning

**Neutral Analyst (Balanced):**
Both the Risky and Safe Analysts present valid perspectives. A balanced approach considers both upside potential and downside protection for ${request.ticker}.

### Rationale for Balanced Approach

Considering all analyst input, we recommend a **measured approach** that balances opportunity with risk management for ${request.ticker}.

**Defined Investment Plan:**

**Recommendation:** Maintain current ${request.ticker} allocation with tactical adjustments based on market conditions.
**Rationale:** This approach allows participation in potential upside while maintaining appropriate risk controls.
**Risk Management:** 
- Monitor key technical levels and market indicators
- Implement appropriate position sizing based on portfolio risk tolerance
- Maintain liquidity for tactical rebalancing opportunities

**Adjustment Triggers:**
- Technical breakout: Consider increasing allocation
- Risk-off conditions: Reduce exposure appropriately
- Fundamental changes: Reassess position based on new information
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