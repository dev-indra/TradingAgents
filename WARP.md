# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TradingAgents is a multi-agent trading framework that mirrors the dynamics of real-world trading firms. **Now optimized for cryptocurrency trading** with containerized deployment. It deploys specialized LLM-powered agents (fundamental analysts, sentiment experts, technical analysts, traders, and risk management teams) that collaboratively evaluate market conditions and inform trading decisions through dynamic discussions.

**Key Technologies:**
- **Docker & MCP Architecture**: Containerized deployment with Model Context Protocol servers
- **OpenRouter Integration**: Unified access to multiple LLM providers (Claude, GPT-4, etc.)
- **Crypto-focused**: CoinGecko, Binance, Fear & Greed Index, crypto news sentiment
- **LangGraph**: Agent orchestration and workflow management
- **Redis**: Caching and state management
- **Python 3.11+** with extensive crypto trading libraries

## Architecture

### Core Components

**1. Agent System (`tradingagents/agents/`)**
The framework follows a multi-agent architecture with specialized roles:

- **Analysts** (`analysts/`): Market, news, social media, and fundamentals analysts
- **Researchers** (`researchers/`): Bull and bear researchers who debate analysis findings
- **Trader** (`trader/`): Makes trading decisions based on collective insights
- **Risk Management** (`risk_mgmt/`): Conservative, aggressive, and neutral risk assessors
- **Managers** (`managers/`): Research and risk managers that coordinate decisions

**2. Graph Orchestration (`tradingagents/graph/`)**
- `trading_graph.py`: Main orchestration class that coordinates all agents
- `setup.py`: Graph configuration and node initialization
- `propagation.py`: Handles state propagation through the agent network
- `conditional_logic.py`: Decision flow control between agents
- `reflection.py`: Learning and memory management
- `signal_processing.py`: Trade signal processing and interpretation

**3. MCP Server Architecture (`mcp/`)**
Model Context Protocol servers provide specialized data services:
- **Crypto Server** (`mcp/crypto/`): CoinGecko, Binance APIs, technical indicators
- **News Server** (`mcp/news/`): Crypto news, Reddit sentiment, Fear & Greed index
- **HTTP-based**: RESTful APIs with JSON responses
- **Containerized**: Independent Docker containers with health checks

**4. Data Flows (`tradingagents/dataflows/`)**
Crypto-focused data access with MCP integration:
- **Market data**: CoinGecko prices, Binance order books, technical indicators
- **News & sentiment**: Crypto news feeds, Reddit analysis, Fear & Greed index
- **Social data**: Twitter sentiment, Reddit discussions, market sentiment
- **Caching**: Redis-based caching for API rate limiting

**5. Memory & State Management**
Enhanced with Redis and persistent storage:
- `FinancialSituationMemory` for agent learning
- Redis caching for crypto data
- JSON state logging for debugging
- Multi-crypto portfolio tracking

### Agent Interaction Flow

1. **Analysis Phase**: Specialized analysts gather and analyze domain-specific data
2. **Research Phase**: Bull/bear researchers debate the findings through structured discussions
3. **Trading Phase**: Trader synthesizes insights and proposes trading actions
4. **Risk Assessment**: Risk management team evaluates proposals
5. **Final Decision**: Portfolio manager approves/rejects based on comprehensive analysis

## Common Commands

### Docker Deployment (Recommended)
```bash
# Setup environment file
cp .env.example .env
# Edit .env with your API keys

# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f tradingagents

# Stop all services
docker-compose down
```

### Local Development Setup
```bash
# Create virtual environment
conda create -n tradingagents python=3.11
conda activate tradingagents

# Install dependencies
pip install -r requirements.txt

# Start local Redis (required)
docker run -d -p 6379:6379 redis:7-alpine

# Start MCP servers
python mcp/crypto/server.py &
python mcp/news/server.py &
```

### Required Environment Variables
```bash
# OpenRouter API for LLMs
export OPENROUTER_API_KEY=$YOUR_OPENROUTER_API_KEY

# Crypto data sources
export COINGECKO_API_KEY=$YOUR_COINGECKO_API_KEY
export BINANCE_API_KEY=$YOUR_BINANCE_API_KEY

# News and sentiment
export NEWS_API_KEY=$YOUR_NEWS_API_KEY
export REDDIT_CLIENT_ID=$YOUR_REDDIT_CLIENT_ID

# Optional: Custom directories
export TRADINGAGENTS_RESULTS_DIR=./results
export TRADINGAGENTS_DATA_DIR=./data
```

### Running the Framework

**Docker (Recommended):**
```bash
# All-in-one crypto trading analysis
docker-compose up

# Access logs from main container
docker-compose exec tradingagents python main.py
```

