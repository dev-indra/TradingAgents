# TradingAgents Docker Deployment Guide

🚀 **Crypto Trading with Multi-Agent LLM Framework**

This guide covers the containerized deployment of TradingAgents with cryptocurrency focus, MCP servers, and OpenRouter integration.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  TradingAgents  │    │   MCP-Crypto    │    │   MCP-News      │
│   (Main App)    │◄──►│   (Port 9000)   │    │  (Port 9001)    │
│   Port 8000     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │  (Port 6379)    │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)
- 8GB+ RAM recommended for full crypto analysis

### 1. Setup Environment
```powershell
# Clone and navigate to repository
git clone https://github.com/TauricResearch/TradingAgents.git
cd TradingAgents

# Copy environment template
Copy-Item .env.example .env

# Edit .env file with your API keys
# Required: OPENROUTER_API_KEY, COINGECKO_API_KEY
notepad .env
```

### 2. Quick Launch
```powershell
# Windows PowerShell script
.\start.ps1
```

**Or manual Docker commands:**
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f tradingagents
```

### 3. Verify Deployment
```bash
# Check all services are running
docker-compose ps

# Test MCP servers
curl http://localhost:9000/health  # Crypto server
curl http://localhost:9001/health  # News server

# Test main application
curl http://localhost:8000/health
```

## 🔑 API Keys & Configuration

### Required API Keys

| Service | Environment Variable | Description | Cost |
|---------|---------------------|-------------|------|
| OpenRouter | `OPENROUTER_API_KEY` | LLM access (Claude, GPT-4) | Pay-per-use |
| CoinGecko | `COINGECKO_API_KEY` | Crypto price data | Free tier available |

### Optional API Keys

| Service | Environment Variable | Purpose | 
|---------|---------------------|---------|
| Binance | `BINANCE_API_KEY` | Order book data |
| NewsAPI | `NEWS_API_KEY` | Enhanced news coverage |
| Reddit | `REDDIT_CLIENT_ID` | Social sentiment analysis |

### Configuration Files

**`.env` (Environment Variables)**
```env
# Core APIs
OPENROUTER_API_KEY=your_key_here
COINGECKO_API_KEY=your_key_here

# Optional APIs  
BINANCE_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
REDDIT_CLIENT_ID=your_key_here
```

**`docker-compose.yml` (Service Configuration)**
- Modify ports if needed
- Adjust resource limits for your system
- Enable/disable optional services

## 🔧 Container Services

### Main Application (`tradingagents`)
- **Port**: 8000
- **Purpose**: Multi-agent trading analysis
- **Resources**: 2GB RAM, 1 CPU core
- **Dependencies**: Redis, MCP servers

### MCP Crypto Server (`mcp-crypto`)
- **Port**: 9000  
- **Purpose**: Cryptocurrency data aggregation
- **APIs**: CoinGecko, Binance
- **Features**: Price data, technical indicators, order books

### MCP News Server (`mcp-news`)
- **Port**: 9001
- **Purpose**: News and sentiment analysis  
- **Sources**: Crypto news feeds, Reddit, Fear & Greed index
- **Features**: Sentiment scoring, news aggregation

### Redis Cache (`redis`)
- **Port**: 6379
- **Purpose**: Data caching and state management
- **Storage**: In-memory + persistent volume

## 💰 Cost Estimation

### OpenRouter API Costs (Primary)
- **GPT-4o-mini**: ~$0.15 per 1M input tokens
- **Claude-3.5-Sonnet**: ~$3.00 per 1M input tokens
- **Typical analysis**: 10-20 API calls per crypto (~5K tokens each)
- **Estimated cost per analysis**: $0.01 - $0.30

### Crypto API Quotas
- **CoinGecko Free**: 10-50 calls/minute
- **Binance**: 1200 requests/minute
- **NewsAPI Free**: 1000 requests/day

## 🛠️ Development Workflow

### Local Development
```bash
# Start only dependencies
docker-compose up redis mcp-crypto mcp-news -d

