"""
MCP Server for Crypto News and Sentiment Analysis
Provides news articles, social media sentiment, and market sentiment data
"""
import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
import re

import aiohttp
import feedparser
from textblob import TextBlob

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CryptoNewsProvider:
    def __init__(self):
        self.news_api_key = os.getenv("NEWS_API_KEY")
        self.reddit_client_id = os.getenv("REDDIT_CLIENT_ID")
        self.reddit_client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def get_crypto_news(self, symbol: str, days: int = 7) -> Dict[str, Any]:
        """Get news articles related to a cryptocurrency"""
        try:
            # Use NewsAPI for recent crypto news
            if self.news_api_key:
                news_data = await self._get_news_api_data(symbol, days)
            else:
                news_data = await self._get_rss_news_data(symbol)
            
            # Add sentiment analysis
            for article in news_data.get("articles", []):
                if article.get("description"):
                    article["sentiment"] = self._analyze_sentiment(article["description"])
            
            return {
                "symbol": symbol.upper(),
                "articles": news_data.get("articles", []),
                "total_results": len(news_data.get("articles", [])),
                "days_back": days,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching crypto news: {e}")
            return {"error": str(e)}

    async def get_social_sentiment(self, symbol: str) -> Dict[str, Any]:
        """Get social media sentiment for a cryptocurrency"""
        try:
            # Aggregate sentiment from multiple sources
            reddit_sentiment = await self._get_reddit_sentiment(symbol)
            
            # Calculate overall sentiment
            sentiments = [reddit_sentiment]
            avg_sentiment = sum(s["score"] for s in sentiments if "score" in s) / len(sentiments)
            
            return {
                "symbol": symbol.upper(),
                "overall_sentiment": {
                    "score": avg_sentiment,
                    "label": self._classify_sentiment_score(avg_sentiment)
                },
                "sources": {
                    "reddit": reddit_sentiment
                },
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching social sentiment: {e}")
            return {"error": str(e)}

    async def get_fear_greed_index(self) -> Dict[str, Any]:
        """Get crypto fear and greed index"""
        try:
            url = "https://api.alternative.me/fng/"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    fng_data = data.get("data", [{}])[0]
                    
                    return {
                        "value": int(fng_data.get("value", 0)),
                        "value_classification": fng_data.get("value_classification", ""),
                        "timestamp": fng_data.get("timestamp", ""),
                        "time_until_update": fng_data.get("time_until_update", ""),
                        "interpretation": self._interpret_fng_score(int(fng_data.get("value", 0)))
                    }
                else:
                    logger.error(f"Fear & Greed API error: {response.status}")
                    return {"error": "Failed to fetch Fear & Greed index"}
        except Exception as e:
            logger.error(f"Error fetching Fear & Greed index: {e}")
            return {"error": str(e)}

    async def _get_news_api_data(self, symbol: str, days: int) -> Dict[str, Any]:
        """Fetch news from NewsAPI"""
        try:
            crypto_names = {
                "BTC": "bitcoin",
                "ETH": "ethereum", 
                "BNB": "binance",
                "ADA": "cardano",
                "DOT": "polkadot",
                "LINK": "chainlink",
                "XRP": "ripple",
                "LTC": "litecoin",
                "DOGE": "dogecoin"
            }
            
            search_term = crypto_names.get(symbol.upper(), symbol.lower())
            from_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
            
            url = "https://newsapi.org/v2/everything"
            params = {
                "q": f"{search_term} OR {symbol.upper()} cryptocurrency crypto",
                "from": from_date,
                "sortBy": "relevancy",
                "language": "en",
                "pageSize": 20,
                "apiKey": self.news_api_key
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"NewsAPI error: {response.status}")
                    return {"articles": []}
        except Exception as e:
            logger.error(f"NewsAPI fetch error: {e}")
            return {"articles": []}

    async def _get_rss_news_data(self, symbol: str) -> Dict[str, Any]:
        """Fetch news from RSS feeds as fallback"""
        try:
            # Use CoinDesk RSS as a fallback
            rss_urls = [
                "https://www.coindesk.com/arc/outboundfeeds/rss/",
                "https://cointelegraph.com/rss",
                "https://www.cryptonews.com/news/feed/"
            ]
            
            all_articles = []
            for rss_url in rss_urls:
                try:
                    async with self.session.get(rss_url) as response:
                        if response.status == 200:
                            text = await response.text()
                            feed = feedparser.parse(text)
                            
                            for entry in feed.entries[:10]:  # Limit to 10 per feed
                                if symbol.upper() in entry.title.upper() or symbol.lower() in entry.title.lower():
                                    all_articles.append({
                                        "title": entry.title,
                                        "description": entry.get("summary", ""),
                                        "url": entry.link,
                                        "publishedAt": entry.get("published", ""),
                                        "source": {"name": feed.feed.get("title", "RSS Feed")}
                                    })
                except Exception as e:
                    logger.warning(f"RSS feed error for {rss_url}: {e}")
                    continue
            
            return {"articles": all_articles}
        except Exception as e:
            logger.error(f"RSS news fetch error: {e}")
            return {"articles": []}

    async def _get_reddit_sentiment(self, symbol: str) -> Dict[str, Any]:
        """Get Reddit sentiment for a cryptocurrency"""
        try:
            # Use Reddit API without authentication for public data
            subreddits = ["cryptocurrency", "bitcoin", "ethereum", "cryptomarkets"]
            search_terms = [symbol.upper(), symbol.lower()]
            
            all_posts = []
            for subreddit in subreddits:
                for term in search_terms:
                    url = f"https://www.reddit.com/r/{subreddit}/search.json"
                    params = {
                        "q": term,
                        "restrict_sr": "1",
                        "sort": "hot",
                        "limit": 10,
                        "t": "week"
                    }
                    
                    try:
                        async with self.session.get(url, params=params) as response:
                            if response.status == 200:
                                data = await response.json()
                                posts = data.get("data", {}).get("children", [])
                                all_posts.extend([post["data"] for post in posts])
                    except Exception as e:
                        logger.warning(f"Reddit API error for {subreddit}: {e}")
                        continue
            
            # Analyze sentiment of posts
            if not all_posts:
                return {"score": 0, "label": "neutral", "post_count": 0}
            
            sentiments = []
            for post in all_posts[:20]:  # Limit analysis
                title = post.get("title", "")
                selftext = post.get("selftext", "")
                text = f"{title} {selftext}".strip()
                
                if text:
                    sentiment = self._analyze_sentiment(text)
                    sentiments.append(sentiment["score"])
            
            if sentiments:
                avg_sentiment = sum(sentiments) / len(sentiments)
                return {
                    "score": avg_sentiment,
                    "label": self._classify_sentiment_score(avg_sentiment),
                    "post_count": len(all_posts),
                    "analyzed_posts": len(sentiments)
                }
            else:
                return {"score": 0, "label": "neutral", "post_count": 0}
                
        except Exception as e:
            logger.error(f"Reddit sentiment error: {e}")
            return {"error": str(e)}

    def _analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text using TextBlob"""
        try:
            blob = TextBlob(text)
            sentiment_score = blob.sentiment.polarity  # -1 (negative) to 1 (positive)
            
            return {
                "score": sentiment_score,
                "label": self._classify_sentiment_score(sentiment_score),
                "subjectivity": blob.sentiment.subjectivity
            }
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {"score": 0, "label": "neutral", "subjectivity": 0}

    def _classify_sentiment_score(self, score: float) -> str:
        """Classify sentiment score into categories"""
        if score > 0.1:
            return "positive"
        elif score < -0.1:
            return "negative"
        else:
            return "neutral"

    def _interpret_fng_score(self, score: int) -> str:
        """Interpret Fear & Greed index score"""
        if score >= 75:
            return "Extreme Greed - Market may be overbought, consider caution"
        elif score >= 55:
            return "Greed - Market sentiment is positive"
        elif score >= 45:
            return "Neutral - Balanced market sentiment"
        elif score >= 25:
            return "Fear - Market sentiment is negative"
        else:
            return "Extreme Fear - Market may be oversold, potential buying opportunity"

# Initialize global news provider
news_provider = None

async def get_crypto_news(symbol: str, days: int = 7) -> Dict[str, Any]:
    """
    Get news articles related to a cryptocurrency
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        days: Number of days back to search (default: 7)
    
    Returns:
        Dictionary containing news articles with sentiment analysis
    """
    global news_provider
    if news_provider is None:
        news_provider = CryptoNewsProvider()
    
    async with news_provider as provider:
        return await provider.get_crypto_news(symbol, days)

async def get_crypto_social_sentiment(symbol: str) -> Dict[str, Any]:
    """
    Get social media sentiment for a cryptocurrency
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
    
    Returns:
        Dictionary containing aggregated social sentiment data
    """
    global news_provider
    if news_provider is None:
        news_provider = CryptoNewsProvider()
    
    async with news_provider as provider:
        return await provider.get_social_sentiment(symbol)

async def get_market_fear_greed_index() -> Dict[str, Any]:
    """
    Get the current crypto Fear & Greed index
    
    Returns:
        Dictionary containing Fear & Greed index value and interpretation
    """
    global news_provider
    if news_provider is None:
        news_provider = CryptoNewsProvider()
    
    async with news_provider as provider:
        return await provider.get_fear_greed_index()

async def analyze_crypto_news_sentiment(symbol: str, days: int = 7) -> Dict[str, Any]:
    """
    Get comprehensive sentiment analysis combining news and social data
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC, ETH)
        days: Number of days back to analyze (default: 7)
    
    Returns:
        Dictionary containing comprehensive sentiment analysis
    """
    global news_provider
    if news_provider is None:
        news_provider = CryptoNewsProvider()
    
    async with news_provider as provider:
        news_data = await provider.get_crypto_news(symbol, days)
        social_data = await provider.get_social_sentiment(symbol)
        fng_data = await provider.get_fear_greed_index()
        
        # Calculate aggregated sentiment
        news_sentiments = [
            article.get("sentiment", {}).get("score", 0) 
            for article in news_data.get("articles", [])
            if article.get("sentiment")
        ]
        
        news_avg = sum(news_sentiments) / len(news_sentiments) if news_sentiments else 0
        social_score = social_data.get("overall_sentiment", {}).get("score", 0)
        
        # Weight the scores (news: 40%, social: 40%, fear/greed: 20%)
        overall_score = (news_avg * 0.4) + (social_score * 0.4) + ((fng_data.get("value", 50) - 50) / 100 * 0.2)
        
        return {
            "symbol": symbol.upper(),
            "overall_sentiment": {
                "score": overall_score,
                "label": news_provider._classify_sentiment_score(overall_score) if news_provider else "neutral"
            },
            "news_sentiment": {
                "score": news_avg,
                "article_count": len(news_sentiments)
            },
            "social_sentiment": social_data.get("overall_sentiment", {}),
            "fear_greed_index": fng_data,
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    # Create HTTP wrapper around MCP server with tool endpoints
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    import uvicorn
    
    app = FastAPI()
    
    # Request models for tool endpoints
    class NewsRequest(BaseModel):
        symbol: str
        days: int = 7
    
    class SentimentRequest(BaseModel):
        symbol: str
    
    class FearGreedRequest(BaseModel):
        pass
    
    class NewsSentimentRequest(BaseModel):
        symbol: str
        days: int = 7
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "message": "Crypto News MCP Server is running"}
    
    @app.get("/")
    async def root():
        return {"name": "CryptoNewsServer", "version": "1.0", "status": "running"}
    
    # MCP tool endpoints
    @app.post("/tools/get_crypto_news")
    async def http_get_crypto_news(request: NewsRequest):
        try:
            result = await get_crypto_news(request.symbol, request.days)
            return result
        except Exception as e:
            logger.error(f"Error in get_crypto_news endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/tools/get_crypto_social_sentiment")
    async def http_get_crypto_social_sentiment(request: SentimentRequest):
        try:
            result = await get_crypto_social_sentiment(request.symbol)
            return result
        except Exception as e:
            logger.error(f"Error in get_crypto_social_sentiment endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/tools/get_market_fear_greed_index")
    async def http_get_market_fear_greed_index():
        try:
            result = await get_market_fear_greed_index()
            return result
        except Exception as e:
            logger.error(f"Error in get_market_fear_greed_index endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/tools/analyze_crypto_news_sentiment")
    async def http_analyze_crypto_news_sentiment(request: NewsSentimentRequest):
        try:
            result = await analyze_crypto_news_sentiment(request.symbol, request.days)
            return result
        except Exception as e:
            logger.error(f"Error in analyze_crypto_news_sentiment endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # Run the HTTP server
    uvicorn.run(app, host="0.0.0.0", port=9001)