**CLI Interface:**
```bash
# Interactive CLI with crypto focus
python -m cli.main

# Docker CLI
docker-compose exec tradingagents python -m cli.main
```

**Programmatic Usage (Crypto):**
```python
# Crypto trading with OpenRouter
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

# Default config now uses crypto mode and OpenRouter
config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "anthropic/claude-3.5-sonnet"
config["quick_think_llm"] = "openai/gpt-4o-mini"  # Cost-effective
config["trading_mode"] = "crypto"
config["use_mcp_servers"] = True

ta = TradingAgentsGraph(debug=True, config=config)
state, decision = ta.propagate("BTC", "2024-12-15")  # Crypto symbols
print(f"Decision for Bitcoin: {decision}")

# Multi-crypto analysis
cryptos = ["BTC", "ETH", "SOL", "AVAX"]
for crypto in cryptos:
    _, decision = ta.propagate(crypto, "2024-12-15")
    print(f"{crypto}: {decision}")
```

### Development Workflow

**Code Structure:**
- Main framework entry: `main.py`
- CLI interface: `cli/main.py`
- Configuration: `tradingagents/default_config.py`
- Agent definitions: `tradingagents/agents/`
- Graph logic: `tradingagents/graph/`
- Data interfaces: `tradingagents/dataflows/`

**Configuration Management:**
All configuration is centralized in `default_config.py`. Key settings include:
- LLM provider and models (OpenAI, Google, Anthropic)
- Debate rounds and discussion limits
- Online vs cached data sources
- Results and data directories

**Memory and State Management:**
Each agent maintains persistent memory through `FinancialSituationMemory`. States are logged to JSON files for analysis and debugging.

## Important Implementation Notes

### OpenRouter LLM Integration
The framework now defaults to OpenRouter for unified access to multiple LLM providers:
- **Cost-effective**: Access to both OpenAI and Anthropic models through one API
- **Model flexibility**: Easy switching between `gpt-4o-mini`, `claude-3.5-sonnet`, etc.
- **Rate limiting**: OpenRouter handles provider rate limits automatically
- **API key**: Only requires `OPENROUTER_API_KEY` environment variable

### MCP Server Architecture
**Crypto MCP Server** (`mcp/crypto/`):
- CoinGecko integration for price data and market metrics
- Binance API for order book and trading data
- Technical indicators calculation (RSI, SMA, etc.)
- Independent Docker container with health checks

**News MCP Server** (`mcp/news/`):
- Multi-source crypto news aggregation
- Reddit sentiment analysis for crypto discussions
- Fear & Greed index integration
- TextBlob-based sentiment scoring

### Docker Deployment
**Container Services**:
- `tradingagents`: Main application container
- `mcp-crypto`: Cryptocurrency data MCP server
- `mcp-news`: News and sentiment MCP server
- `redis`: Caching and state management
- `web-ui`: Optional web interface

**Volume Persistence**:
- `./results`: Trading analysis results
- `./data`: Cached crypto data
- `./logs`: Application logs

### Crypto Trading Specifics
**Supported Assets**:
```python
["BTC", "ETH", "BNB", "XRP", "ADA", "DOGE", "MATIC", "SOL", "DOT", "AVAX"]
```

**Risk Management**:
- Maximum 10% position size per crypto
- 5% stop loss, 15% take profit defaults
- Minimum $1M daily volume threshold
- Maximum 5 trades per day limit

### Performance & Cost Optimization
**LLM Usage**:
- Use `openai/gpt-4o-mini` for cost-effective testing
- `anthropic/claude-3.5-sonnet` for production analysis
- Framework makes 10-20 API calls per crypto analysis

**Caching Strategy**:
- Redis caching for crypto price data (5-minute TTL)
- MCP servers handle API rate limiting
- Persistent state storage for agent learning

**Monitoring**:
```bash
# Check container health
docker-compose ps

# View MCP server logs
docker-compose logs mcp-crypto mcp-news

# Monitor Redis cache
docker-compose exec redis redis-cli monitor
```

### Debugging & Troubleshooting
**Common Issues**:
1. **MCP Server Connection**: Check `docker-compose logs mcp-crypto`
2. **OpenRouter API**: Verify `OPENROUTER_API_KEY` in `.env`
3. **Rate Limiting**: Monitor crypto API quotas (CoinGecko, Binance)
4. **Memory Usage**: Large crypto datasets may require more RAM

**Debug Mode**:
```python
# Enable verbose logging
config["debug"] = True
ta = TradingAgentsGraph(debug=True, config=config)
```

### Migration from Stock Trading
The codebase maintains backward compatibility:
- Set `config["trading_mode"] = "stocks"` for legacy mode
- Stock-specific tools remain available
- Gradual migration path supported
