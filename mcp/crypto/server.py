"""
MCP Server for Cryptocurrency Data
Provides market data, price information, and trading data for crypto assets
"""
import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

import aiohttp
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CryptoDataProvider:
    def __init__(self):
        self.coingecko_api_key = os.getenv("COINGECKO_API_KEY")
        self.coinmarketcap_api_key = os.getenv("COINMARKETCAP_API_KEY")
        self.binance_api_key = os.getenv("BINANCE_API_KEY")
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def get_crypto_price_data(self, symbol: str, days: int = 30) -> Dict[str, Any]:
        """Get historical price data for a cryptocurrency"""
        try:
            # Convert symbol to CoinGecko format (e.g., BTC -> bitcoin)
            coin_id = await self._get_coingecko_id(symbol)
            
            url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
            params = {
                "vs_currency": "usd",
                "days": days,
                "interval": "daily"
            }
            
            if self.coingecko_api_key:
                params["x_cg_demo_api_key"] = self.coingecko_api_key
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "symbol": symbol.upper(),
                        "prices": data.get("prices", []),
                        "market_caps": data.get("market_caps", []),
                        "total_volumes": data.get("total_volumes", []),
                        "days": days
                    }
                else:
                    logger.error(f"CoinGecko API error: {response.status}")
                    return {}
        except Exception as e:
            logger.error(f"Error fetching price data: {e}")
            return {}

    async def get_crypto_market_data(self, symbol: str) -> Dict[str, Any]:
        """Get current market data for a cryptocurrency"""
        try:
            coin_id = await self._get_coingecko_id(symbol)
            
            url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
            params = {
                "localization": "false",
                "tickers": "false",
                "market_data": "true",
                "community_data": "false",
                "developer_data": "false",
                "sparkline": "false"
            }
            
            if self.coingecko_api_key:
                params["x_cg_demo_api_key"] = self.coingecko_api_key
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    market_data = data.get("market_data", {})
                    return {
                        "symbol": symbol.upper(),
                        "name": data.get("name", ""),
                        "current_price": market_data.get("current_price", {}).get("usd"),
                        "market_cap": market_data.get("market_cap", {}).get("usd"),
                        "total_volume": market_data.get("total_volume", {}).get("usd"),
                        "price_change_24h": market_data.get("price_change_24h"),
                        "price_change_percentage_24h": market_data.get("price_change_percentage_24h"),
                        "market_cap_rank": market_data.get("market_cap_rank"),
                        "circulating_supply": market_data.get("circulating_supply"),
                        "total_supply": market_data.get("total_supply"),
                        "max_supply": market_data.get("max_supply")
                    }
                else:
                    logger.error(f"CoinGecko API error: {response.status}")
                    return {}
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            return {}

    async def get_binance_orderbook(self, symbol: str) -> Dict[str, Any]:
        """Get order book data from Binance"""
        try:
            # Convert symbol to Binance format (e.g., BTC -> BTCUSDT)
            binance_symbol = f"{symbol.upper()}USDT"
            
            url = f"https://api.binance.com/api/v3/depth"
            params = {
                "symbol": binance_symbol,
                "limit": 100
            }
            
            # Add headers if API key is available
            headers = {}
            if self.binance_api_key:
                headers["X-MBX-APIKEY"] = self.binance_api_key
            
            async with self.session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "symbol": symbol.upper(),
                        "bids": data.get("bids", [])[:10],  # Top 10 bids
                        "asks": data.get("asks", [])[:10],  # Top 10 asks
                        "timestamp": data.get("timestamp")
                    }
                else:
                    logger.error(f"Binance API error: {response.status}")
                    return {}
        except Exception as e:
            logger.error(f"Error fetching order book: {e}")
            return {}

    async def get_binance_market_data(self, symbol: str) -> Dict[str, Any]:
        """Get real-time market data from Binance"""
        try:
            # Convert symbol to Binance format
            binance_symbol = f"{symbol.upper()}USDT"
            
            # Get 24hr ticker statistics
            url = f"https://api.binance.com/api/v3/ticker/24hr"
            params = {"symbol": binance_symbol}
            
            # Add headers if API key is available
            headers = {}
            if self.binance_api_key:
                headers["X-MBX-APIKEY"] = self.binance_api_key
            
            async with self.session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "symbol": symbol.upper(),
                        "current_price": float(data.get("lastPrice", 0)),
                        "price_change_24h": float(data.get("priceChange", 0)),
                        "price_change_percentage_24h": float(data.get("priceChangePercent", 0)),
                        "high_24h": float(data.get("highPrice", 0)),
                        "low_24h": float(data.get("lowPrice", 0)),
                        "volume_24h": float(data.get("volume", 0)),
                        "volume_24h_usd": float(data.get("quoteVolume", 0)),
                        "bid_price": float(data.get("bidPrice", 0)),
                        "ask_price": float(data.get("askPrice", 0)),
                        "timestamp": data.get("closeTime")
                    }
                else:
                    logger.error(f"Binance API error: {response.status}")
                    return {}
        except Exception as e:
            logger.error(f"Error fetching Binance market data: {e}")
            return {}

    async def get_batch_market_data(self, symbols: List[str]) -> Dict[str, Any]:
        """Get market data for multiple cryptocurrencies"""
        try:
            # Use CoinGecko for batch data (more efficient)
            symbol_ids = [await self._get_coingecko_id(symbol) for symbol in symbols]
            
            url = "https://api.coingecko.com/api/v3/coins/markets"
            params = {
                "vs_currency": "usd",
                "ids": ",".join(symbol_ids),
                "order": "market_cap_desc",
                "per_page": len(symbols),
                "page": 1,
                "sparkline": "false"
            }
            
            if self.coingecko_api_key:
                params["x_cg_demo_api_key"] = self.coingecko_api_key
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    result = {}
                    
                    for coin in data:
                        symbol = coin.get("symbol", "").upper()
                        result[symbol] = {
                            "symbol": symbol,
                            "name": coin.get("name", ""),
                            "current_price": coin.get("current_price"),
                            "market_cap": coin.get("market_cap"),
                            "total_volume": coin.get("total_volume"),
                            "price_change_24h": coin.get("price_change_24h"),
                            "price_change_percentage_24h": coin.get("price_change_percentage_24h"),
                            "market_cap_rank": coin.get("market_cap_rank"),
                            "image": coin.get("image"),
                            "last_updated": coin.get("last_updated")
                        }
                    
                    return {"markets": result, "count": len(result)}
                else:
                    logger.error(f"CoinGecko batch API error: {response.status}")
                    return {}
        except Exception as e:
            logger.error(f"Error fetching batch market data: {e}")
            return {}

    async def _get_coingecko_id(self, symbol: str) -> str:
        """Convert symbol to CoinGecko coin ID"""
        # Simple mapping for common cryptocurrencies
        symbol_to_id = {
            "BTC": "bitcoin",
            "ETH": "ethereum",
            "BNB": "binancecoin",
            "XRP": "ripple",
            "ADA": "cardano",
            "DOGE": "dogecoin",
            "MATIC": "matic-network",
            "SOL": "solana",
            "DOT": "polkadot",
            "AVAX": "avalanche-2",
            "SHIB": "shiba-inu",
            "LTC": "litecoin",
            "ATOM": "cosmos",
            "LINK": "chainlink",
            "XLM": "stellar"
        }
        return symbol_to_id.get(symbol.upper(), symbol.lower())

