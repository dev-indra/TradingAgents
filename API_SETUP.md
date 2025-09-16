# 🔑 API Key Setup Guide for TradingAgents

This guide will walk you through obtaining all the API keys needed for TradingAgents crypto trading framework.

## 📋 Overview

TradingAgents requires several API keys for different services. Here's what you need:

- **Required**: Essential for core functionality
- **Recommended**: Enhances performance and provides backup data sources  
- **Optional**: Adds advanced features like social sentiment analysis

## 🚀 Quick Setup Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Get OpenRouter API key (Required)
- [ ] Get CoinGecko API key (Required) 
- [ ] Get Binance API keys (Recommended)
- [ ] Get additional keys as needed (Optional)
- [ ] Update `.env` file with your keys
- [ ] Test setup with `start.ps1`

## 🔑 Required API Keys

### 1. OpenRouter API Key (Required)
**Purpose**: Powers all AI agents (Claude, GPT models)
**Cost**: Pay-per-use, ~$0.001-0.01 per request

**Setup:**
1. Go to [OpenRouter](https://openrouter.ai/)
2. Create account and add payment method
3. Go to [Keys](https://openrouter.ai/keys)
4. Create new API key
5. Add to `.env`: `OPENROUTER_API_KEY=or-your-key-here`

### 2. CoinGecko API Key (Required)
**Purpose**: Crypto price data, market caps, trading volumes
**Cost**: Free tier available (10,000 requests/month)

**Setup:**
1. Go to [CoinGecko API](https://www.coingecko.com/en/api)
2. Create account
3. Get your free API key from dashboard
4. Add to `.env`: `COINGECKO_API_KEY=your-coingecko-key-here`

## 🔧 Recommended API Keys

### 3. Binance API Keys (Recommended)
**Purpose**: Real-time orderbook data, trading volumes
**Cost**: Free

**Setup:**
1. Create account at [Binance](https://www.binance.com/)
2. Go to Account → API Management
3. Create new API key (read-only permissions sufficient)
4. Add to `.env`:
   ```
   BINANCE_API_KEY=your-binance-api-key
   BINANCE_SECRET_KEY=your-binance-secret-key
   ```

### 4. CoinMarketCap API Key (Recommended)
**Purpose**: Alternative crypto data source, market rankings
**Cost**: Free tier available (10,000 requests/month)

**Setup:**
1. Go to [CoinMarketCap API](https://coinmarketcap.com/api/)
2. Create account and get free API key
3. Add to `.env`: `COINMARKETCAP_API_KEY=your-cmc-key-here`

### 5. NewsAPI Key (Recommended)
**Purpose**: Crypto news for sentiment analysis
**Cost**: Free tier available (1,000 requests/day)

**Setup:**
1. Go to [NewsAPI](https://newsapi.org/)
2. Create account and get free API key
3. Add to `.env`: `NEWS_API_KEY=your-newsapi-key-here`

## 📱 Optional API Keys

### 6. Reddit API Keys (Optional)
**Purpose**: Social sentiment analysis from Reddit
**Cost**: Free

**Setup:**
1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Create new app (script type)
3. Copy client ID and secret
4. Add to `.env`:
   ```
   REDDIT_CLIENT_ID=your-reddit-client-id
   REDDIT_CLIENT_SECRET=your-reddit-client-secret
   ```

## ⚡ Quick Start Commands

After setting up your API keys:

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys
notepad .env  # Windows
nano .env     # Linux/Mac

# Start the system (Windows PowerShell)
.\start.ps1

# Or manually with Docker
docker-compose up --build
```

## 🔍 Testing Your Setup

You can test if your API keys are working:

```bash
# Test crypto data
curl "http://localhost:9000/crypto/price/BTC"

# Test news data  
curl "http://localhost:9001/news/crypto/BTC"
```

## 💡 Pro Tips

1. **Start Minimal**: Begin with just OpenRouter + CoinGecko keys
2. **Free Tiers**: Most APIs offer generous free tiers for testing
3. **Rate Limits**: The system includes caching to minimize API calls
4. **Security**: Never commit your `.env` file to git (it's already in `.gitignore`)

## 🆘 Need Help?

- Check the main [README.md](README.md) for general setup
- See [DOCKER_README.md](DOCKER_README.md) for Docker-specific guidance
- Open an issue if you encounter problems

## 💰 Estimated Monthly Costs

For moderate usage (testing/small scale):
- **OpenRouter**: $5-15/month
- **CoinGecko**: Free (10k requests)
- **Binance**: Free
- **Others**: Free on basic tiers

**Total**: ~$5-15/month for core functionality