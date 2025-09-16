# ⚡ TradingAgents Quick Start Guide

Get your crypto trading AI agents running in under 10 minutes!

## 🎯 Prerequisites

- Docker Desktop installed and running
- PowerShell (Windows) or terminal access
- ~$5-15/month budget for API keys

## 📋 Step-by-Step Setup

### 1. Clone and Setup
```bash
git clone https://github.com/TauricResearch/TradingAgents.git
cd TradingAgents
```

### 2. Get Your API Keys

**Minimum Required Keys (Core Functionality):**
- [OpenRouter API Key](https://openrouter.ai/keys) - AI agents
- [CoinGecko API Key](https://www.coingecko.com/en/api) - Crypto data (free)

> 📚 **Need Help?** See [API_SETUP.md](API_SETUP.md) for detailed instructions on getting all keys

### 3. Configure Environment
```bash
# Copy the template
cp .env.example .env

# Edit with your API keys (minimum required)
# Windows: notepad .env
# Mac/Linux: nano .env
```

**Example minimal .env:**
```env
# Required keys
OPENROUTER_API_KEY=or-your-openrouter-key-here
COINGECKO_API_KEY=your-coingecko-key-here

# Leave others as defaults for now
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
BINANCE_API_KEY=your_binance_api_key_here
# ... etc
```

### 4. Start TradingAgents

**Windows PowerShell:**
```powershell
.\start.ps1
```

**Manual Docker (any OS):**
```bash
docker-compose up --build -d
```

### 5. Verify It's Working

Check that all services are running:
```bash
docker-compose ps
```

You should see:
- `tradingagents-main` 
- `mcp-crypto-server`
- `mcp-news-server` 
- `tradingagents-redis`
- `tradingagents-web`

### 6. Test Your Setup

**Web Interface:** [http://localhost:3000](http://localhost:3000)
**API Health:** [http://localhost:8000/health](http://localhost:8000/health)

**Test crypto data API:**
```bash
curl "http://localhost:9000/crypto/price/BTC"
```

## 🚀 Run Your First Trade Analysis

With the system running, you can:

### Via Python API:
```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

# Initialize trading agents
ta = TradingAgentsGraph(debug=True, config=DEFAULT_CONFIG.copy())

# Analyze Bitcoin for today
state, decision = ta.propagate("BTC", "2024-01-15")
print(f"Decision: {decision}")
```

### Via Web Interface:
1. Open [http://localhost:3000](http://localhost:3000)
2. Select cryptocurrency (e.g., BTC, ETH)
3. Choose analysis date
4. Watch agents collaborate in real-time!

## 🔧 Next Steps

### Add More API Keys for Better Performance

**For Enhanced Trading Data:**
- [Binance API](https://www.binance.com/en/my/settings/api-management) - Real-time orderbook
- [CoinMarketCap](https://coinmarketcap.com/api/) - Market rankings

**For News & Sentiment:**
- [NewsAPI](https://newsapi.org/) - Recent crypto news
- [Reddit API](https://www.reddit.com/prefs/apps) - Social sentiment

> 📖 **Full Guide:** See [API_SETUP.md](API_SETUP.md) for all API key details

### Customize Your Agents

Edit `tradingagents/default_config.py` to:
- Change AI models (GPT-4, Claude, etc.)
- Adjust risk management settings
- Modify supported cryptocurrencies
- Tune analysis depth

## 🛠️ Common Issues

**Docker not running?**
```bash
# Start Docker Desktop first, then:
docker info
```

**API key errors?**
- Check `.env` file has correct keys
- Verify keys are valid on respective platforms
- Restart containers: `docker-compose restart`

**Ports already in use?**
```bash
# Find what's using the port
netstat -an | grep 8000

# Or change ports in docker-compose.yml
```

## 📊 Understanding Results

TradingAgents runs a multi-agent simulation:

1. **Analysts** gather market data (price, news, sentiment)
2. **Researchers** debate bullish vs bearish cases  
3. **Trader** makes investment recommendation
4. **Risk Manager** evaluates and approves/rejects

Each agent provides reasoning and confidence scores for transparent decision-making.

## 🆘 Need Help?

- **API Setup Issues**: Check [API_SETUP.md](API_SETUP.md)
- **Docker Problems**: See [DOCKER_README.md](DOCKER_README.md) 
- **General Questions**: Open an issue on GitHub
- **Join Community**: [Tauric Research](https://tauric.ai/)

## ⚠️ Important Notes

- This is for **research/educational purposes**
- Not financial advice - always do your own research
- Start with small amounts for testing
- Monitor API usage to avoid unexpected charges

---

**Happy Trading! 🎯📈**