"""
MCP Client Tools for Cryptocurrency Data
Integrates with MCP servers to provide crypto market data, news, and sentiment analysis
"""
import asyncio
import json
import logging
import aiohttp
from typing import Dict, Any, List, Optional
from langchain.tools import Tool
from langchain_core.tools import tool
from tradingagents.utils.redis_client import get_redis_client, cached_function, cache_key_builder

logger = logging.getLogger(__name__)

class MCPCryptoClient:
    """Client for communicating with MCP cryptocurrency servers"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.crypto_server_url = config.get("mcp_crypto_server_url", "http://localhost:9000")
        self.news_server_url = config.get("mcp_news_server_url", "http://localhost:9001")
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def call_mcp_tool(self, server_url: str, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Call a tool on an MCP server with Redis caching"""
        # Build cache key
        cache_key = f"mcp:{tool_name}:{cache_key_builder(server_url, **parameters)}"
        
        # Try to get from cache first
        redis_client = get_redis_client(self.config)
        cached_result = redis_client.get(cache_key)
        
        if cached_result is not None:
            logger.debug(f"Cache hit for MCP tool {tool_name}")
            return cached_result
        
        try:
            url = f"{server_url}/tools/{tool_name}"
            
            async with self.session.post(url, json=parameters) as response:
                if response.status == 200:
                    result = await response.json()
                    
                    # Cache the result with appropriate TTL
                    ttl = self._get_cache_ttl(tool_name)
                    redis_client.set(cache_key, result, ttl)
                    logger.debug(f"Cached MCP tool {tool_name} result for {ttl}s")
                    
                    return result
                else:
                    error_text = await response.text()
                    logger.error(f"MCP server error ({response.status}): {error_text}")
                    return {"error": f"Server returned status {response.status}"}
        except Exception as e:
            logger.error(f"Error calling MCP tool {tool_name}: {e}")
            return {"error": str(e)}
    
    def _get_cache_ttl(self, tool_name: str) -> int:
        """Get appropriate cache TTL based on tool type"""
        # Different cache TTLs for different types of data
        cache_durations = {
            # Price data changes frequently - shorter cache
            "get_crypto_price_data": 60,  # 1 minute
            "get_crypto_market_data": 30,  # 30 seconds
            "get_crypto_orderbook": 10,   # 10 seconds
            
            # Indicators can be cached a bit longer
            "calculate_crypto_indicators": 300,  # 5 minutes
            
            # News and sentiment change less frequently
            "get_crypto_news": 900,  # 15 minutes
            "get_crypto_social_sentiment": 600,  # 10 minutes
            "analyze_crypto_news_sentiment": 900,  # 15 minutes
            
            # Fear/Greed index updates daily
            "get_market_fear_greed_index": 3600,  # 1 hour
        }
        
        return cache_durations.get(tool_name, self.config.get("cache_ttl", 300))

# Global MCP client instance
mcp_client = None

def get_mcp_client(config: Dict[str, Any]) -> MCPCryptoClient:
    """Get or create MCP client instance"""
    global mcp_client
    if mcp_client is None:
        mcp_client = MCPCryptoClient(config)
    return mcp_client

@tool
async def get_crypto_price_data_mcp(symbol: str, days: int = 30, config: Optional[Dict[str, Any]] = None) -> str:
    """
    Get historical price data for a cryptocurrency via MCP server
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        days: Number of days of historical data (default: 30)
        config: Configuration dictionary
    
    Returns:
        JSON string containing price data, market caps, and volumes
    """
    if not config:
        return json.dumps({"error": "Configuration not provided"})
    
    client = get_mcp_client(config)
    async with client as c:
        result = await c.call_mcp_tool(
            c.crypto_server_url,
            "get_crypto_price_data",
            {"symbol": symbol, "days": days}
        )
        return json.dumps(result, indent=2)

@tool
async def get_crypto_market_data_mcp(symbol: str, config: Optional[Dict[str, Any]] = None) -> str:
    """
    Get current market data for a cryptocurrency via MCP server
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        config: Configuration dictionary
    
    Returns:
        JSON string containing current price, market cap, volume, and other metrics
    """
    if not config:
        return json.dumps({"error": "Configuration not provided"})
    
    client = get_mcp_client(config)
    async with client as c:
        result = await c.call_mcp_tool(
            c.crypto_server_url,
            "get_crypto_market_data",
            {"symbol": symbol}
        )
        return json.dumps(result, indent=2)

@tool
async def get_crypto_orderbook_mcp(symbol: str, config: Optional[Dict[str, Any]] = None) -> str:
    """
    Get order book data for a cryptocurrency via MCP server
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        config: Configuration dictionary
    
    Returns:
        JSON string containing bid/ask data
    """
    if not config:
        return json.dumps({"error": "Configuration not provided"})
    
    client = get_mcp_client(config)
    async with client as c:
        result = await c.call_mcp_tool(
            c.crypto_server_url,
            "get_crypto_orderbook",
            {"symbol": symbol}
        )
        return json.dumps(result, indent=2)

@tool
async def calculate_crypto_indicators_mcp(symbol: str, days: int = 30, config: Optional[Dict[str, Any]] = None) -> str:
    """
    Calculate technical indicators for a cryptocurrency via MCP server
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        days: Number of days for calculation (default: 30)
        config: Configuration dictionary
    
    Returns:
        JSON string containing calculated technical indicators
    """
    if not config:
        return json.dumps({"error": "Configuration not provided"})
    
    client = get_mcp_client(config)
    async with client as c:
        result = await c.call_mcp_tool(
            c.crypto_server_url,
            "calculate_crypto_indicators",
            {"symbol": symbol, "days": days}
        )
        return json.dumps(result, indent=2)