# Initialize global crypto provider
crypto_provider = None

async def get_crypto_price_data(symbol: str, days: int = 30) -> Dict[str, Any]:
    """
    Get historical price data for a cryptocurrency
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        days: Number of days of historical data (default: 30)
    
    Returns:
        Dictionary containing price data, market caps, and volumes
    """
    global crypto_provider
    if crypto_provider is None:
        crypto_provider = CryptoDataProvider()
    
    async with crypto_provider as provider:
        return await provider.get_crypto_price_data(symbol, days)

async def get_crypto_market_data(symbol: str) -> Dict[str, Any]:
    """
    Get current market data for a cryptocurrency
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
    
    Returns:
        Dictionary containing current price, market cap, volume, and other metrics
    """
    global crypto_provider
    if crypto_provider is None:
        crypto_provider = CryptoDataProvider()
    
    async with crypto_provider as provider:
        return await provider.get_crypto_market_data(symbol)

async def get_crypto_orderbook(symbol: str) -> Dict[str, Any]:
    """
    Get order book data for a cryptocurrency from Binance
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
    
    Returns:
        Dictionary containing bid/ask data
    """
    global crypto_provider
    if crypto_provider is None:
        crypto_provider = CryptoDataProvider()
    
    async with crypto_provider as provider:
        return await provider.get_binance_orderbook(symbol)

async def get_binance_market_data(symbol: str) -> Dict[str, Any]:
    """
    Get real-time market data from Binance (more accurate than CoinGecko)
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
    
    Returns:
        Dictionary containing Binance market data with bid/ask prices and volumes
    """
    global crypto_provider
    if crypto_provider is None:
        crypto_provider = CryptoDataProvider()
    
    async with crypto_provider as provider:
        return await provider.get_binance_market_data(symbol)

