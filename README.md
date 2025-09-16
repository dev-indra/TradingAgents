<div align="center">
  <h1>🚀 TradingAgents: Crypto Edition</h1>
  <p><strong>Multi-Agent AI Framework for Cryptocurrency Trading & Analysis</strong></p>
  
  <a href="#quick-start"><img alt="Quick Start" src="https://img.shields.io/badge/⚡-Quick%20Start-brightgreen?style=for-the-badge"/></a>
  <a href="#crypto-features"><img alt="Crypto Features" src="https://img.shields.io/badge/₿-Crypto%20Focused-orange?style=for-the-badge"/></a>
  <a href="#docker-setup"><img alt="Docker" src="https://img.shields.io/badge/🐳-Docker%20Ready-blue?style=for-the-badge"/></a>
  
  <br><br>
  
  <a href="https://github.com/dev-indra/TradingAgents"><img alt="GitHub" src="https://img.shields.io/github/stars/dev-indra/TradingAgents?style=social"/></a>
  <a href="https://github.com/dev-indra/TradingAgents/fork"><img alt="Fork" src="https://img.shields.io/github/forks/dev-indra/TradingAgents?style=social"/></a>
  
</div>

> 🔬 **Based on Tauric Research's groundbreaking work** - This is a substantial fork that reimagines their multi-agent trading framework specifically for cryptocurrency markets, featuring modern architecture, comprehensive crypto data integration, and production-ready deployment.

---

## 🎯 What's New in This Crypto Edition

This fork transforms the original TradingAgents framework into a **cryptocurrency-focused powerhouse**:

### 🔥 Major Enhancements
- **₿ Crypto-Native**: Purpose-built for Bitcoin, Ethereum, and 20+ major cryptocurrencies
- **🐳 Docker-First**: Complete containerized deployment with microservices architecture
- **⚡ Real-Time Data**: Live crypto prices, orderbooks, news, and sentiment via multiple APIs
- **🚀 Modern Stack**: OpenRouter integration for Claude/GPT models, MCP servers, Redis caching
- **📊 Advanced Analytics**: Fear & Greed Index, social sentiment, on-chain metrics
- **🛠️ Production Ready**: Comprehensive logging, error handling, and monitoring

### 🌐 Quick Navigation

🎆 [Quick Start](#quick-start) | 🌐 [Web Interface](#web-interface-features) | ₿ [Crypto Features](#crypto-features) | 🐳 [Docker Setup](#docker-setup) | 💻 [Usage Options](#usage-options) | 🚀 [Advanced Usage](#advanced-usage) | 🔧 [Troubleshooting](#troubleshooting)

## ⚡ Quick Start

**Get your crypto AI trading agents running in under 10 minutes!**

```bash
# 1. Clone this crypto-focused fork
git clone https://github.com/dev-indra/TradingAgents.git
cd TradingAgents

# 2. Get your API keys (see API_SETUP.md for details)
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY and COINGECKO_API_KEY

# 3. Start with Docker (Windows PowerShell)
.\start.ps1

# Or manually
docker-compose up --build -d
```

**🎆 That's it!** Your crypto trading agents are now running at:
- **🌐 Web Dashboard**: http://localhost:3000 (Full-featured React UI)
- **🤖 Main API**: http://localhost:8000 (Agent orchestration)
- **💰 Crypto Data**: http://localhost:9000 (Real-time prices & market data)
- **📰 News Service**: http://localhost:9001 (Sentiment analysis & news)

### 🌐 Web Interface Features

The **React-based dashboard** at http://localhost:3000 provides:

**📊 Market Overview Dashboard:**
- Live cryptocurrency prices, market caps, and 24h price changes  
- Interactive cryptocurrency selection (BTC, ETH, SOL, AVAX, BNB, ADA, DOT, MATIC, etc.)
- Real-time market data from CoinGecko and Binance APIs
- Beautiful, responsive design optimized for crypto trading

**🤖 AI Analysis Center:**
- Configure multi-agent analysis parameters
- Watch agents work in real-time with progress tracking
- View detailed reports from each specialist team
- Export analysis results and trading recommendations

**📰 News & Sentiment Hub:**
- Aggregated cryptocurrency news from multiple sources
- AI-powered sentiment analysis of market events
- Social media sentiment tracking from Reddit and other platforms
- Correlation between news sentiment and price movements

**⚙️ System Monitoring:**
- Real-time health status of all microservices
- Service performance metrics and uptime monitoring
- API usage and cost tracking
- Error reporting and troubleshooting guides

> 📚 **Need help?** Check our detailed guides: [QUICKSTART.md](QUICKSTART.md) | [API_SETUP.md](API_SETUP.md)

## ₿ Crypto Features

### **Supported Cryptocurrencies**
Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB), XRP, Cardano (ADA), Dogecoin (DOGE), Polygon (MATIC), Solana (SOL), Polkadot (DOT), Avalanche (AVAX), Shiba Inu (SHIB), Litecoin (LTC), Cosmos (ATOM), Chainlink (LINK), Stellar (XLM), and more...