# Run main app locally
conda create -n tradingagents python=3.11
conda activate tradingagents
pip install -r requirements.txt
python main.py
```

### Code Changes
```bash
# Rebuild specific service
docker-compose build tradingagents
docker-compose up tradingagents

# Update MCP servers
docker-compose build mcp-crypto mcp-news
docker-compose restart mcp-crypto mcp-news
```

### Debugging
```bash
# Container logs
docker-compose logs -f tradingagents
docker-compose logs mcp-crypto
docker-compose logs mcp-news

# Execute commands in container
docker-compose exec tradingagents python -c "import tradingagents; print('OK')"
docker-compose exec redis redis-cli info

# Check MCP server health
curl -v http://localhost:9000/tools/get_crypto_market_data
```

## 📊 Usage Examples

### Basic Crypto Analysis
```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

# Default config uses crypto mode + OpenRouter
ta = TradingAgentsGraph(debug=True)

# Analyze Bitcoin
state, decision = ta.propagate("BTC", "2024-12-15")
print(f"Bitcoin analysis: {decision}")

# Multi-crypto portfolio analysis
cryptos = ["BTC", "ETH", "SOL", "AVAX"]
for crypto in cryptos:
    _, decision = ta.propagate(crypto, "2024-12-15")
    print(f"{crypto}: {decision}")
```

### Custom Configuration
```python
config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "anthropic/claude-3.5-sonnet"
config["quick_think_llm"] = "openai/gpt-4o-mini"  
config["max_debate_rounds"] = 2
config["crypto_risk_settings"]["max_position_size"] = 0.05  # 5% max

ta = TradingAgentsGraph(debug=True, config=config)
```

## 🔍 Monitoring & Maintenance

### Health Checks
```bash
# Container health
docker-compose ps

# Service endpoints
curl http://localhost:8000/health
curl http://localhost:9000/health  
curl http://localhost:9001/health

# Redis status
docker-compose exec redis redis-cli ping
```

### Log Monitoring
```bash
# Real-time logs
docker-compose logs -f --tail=100

# Search logs
docker-compose logs tradingagents 2>&1 | grep ERROR

# Log rotation (if needed)
docker-compose restart tradingagents
```

### Resource Monitoring  
```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune
```

## 🚨 Troubleshooting

### Common Issues

**1. MCP Server Connection Failed**
```bash
# Check MCP server logs
docker-compose logs mcp-crypto mcp-news

# Restart MCP servers
docker-compose restart mcp-crypto mcp-news

# Verify network connectivity
docker-compose exec tradingagents curl http://mcp-crypto:9000/health
```

**2. OpenRouter API Errors**
```bash
# Verify API key in .env
grep OPENROUTER_API_KEY .env

# Check API usage/limits
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/auth/key

# Test with minimal request
docker-compose exec tradingagents python -c "
from tradingagents.graph.trading_graph import TradingAgentsGraph
ta = TradingAgentsGraph()
print('OpenRouter connection OK')
"
```

**3. Crypto Data Issues**
```bash
# Check CoinGecko API
curl "https://api.coingecko.com/api/v3/ping"

# Verify API key (if using Pro)
curl -H "x_cg_demo_api_key: YOUR_KEY" "https://api.coingecko.com/api/v3/coins/bitcoin"

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

**4. Memory Issues**
```yaml
# In docker-compose.yml, increase memory limits
services:
  tradingagents:
    mem_limit: 4g
  mcp-crypto:
    mem_limit: 1g
```

### Performance Tuning

**Reduce Analysis Cost:**
```python
config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "openai/gpt-4o-mini"  # Cheaper model
config["quick_think_llm"] = "openai/gpt-4o-mini"
config["max_debate_rounds"] = 1  # Fewer rounds
```

**Optimize Caching:**
```python
config["cache_enabled"] = True
config["cache_ttl"] = 600  # 10 minutes cache
```

## 📞 Support

- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Real-time community support
- **Documentation**: WARP.md for development guidelines

---

**⚠️ Disclaimer**: This framework is for research and educational purposes. Cryptocurrency trading involves substantial risk of loss. This is not financial advice.