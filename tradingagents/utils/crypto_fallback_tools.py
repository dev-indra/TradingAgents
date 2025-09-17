"""
Fallback cryptocurrency data fetching tools with Redis caching.
These tools provide direct API access when MCP servers are unavailable.
"""

import requests
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import ccxt
import feedparser
from tradingagents.utils.redis_client import get_redis_client, cached_function, cache_key_builder

logger = logging.getLogger(__name__)


class CryptoFallbackTools:
    """Fallback cryptocurrency data fetching tools with caching."""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.coingecko_base_url = "https://api.coingecko.com/api/v3"
        self.redis_client = get_redis_client(config)
        
        # Initialize Binance client
        try:
            self.binance = ccxt.binance({
                'apiKey': config.get('BINANCE_API_KEY'),
                'secret': config.get('BINANCE_SECRET_KEY'),
                'sandbox': False,  # Set to True for testing
                'enableRateLimit': True,
            })
        except Exception as e:
            logger.warning(f"Failed to initialize Binance client: {e}")
            self.binance = None
    
    def get_crypto_data_coingecko(self, symbol: str, days: int = 30) -> str:
        """
        Get cryptocurrency data from CoinGecko API with caching.
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC, ETH)
            days: Number of days of historical data
            
        Returns:
            JSON string containing price and market data
        """
        cache_key = f"coingecko:{symbol.lower()}:{days}"
        
        # Try to get from cache
        cached_result = self.redis_client.get(cache_key)
        if cached_result is not None:
            logger.debug(f"Cache hit for CoinGecko {symbol}")
            return json.dumps(cached_result, indent=2)
        
        try:
            # Get coin ID from symbol
            coin_id = self._get_coingecko_coin_id(symbol)
            if not coin_id:
                return json.dumps({"error": f"Could not find coin ID for {symbol}"})
            
            # Get market data
            market_url = f"{self.coingecko_base_url}/coins/{coin_id}"
            market_params = {
                "localization": "false",
                "tickers": "false",
                "market_data": "true",
                "community_data": "false",
                "developer_data": "false",
                "sparkline": "false"
            }
            
            market_response = requests.get(market_url, params=market_params, timeout=10)
            market_response.raise_for_status()
            market_data = market_response.json()
            
            # Get price history
            history_url = f"{self.coingecko_base_url}/coins/{coin_id}/market_chart"
            history_params = {
                "vs_currency": "usd",
                "days": days,
                "interval": "daily" if days > 90 else "hourly"
            }
            
            history_response = requests.get(history_url, params=history_params, timeout=10)
            history_response.raise_for_status()
            history_data = history_response.json()
            
            # Combine data
            result = {
                "symbol": symbol.upper(),
                "name": market_data.get("name", "Unknown"),
                "current_price": market_data["market_data"]["current_price"]["usd"],
                "market_cap": market_data["market_data"]["market_cap"]["usd"],
                "total_volume": market_data["market_data"]["total_volume"]["usd"],
                "price_change_24h": market_data["market_data"]["price_change_24h"],
                "price_change_percentage_24h": market_data["market_data"]["price_change_percentage_24h"],
                "market_cap_rank": market_data["market_data"]["market_cap_rank"],
                "circulating_supply": market_data["market_data"]["circulating_supply"],
                "total_supply": market_data["market_data"]["total_supply"],
                "max_supply": market_data["market_data"]["max_supply"],
                "ath": market_data["market_data"]["ath"]["usd"],
                "atl": market_data["market_data"]["atl"]["usd"],
                "price_history": {
                    "prices": history_data.get("prices", []),
                    "market_caps": history_data.get("market_caps", []),
                    "total_volumes": history_data.get("total_volumes", [])
                },
                "source": "coingecko",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Cache for 5 minutes
            self.redis_client.set(cache_key, result, 300)
            logger.debug(f"Cached CoinGecko data for {symbol}")
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            error_result = {
                "error": f"Failed to fetch CoinGecko data for {symbol}: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }
            return json.dumps(error_result, indent=2)
    
    def get_crypto_data_binance(self, symbol: str) -> str:
        """
        Get cryptocurrency data from Binance API with caching.
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC, ETH)
            
        Returns:
            JSON string containing current price and orderbook data
        """
        if not self.binance:
            return json.dumps({"error": "Binance client not initialized"})
        
        cache_key = f"binance:{symbol.upper()}"
        
        # Try to get from cache
        cached_result = self.redis_client.get(cache_key)
        if cached_result is not None:
            logger.debug(f"Cache hit for Binance {symbol}")
            return json.dumps(cached_result, indent=2)
        
        try:
            # Convert symbol to Binance format (e.g., BTC -> BTC/USDT)
            trading_symbol = f"{symbol.upper()}/USDT"
            
            # Get ticker data
            ticker = self.binance.fetch_ticker(trading_symbol)
            
            # Get orderbook
            orderbook = self.binance.fetch_order_book(trading_symbol, limit=10)
            
            # Get 24h stats
            stats = self.binance.fetch_24hr_ticker(trading_symbol)
            
            result = {
                "symbol": symbol.upper(),
                "trading_pair": trading_symbol,
                "current_price": ticker["last"],
                "bid": ticker["bid"],
                "ask": ticker["ask"],
                "volume": ticker["baseVolume"],
                "volume_usd": ticker["quoteVolume"],
                "price_change_24h": stats["change"],
                "price_change_percentage_24h": stats["percentage"],
                "high_24h": ticker["high"],
                "low_24h": ticker["low"],
                "orderbook": {
                    "bids": orderbook["bids"][:5],  # Top 5 bids
                    "asks": orderbook["asks"][:5],  # Top 5 asks
                    "spread": orderbook["asks"][0][0] - orderbook["bids"][0][0] if orderbook["asks"] and orderbook["bids"] else 0
                },
                "source": "binance",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Cache for 1 minute (high-frequency data)
            self.redis_client.set(cache_key, result, 60)
            logger.debug(f"Cached Binance data for {symbol}")
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            error_result = {
                "error": f"Failed to fetch Binance data for {symbol}: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }
            return json.dumps(error_result, indent=2)
    
    def get_crypto_news_rss(self, symbol: str) -> str:
        """
        Get cryptocurrency news from RSS feeds with caching.
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC, ETH)
            
        Returns:
            JSON string containing news articles
        """
        cache_key = f"crypto_news_rss:{symbol.lower()}"
        
        # Try to get from cache
        cached_result = self.redis_client.get(cache_key)
        if cached_result is not None:
            logger.debug(f"Cache hit for crypto news RSS {symbol}")
            return json.dumps(cached_result, indent=2)
        
        try:
            # RSS feed URLs for crypto news
            feeds = [
                "https://cointelegraph.com/rss",
                "https://coindesk.com/arc/outboundfeeds/rss/",
                "https://cryptonews.com/news/feed/",
            ]
            
            all_articles = []
            
            for feed_url in feeds:
                try:
                    feed = feedparser.parse(feed_url)
                    for entry in feed.entries[:5]:  # Limit to 5 articles per feed
                        # Filter articles that mention the symbol
                        if symbol.lower() in entry.title.lower() or symbol.lower() in entry.get('summary', '').lower():
                            article = {
                                "title": entry.title,
                                "link": entry.link,
                                "published": entry.get('published', ''),
                                "summary": entry.get('summary', '')[:500] + "..." if len(entry.get('summary', '')) > 500 else entry.get('summary', ''),
                                "source": feed_url.split('/')[2]  # Extract domain
                            }
                            all_articles.append(article)
                except Exception as e:
                    logger.warning(f"Failed to parse RSS feed {feed_url}: {e}")
                    continue
            
            result = {
                "symbol": symbol.upper(),
                "articles": all_articles,
                "total_articles": len(all_articles),
                "source": "rss_feeds",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Cache for 15 minutes
            self.redis_client.set(cache_key, result, 900)
            logger.debug(f"Cached RSS news for {symbol}")
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            error_result = {
                "error": f"Failed to fetch RSS news for {symbol}: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }
            return json.dumps(error_result, indent=2)
    
    def _get_coingecko_coin_id(self, symbol: str) -> Optional[str]:
        """
        Get CoinGecko coin ID from symbol with caching.
        
        Args:
            symbol: Cryptocurrency symbol
            
        Returns:
            CoinGecko coin ID or None if not found
        """
        cache_key = f"coingecko_coin_id:{symbol.lower()}"
        
        # Try to get from cache
        cached_id = self.redis_client.get(cache_key)
        if cached_id is not None:
            return cached_id
        
        try:
            # Common mappings to avoid API calls
            common_mappings = {
                'BTC': 'bitcoin',
                'ETH': 'ethereum',
                'BNB': 'binancecoin',
                'ADA': 'cardano',
                'DOGE': 'dogecoin',
                'XRP': 'ripple',
                'DOT': 'polkadot',
                'SOL': 'solana',
                'AVAX': 'avalanche-2',
                'MATIC': 'matic-network',
                'LINK': 'chainlink',
                'UNI': 'uniswap'
            }
            
            if symbol.upper() in common_mappings:
                coin_id = common_mappings[symbol.upper()]
                # Cache for 24 hours
                self.redis_client.set(cache_key, coin_id, 86400)
                return coin_id
            
            # If not in common mappings, query the API
            url = f"{self.coingecko_base_url}/coins/list"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            coins = response.json()
            for coin in coins:
                if coin['symbol'].upper() == symbol.upper():
                    coin_id = coin['id']
                    # Cache for 24 hours
                    self.redis_client.set(cache_key, coin_id, 86400)
                    return coin_id
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get CoinGecko coin ID for {symbol}: {e}")
            return None


# Global instance
_fallback_tools = None


def get_fallback_tools(config: Dict[str, Any] = None) -> CryptoFallbackTools:
    """Get or create the global fallback tools instance."""
    global _fallback_tools
    
    if _fallback_tools is None:
        _fallback_tools = CryptoFallbackTools(config)
    
    return _fallback_tools