@tool
async def get_crypto_news_mcp(symbol: str, days: int = 7, config: Optional[Dict[str, Any]] = None) -> str:
    """
    Get news articles related to a cryptocurrency via MCP server
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        days: Number of days back to search (default: 7)
        config: Configuration dictionary
    
    Returns:
        JSON string containing news articles with sentiment analysis
    """
    if not config:
        return json.dumps({"error": "Configuration not provided"})
    
    client = get_mcp_client(config)
    async with client as c:
        result = await c.call_mcp_tool(
            c.news_server_url,
            "get_crypto_news",
            {"symbol": symbol, "days": days}
        )
        return json.dumps(result, indent=2)

@tool
async def get_crypto_social_sentiment_mcp(symbol: str, config: Optional[Dict[str, Any]] = None) -> str:
    """
    Get social media sentiment for a cryptocurrency via MCP server
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        config: Configuration dictionary
    
    Returns:
        JSON string containing aggregated social sentiment data
    """
    if not config:
        return json.dumps({"error": "Configuration not provided"})
    
    client = get_mcp_client(config)
    async with client as c:
        result = await c.call_mcp_tool(
            c.news_server_url,
            "get_crypto_social_sentiment",
            {"symbol": symbol}
        )
        return json.dumps(result, indent=2)

@tool
async def get_market_fear_greed_index_mcp(config: Optional[Dict[str, Any]] = None) -> str:
    """
    Get the current crypto Fear & Greed index via MCP server
    
    Args:
        config: Configuration dictionary
    
    Returns:
        JSON string containing Fear & Greed index value and interpretation
    """
    if not config:
        return json.dumps({"error": "Configuration not provided"})
    
    client = get_mcp_client(config)
    async with client as c:
        result = await c.call_mcp_tool(
            c.news_server_url,
            "get_market_fear_greed_index",
            {}
        )
        return json.dumps(result, indent=2)

@tool
async def analyze_crypto_news_sentiment_mcp(symbol: str, days: int = 7, config: Optional[Dict[str, Any]] = None) -> str:
    """
    Get comprehensive sentiment analysis combining news and social data via MCP server
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        days: Number of days back to analyze (default: 7)
        config: Configuration dictionary
    
    Returns:
        JSON string containing comprehensive sentiment analysis
    """
    if not config:
        return json.dumps({"error": "Configuration not provided"})
    
    client = get_mcp_client(config)
    async with client as c:
        result = await c.call_mcp_tool(
            c.news_server_url,
            "analyze_crypto_news_sentiment",
            {"symbol": symbol, "days": days}
        )
        return json.dumps(result, indent=2)

# Synchronous wrappers for compatibility with existing codebase
def get_crypto_price_data_mcp_sync(symbol: str, days: int = 30, config: Optional[Dict[str, Any]] = None) -> str:
    """Synchronous wrapper for get_crypto_price_data_mcp"""
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(get_crypto_price_data_mcp(symbol, days, config))
    except RuntimeError:
        # If no event loop exists, create a new one
        return asyncio.run(get_crypto_price_data_mcp(symbol, days, config))

def get_crypto_market_data_mcp_sync(symbol: str, config: Optional[Dict[str, Any]] = None) -> str:
    """Synchronous wrapper for get_crypto_market_data_mcp"""
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(get_crypto_market_data_mcp(symbol, config))
    except RuntimeError:
        return asyncio.run(get_crypto_market_data_mcp(symbol, config))

def get_crypto_orderbook_mcp_sync(symbol: str, config: Optional[Dict[str, Any]] = None) -> str:
    """Synchronous wrapper for get_crypto_orderbook_mcp"""
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(get_crypto_orderbook_mcp(symbol, config))
    except RuntimeError:
        return asyncio.run(get_crypto_orderbook_mcp(symbol, config))

def calculate_crypto_indicators_mcp_sync(symbol: str, days: int = 30, config: Optional[Dict[str, Any]] = None) -> str:
    """Synchronous wrapper for calculate_crypto_indicators_mcp"""
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(calculate_crypto_indicators_mcp(symbol, days, config))
    except RuntimeError:
        return asyncio.run(calculate_crypto_indicators_mcp(symbol, days, config))

def get_crypto_news_mcp_sync(symbol: str, days: int = 7, config: Optional[Dict[str, Any]] = None) -> str:
    """Synchronous wrapper for get_crypto_news_mcp"""
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(get_crypto_news_mcp(symbol, days, config))
    except RuntimeError:
        return asyncio.run(get_crypto_news_mcp(symbol, days, config))

def get_crypto_social_sentiment_mcp_sync(symbol: str, config: Optional[Dict[str, Any]] = None) -> str:
    """Synchronous wrapper for get_crypto_social_sentiment_mcp"""
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(get_crypto_social_sentiment_mcp(symbol, config))
    except RuntimeError:
        return asyncio.run(get_crypto_social_sentiment_mcp(symbol, config))

def get_market_fear_greed_index_mcp_sync(config: Optional[Dict[str, Any]] = None) -> str:
    """Synchronous wrapper for get_market_fear_greed_index_mcp"""
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(get_market_fear_greed_index_mcp(config))
    except RuntimeError:
        return asyncio.run(get_market_fear_greed_index_mcp(config))

def analyze_crypto_news_sentiment_mcp_sync(symbol: str, days: int = 7, config: Optional[Dict[str, Any]] = None) -> str:
    """Synchronous wrapper for analyze_crypto_news_sentiment_mcp"""
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(analyze_crypto_news_sentiment_mcp(symbol, days, config))
    except RuntimeError:
        return asyncio.run(analyze_crypto_news_sentiment_mcp(symbol, days, config))