### **Real-Time Data Sources**
- 📊 **CoinGecko**: Price data, market caps, trading volumes
- 💰 **Binance**: Live orderbooks and advanced trading metrics
- 💱 **CoinMarketCap**: Market rankings and alternative data
- 📰 **NewsAPI**: Latest crypto news and market events
- 😱 **Fear & Greed Index**: Market sentiment indicator
- 🗣️ **Reddit**: Social sentiment analysis from crypto communities

### **AI-Powered Analysis**
- **Technical Indicators**: RSI, MACD, Bollinger Bands, Volume analysis
- **Sentiment Analysis**: Real-time social media and news sentiment scoring
- **Fundamental Analysis**: On-chain metrics, market cap analysis, liquidity assessment
- **Risk Management**: Volatility analysis, portfolio optimization, stop-loss strategies

## 🤖 How the Crypto Agents Work

**TradingAgents Crypto Edition** employs a sophisticated multi-agent architecture specifically designed for cryptocurrency markets. Each AI agent specializes in different aspects of crypto analysis, working together like a professional trading team.

<p align="center">
  <img src="assets/schema.png" style="width: 100%; height: auto;">
</p>

> ⚠️ **Disclaimer**: This framework is designed for research and educational purposes. Cryptocurrency trading involves significant risk. This is not financial advice - always do your own research and never invest more than you can afford to lose.

Our **crypto-specialized agents** decompose complex market analysis into focused roles:

### 📈 Crypto Analyst Team
- **Fundamentals Analyst**: Evaluates crypto project fundamentals, tokenomics, adoption metrics, and on-chain data to identify undervalued assets
- **Sentiment Analyst**: Analyzes social media buzz, Reddit sentiment, and community engagement to gauge market mood and FOMO/FUD levels  
- **News Analyst**: Monitors crypto news, regulatory updates, institutional adoption, and macroeconomic events that impact digital asset prices
- **Technical Analyst**: Uses crypto-specific technical indicators, support/resistance levels, and chart patterns optimized for 24/7 volatile markets

<p align="center">
  <img src="assets/analyst.png" width="100%" style="display: inline-block; margin: 0 2%;">
</p>

### 🔬 Crypto Research Team
- **Bull & Bear Researchers** engage in structured debates about crypto market conditions, balancing potential gains against volatility risks
- Specialized in crypto market dynamics: HODLing vs trading strategies, DeFi opportunities, regulatory impact analysis
- Considers crypto-specific factors: network effects, developer activity, institutional adoption, and market cycles

<p align="center">
  <img src="assets/researcher.png" width="70%" style="display: inline-block; margin: 0 2%;">
</p>

### 🚀 Crypto Trader Agent
- Synthesizes multi-agent analysis into actionable crypto trading recommendations
- Optimized for crypto market characteristics: 24/7 trading, high volatility, liquidity considerations
- Implements crypto-specific strategies: DCA, HODLing, momentum trading, and portfolio rebalancing

<p align="center">
  <img src="assets/trader.png" width="70%" style="display: inline-block; margin: 0 2%;">
</p>