async def get_batch_market_data(symbols: str) -> Dict[str, Any]:
    """
    Get market data for multiple cryptocurrencies at once
    
    Args:
        symbols: Comma-separated cryptocurrency symbols (e.g., "BTC,ETH,SOL")
    
    Returns:
        Dictionary containing market data for all requested symbols
    """
    global crypto_provider
    if crypto_provider is None:
        crypto_provider = CryptoDataProvider()
    
    symbol_list = [s.strip().upper() for s in symbols.split(",")]
    async with crypto_provider as provider:
        return await provider.get_batch_market_data(symbol_list)

async def calculate_crypto_indicators(symbol: str, days: int = 30) -> Dict[str, Any]:
    """
    Calculate technical indicators for a cryptocurrency
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        days: Number of days for calculation (default: 30)
    
    Returns:
        Dictionary containing calculated technical indicators
    """
    global crypto_provider
    if crypto_provider is None:
        crypto_provider = CryptoDataProvider()
    
    async with crypto_provider as provider:
        price_data = await provider.get_crypto_price_data(symbol, days)
        
        if not price_data or not price_data.get("prices"):
            return {"error": "No price data available"}
        
        prices = [float(price[1]) for price in price_data["prices"]]
        volumes = [float(vol[1]) for vol in price_data.get("total_volumes", [])]
        
        # Calculate simple indicators
        df = pd.DataFrame({
            "price": prices,
            "volume": volumes[:len(prices)]
        })
        
        # Simple moving averages
        df["sma_7"] = df["price"].rolling(window=7).mean()
        df["sma_14"] = df["price"].rolling(window=14).mean()
        df["sma_30"] = df["price"].rolling(window=min(30, len(df))).mean()
        
        # RSI calculation
        delta = df["price"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df["rsi"] = 100 - (100 / (1 + rs))
        
        latest = df.iloc[-1]
        
        return {
            "symbol": symbol.upper(),
            "current_price": prices[-1],
            "sma_7": latest["sma_7"],
            "sma_14": latest["sma_14"],
            "sma_30": latest["sma_30"],
            "rsi": latest["rsi"],
            "volume": latest["volume"],
            "price_change_7d": ((prices[-1] - prices[-7]) / prices[-7] * 100) if len(prices) > 7 else None,
            "volume_avg_7d": df["volume"].tail(7).mean() if len(df) > 7 else None
        }

if __name__ == "__main__":
    # Create HTTP wrapper around MCP server with tool endpoints
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    import uvicorn
    
    app = FastAPI()
    
    # Request models for tool endpoints
    class PriceDataRequest(BaseModel):
        symbol: str
        days: int = 30
    
    class MarketDataRequest(BaseModel):
        symbol: str
    
    class OrderbookRequest(BaseModel):
        symbol: str
    
    class BatchMarketDataRequest(BaseModel):
        symbols: str
    
    class IndicatorsRequest(BaseModel):
        symbol: str
        days: int = 30
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "message": "Crypto MCP Server is running"}
    
    @app.get("/")
    async def root():
        return {"name": "CryptoDataServer", "version": "1.0", "status": "running"}
    
    # MCP tool endpoints
    @app.post("/tools/get_crypto_price_data")
    async def http_get_crypto_price_data(request: PriceDataRequest):
        try:
            result = await get_crypto_price_data(request.symbol, request.days)
            return result
        except Exception as e:
            logger.error(f"Error in get_crypto_price_data endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/tools/get_crypto_market_data")
    async def http_get_crypto_market_data(request: MarketDataRequest):
        try:
            result = await get_crypto_market_data(request.symbol)
            return result
        except Exception as e:
            logger.error(f"Error in get_crypto_market_data endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/tools/get_crypto_orderbook")
    async def http_get_crypto_orderbook(request: OrderbookRequest):
        try:
            result = await get_crypto_orderbook(request.symbol)
            return result
        except Exception as e:
            logger.error(f"Error in get_crypto_orderbook endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/tools/get_binance_market_data")
    async def http_get_binance_market_data(request: MarketDataRequest):
        try:
            result = await get_binance_market_data(request.symbol)
            return result
        except Exception as e:
            logger.error(f"Error in get_binance_market_data endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/tools/get_batch_market_data")
    async def http_get_batch_market_data(request: BatchMarketDataRequest):
        try:
            result = await get_batch_market_data(request.symbols)
            return result
        except Exception as e:
            logger.error(f"Error in get_batch_market_data endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/tools/calculate_crypto_indicators")
    async def http_calculate_crypto_indicators(request: IndicatorsRequest):
        try:
            result = await calculate_crypto_indicators(request.symbol, request.days)
            return result
        except Exception as e:
            logger.error(f"Error in calculate_crypto_indicators endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # Run the HTTP server
    uvicorn.run(app, host="0.0.0.0", port=9000)
