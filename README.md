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

🎆 [Quick Start](#quick-start) | ₿ [Crypto Features](#crypto-features) | 🐳 [Docker Setup](#docker-setup) | 📊 [API Integration](#api-integration) | 🚀 [Advanced Usage](#advanced-usage) | 🔗 [Original Work](#acknowledgments)

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
- **Web Interface**: http://localhost:3000
- **API Endpoint**: http://localhost:8000  
- **Crypto Data**: http://localhost:9000
- **News & Sentiment**: http://localhost:9001

> 📚 **Need help?** Check our detailed guides: [QUICKSTART.md](QUICKSTART.md) | [API_SETUP.md](API_SETUP.md) | [DOCKER_README.md](DOCKER_README.md)

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

### 💻 CLI Usage

**Interactive crypto analysis** - Choose your cryptocurrency and watch the agents work:

```bash
# Start interactive CLI
python -m cli.main

# Or analyze specific crypto directly
python main.py --crypto BTC --date 2024-01-15
```

The CLI provides an intuitive interface to:
- **Select Cryptocurrencies**: BTC, ETH, ADA, SOL, and 20+ others
- **Choose Analysis Date**: Historical or real-time analysis
- **Configure AI Models**: Claude-3.5-Sonnet, GPT-4, or cost-effective alternatives
- **Set Research Depth**: Quick analysis vs comprehensive deep-dive

<p align="center">
  <img src="assets/cli/cli_init.png" width="100%" style="display: inline-block; margin: 0 2%;">
</p>

**Real-time agent progress** - Watch your AI team collaborate:

<p align="center">
  <img src="assets/cli/cli_news.png" width="100%" style="display: inline-block; margin: 0 2%;">
</p>

**Final trading recommendation** with detailed reasoning:

<p align="center">
  <img src="assets/cli/cli_transaction.png" width="100%" style="display: inline-block; margin: 0 2%;">
</p>

## 🚀 Advanced Usage

### 💻 Python API

**Built on LangGraph** for maximum flexibility and crypto-optimized agent orchestration:

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

# Initialize crypto trading agents
ta = TradingAgentsGraph(debug=True, config=DEFAULT_CONFIG.copy())

# Analyze Bitcoin
state, decision = ta.propagate("BTC", "2024-01-15")
print(f"Bitcoin Analysis: {decision}")

# Analyze Ethereum
state, decision = ta.propagate("ETH", "2024-01-15")
print(f"Ethereum Analysis: {decision}")
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

- **Main TradingAgents**: Core agent orchestration (Port 8000)
- **Crypto MCP Server**: Real-time crypto data (Port 9000)
- **News MCP Server**: Sentiment analysis (Port 9001)  
- **Redis Cache**: Performance optimization (Port 6379)
- **Web Interface**: Visual agent interaction (Port 3000)

```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f tradingagents

# Scale services
docker-compose up --scale mcp-crypto=2
```

### 📊 Performance Optimization

**Cost-effective operation** with intelligent caching:

- **Redis Caching**: 5-minute TTL for market data
- **API Rate Limiting**: Built-in throttling for all data sources
- **Model Selection**: Use GPT-4o-mini for routine tasks, Claude-3.5-Sonnet for complex analysis
- **Batch Processing**: Analyze multiple cryptos efficiently

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