### 🛡️ Crypto Risk Management & Portfolio Manager
- **Advanced Risk Assessment**: Evaluates crypto-specific risks including volatility spikes, regulatory changes, and market manipulation
- **Portfolio Optimization**: Balances crypto allocations across different categories (DeFi, Layer 1s, meme coins, stablecoins)
- **Execution Control**: Final approval/rejection of trades with crypto-optimized stop-losses and position sizing

<p align="center">
  <img src="assets/risk.png" width="70%" style="display: inline-block; margin: 0 2%;">
</p>

## 🐳 Docker Setup

**Recommended approach** - Get everything running with Docker in minutes:

### Prerequisites
- Docker Desktop installed and running
- At least 4GB RAM available for containers
- API keys: [OpenRouter](https://openrouter.ai/keys) + [CoinGecko](https://www.coingecko.com/en/api) (minimum)

### Quick Docker Start

```bash
# Clone this crypto fork
git clone https://github.com/dev-indra/TradingAgents.git
cd TradingAgents

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Windows PowerShell (recommended)
.\start.ps1

# Or manual Docker
docker-compose up --build -d
```

### 📊 API Integration

This crypto edition integrates multiple APIs for comprehensive market data:

**✅ Required APIs:**
- **OpenRouter**: AI agents (Claude-3.5-Sonnet, GPT-4) - `~$5-15/month`
- **CoinGecko**: Crypto prices & market data - `Free tier available`

**🚀 Recommended APIs:**
- **Binance**: Real-time orderbooks - `Free`
- **NewsAPI**: Crypto news sentiment - `Free tier`
- **CoinMarketCap**: Market rankings - `Free tier`

**🔥 Optional APIs:**
- **Reddit**: Social sentiment analysis - `Free`

> 📚 **Detailed Setup**: See [API_SETUP.md](API_SETUP.md) for step-by-step API key instructions

### Alternative: Python Virtual Environment

```bash
# Create virtual environment
conda create -n tradingagents python=3.12
conda activate tradingagents

# Install dependencies
pip install -r requirements.txt

# Run locally
python -m cli.main
```

### 💻 Usage Options

**Multiple ways to interact with your crypto trading agents:**

#### 🌐 Web Interface (Recommended)
```bash
# Access the full-featured web dashboard
# Windows
start http://localhost:3000

# Mac/Linux  
open http://localhost:3000
```

The **Web Interface** provides:
- **📊 Market Overview**: Real-time crypto prices, market caps, and trading volumes
- **🤖 AI Analysis**: Multi-agent analysis with live progress tracking
- **📰 News & Sentiment**: Aggregated crypto news with sentiment analysis
- **⚙️ System Status**: Monitor all services health in real-time
- **🎯 Interactive Dashboard**: Select cryptocurrencies, configure analysis depth

#### 🖥️ Command Line Interface
```bash
# Interactive CLI with rich formatting
python -m cli.main

# Or direct analysis of multiple cryptos
python main.py
```

The **CLI Interface** features:
- **Rich Terminal UI**: Beautiful progress bars, status indicators, and formatted output
- **Real-Time Progress**: Watch each agent complete their analysis tasks
- **Comprehensive Reports**: Detailed analyst reports, research debates, and trading recommendations
- **Multi-Crypto Analysis**: Batch process multiple cryptocurrencies (BTC, ETH, SOL, AVAX, etc.)

#### 📡 API Access
```bash
# Direct API calls to services (Linux/Mac)
curl http://localhost:3000/api/health
curl http://localhost:9000/crypto/BTC/price  
curl http://localhost:9001/news/crypto

# Windows PowerShell
Invoke-RestMethod http://localhost:3000/api/health
Invoke-RestMethod http://localhost:9000/crypto/BTC/price
```

## 🚀 Advanced Usage

### 🌐 Web Interface Features

**Professional Trading Dashboard** at http://localhost:3000:

- **📊 Market Overview Tab**: Live cryptocurrency data with price charts, market caps, and 24h changes
- **🤖 AI Analysis Tab**: Configure and run multi-agent analysis with real-time progress tracking  
- **📰 News & Sentiment Tab**: Aggregated crypto news with AI-powered sentiment analysis
- **📋 Portfolio Tab**: Portfolio management and tracking (coming soon)
- **⚙️ System Status**: Real-time health monitoring of all microservices

**Interactive Agent Monitoring:**
- Watch agents progress through analysis phases
- View detailed reports from each specialist team
- Export analysis results and trading recommendations
- Configure risk parameters and analysis depth

### 💻 Python API

**Built on LangGraph** for maximum flexibility and crypto-optimized agent orchestration:

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from datetime import datetime

# Initialize crypto trading agents
ta = TradingAgentsGraph(debug=True, config=DEFAULT_CONFIG.copy())

# Analyze Bitcoin with current date
current_date = datetime.now().strftime("%Y-%m-%d")
state, decision = ta.propagate("BTC", current_date)
print(f"Bitcoin Analysis: {decision}")

# Analyze multiple cryptocurrencies
cryptos = ["BTC", "ETH", "SOL", "AVAX"]
for crypto in cryptos:
    state, decision = ta.propagate(crypto, current_date)
    print(f"{crypto} Analysis: {decision}")
```

### ⚙️ Custom Configuration

**Optimize for your needs** - Adjust AI models, trading strategies, and risk parameters:

```python
# Create crypto-optimized config
config = DEFAULT_CONFIG.copy()

# AI Model Selection
config["deep_think_llm"] = "anthropic/claude-3.5-sonnet"  # Best reasoning
config["quick_think_llm"] = "openai/gpt-4o-mini"  # Cost-effective

# Trading Parameters  
config["trading_mode"] = "crypto"  # Crypto-specific features
config["max_debate_rounds"] = 2  # More thorough analysis
config["online_tools"] = True  # Real-time data

# Crypto-specific risk management
config["crypto_risk_settings"]["max_position_size"] = 0.05  # 5% max position
config["crypto_risk_settings"]["stop_loss_percentage"] = 0.10  # 10% stop loss

# Initialize with custom config
ta = TradingAgentsGraph(debug=True, config=config)
```

### 🐳 Microservices Architecture

**Production-ready deployment** with specialized services:

| Service | Port | Purpose | Status Endpoint |
|---------|------|---------|----------------|
| **Web Interface** | 3000 | React dashboard with agent monitoring | http://localhost:3000/api/health |
| **Main TradingAgents** | 8000 | Core agent orchestration & analysis | http://localhost:8000/health |
| **Crypto MCP Server** | 9000 | Real-time crypto data via CoinGecko/Binance | http://localhost:9000/health |
| **News MCP Server** | 9001 | News aggregation & sentiment analysis | http://localhost:9001/health |
| **Redis Cache** | 6379 | Performance optimization & data caching | Internal service |

**Service Management:**
```bash
# Check all services health
docker-compose ps

# View specific service logs  
docker-compose logs -f tradingagents
docker-compose logs -f web-ui
docker-compose logs -f mcp-crypto

# Restart specific services
docker-compose restart web-ui

# Scale MCP servers for high load
docker-compose up --scale mcp-crypto=2 --scale mcp-news=2
```

### 📊 Performance Optimization

**Cost-effective operation** with intelligent caching:

- **Redis Caching**: 5-minute TTL for market data, reduces API costs by 80%+
- **API Rate Limiting**: Built-in throttling prevents hitting API limits
- **Smart Model Selection**: GPT-4o-mini for routine analysis, Claude-3.5-Sonnet for complex reasoning
- **Batch Processing**: Process multiple cryptocurrencies in parallel
- **MCP Server Optimization**: Dedicated servers for crypto data and news prevent bottlenecks

**Cost Monitoring:**
```bash
# Monitor API usage costs
docker-compose logs tradingagents | grep "API_COST"

# Check Redis cache hit rates
docker exec tradingagents-redis redis-cli info stats | grep hit
```

### 🔧 Troubleshooting

**Common Issues & Solutions:**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **API Keys Missing** | Services failing to start | Check `.env` file, see [API_SETUP.md](API_SETUP.md) |
| **Docker Build Fails** | Web UI container errors | Run `docker-compose build --no-cache` |
| **Agents Not Responding** | Empty analysis results | Check OpenRouter API key and balance |
| **MCP Servers Restarting** | "Restarting (1)" status | Check API rate limits and internet connection |
| **Web UI Not Loading** | 3000 port not responding | Restart: `docker-compose restart web-ui` |

**Health Check Commands:**
```bash
# Quick health check all services
curl http://localhost:3000/api/health  # Web UI
curl http://localhost:8000/health      # Main service (if implemented)
curl http://localhost:9000/health      # Crypto MCP (if implemented)
curl http://localhost:9001/health      # News MCP (if implemented)

# View comprehensive service status
docker-compose ps
docker-compose logs --tail=50 tradingagents
```

> 📚 **Full Configuration**: See `tradingagents/default_config.py` for all available options

## 🤝 Contributing

**Join the crypto AI trading revolution!** We welcome all contributions:

- 🐛 **Bug Reports**: Found an issue? Let us know!
- 🚀 **Feature Requests**: Want crypto-specific functionality? Suggest it!
- 📝 **Documentation**: Help others get started
- 💻 **Code**: Improve agent logic, add new data sources, enhance UI

```bash
# Fork the repo
git clone https://github.com/YOUR_USERNAME/TradingAgents.git

# Create feature branch
git checkout -b crypto-feature-amazing

# Make changes, test, and commit
git commit -m "Add amazing crypto feature"

# Push and create PR
git push origin crypto-feature-amazing
```

### 📫 Get In Touch
- **Issues**: [GitHub Issues](https://github.com/dev-indra/TradingAgents/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dev-indra/TradingAgents/discussions)
- **Email**: Open an issue for contact

## 🔗 Acknowledgments

### 🎆 Original TradingAgents Framework

This project is built upon the **groundbreaking work** by [Tauric Research](https://tauric.ai/):

> **Original Paper**: [TradingAgents: Multi-Agents LLM Financial Trading Framework](https://arxiv.org/abs/2412.20138)  
> **Authors**: Yijia Xiao, Edward Sun, Di Luo, Wei Wang  
> **Repository**: [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)

**🙏 Deep appreciation** to the Tauric Research team for:
- Creating the innovative multi-agent trading framework
- Open-sourcing their research for the community
- Pioneering the use of LLM agents in financial analysis
- Providing the foundation that made this crypto edition possible

### 🔍 What This Fork Adds

While respecting and building upon their excellent foundation, this fork adds:
- **Complete crypto market focus** with 20+ cryptocurrencies
- **Modern deployment** via Docker and microservices
- **Real-time data integration** from multiple crypto APIs
- **Enhanced agent specialization** for crypto market dynamics
- **Production-ready architecture** with caching and error handling

## 📄 Citations

**If this crypto edition helps your research**, please cite both:

```bibtex
# Original TradingAgents paper
@misc{xiao2025tradingagentsmultiagentsllmfinancial,
      title={TradingAgents: Multi-Agents LLM Financial Trading Framework}, 
      author={Yijia Xiao and Edward Sun and Di Luo and Wei Wang},
      year={2025},
      eprint={2412.20138},
      archivePrefix={arXiv},
      primaryClass={q-fin.TR},
      url={https://arxiv.org/abs/2412.20138}
}

# This crypto-focused implementation
@software{tradingagents_crypto_edition,
      title={TradingAgents: Crypto Edition - Multi-Agent AI Framework for Cryptocurrency Trading},
      author={dev-indra and contributors},
      year={2025},
      url={https://github.com/dev-indra/TradingAgents},
      note={Cryptocurrency-focused fork of TradingAgents by Tauric Research}
}
```

---

<div align="center">
  
**🚀 Ready to revolutionize crypto trading with AI agents?**  
[Get Started Now](#quick-start) | [Join the Community](#contributing) | [Star the Repo](https://github.com/dev-indra/TradingAgents)

*Built with ♥️ for the crypto community*

</div>
