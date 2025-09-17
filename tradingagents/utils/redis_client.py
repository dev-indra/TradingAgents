"""
Redis client utility for TradingAgents application.
Provides connection handling, health checks, and caching operations.
"""

import redis
import json
import logging
from typing import Any, Optional, Union
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class RedisClient:
    """Redis client wrapper with caching functionality."""
    
    def __init__(self, redis_url: str = "redis://localhost:6379", default_ttl: int = 300):
        """
        Initialize Redis client.
        
        Args:
            redis_url: Redis connection URL
            default_ttl: Default time-to-live for cached items in seconds
        """
        self.redis_url = redis_url
        self.default_ttl = default_ttl
        self._client = None
        self._is_connected = False
        
    def _get_client(self) -> redis.Redis:
        """Get or create Redis client connection."""
        if self._client is None:
            try:
                self._client = redis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30
                )
                # Test connection
                self._client.ping()
                self._is_connected = True
                logger.info(f"Connected to Redis at {self.redis_url}")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                self._is_connected = False
                raise
        return self._client
    
    def is_healthy(self) -> bool:
        """Check if Redis connection is healthy."""
        try:
            client = self._get_client()
            client.ping()
            self._is_connected = True
            return True
        except Exception as e:
            logger.warning(f"Redis health check failed: {e}")
            self._is_connected = False
            return False
    
    def get_health_info(self) -> dict:
        """Get detailed health information about Redis."""
        try:
            client = self._get_client()
            info = client.info()
            return {
                "status": "healthy",
                "connected": True,
                "redis_version": info.get("redis_version", "unknown"),
                "used_memory": info.get("used_memory_human", "unknown"),
                "connected_clients": info.get("connected_clients", 0),
                "uptime_seconds": info.get("uptime_in_seconds", 0),
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "connected": False,
                "error": str(e),
                "last_check": datetime.utcnow().isoformat()
            }
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set a value in Redis cache.
        
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time-to-live in seconds (uses default if None)
            
        Returns:
            True if successful, False otherwise
        """
        if not self._is_connected:
            if not self.is_healthy():
                return False
        
        try:
            client = self._get_client()
            ttl = ttl or self.default_ttl
            
            # Serialize value to JSON
            serialized_value = json.dumps({
                "value": value,
                "timestamp": datetime.utcnow().isoformat(),
                "ttl": ttl
            })
            
            result = client.setex(key, ttl, serialized_value)
            return bool(result)
        except Exception as e:
            logger.error(f"Failed to set cache key '{key}': {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get a value from Redis cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value if found and valid, None otherwise
        """
        if not self._is_connected:
            if not self.is_healthy():
                return None
        
        try:
            client = self._get_client()
            cached_data = client.get(key)
            
            if cached_data is None:
                return None
            
            # Deserialize from JSON
            data = json.loads(cached_data)
            return data.get("value")
        except Exception as e:
            logger.error(f"Failed to get cache key '{key}': {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """
        Delete a key from Redis cache.
        
        Args:
            key: Cache key to delete
            
        Returns:
            True if successful, False otherwise
        """
        if not self._is_connected:
            if not self.is_healthy():
                return False
        
        try:
            client = self._get_client()
            result = client.delete(key)
            return bool(result)
        except Exception as e:
            logger.error(f"Failed to delete cache key '{key}': {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """
        Check if a key exists in Redis cache.
        
        Args:
            key: Cache key to check
            
        Returns:
            True if key exists, False otherwise
        """
        if not self._is_connected:
            if not self.is_healthy():
                return False
        
        try:
            client = self._get_client()
            return bool(client.exists(key))
        except Exception as e:
            logger.error(f"Failed to check existence of cache key '{key}': {e}")
            return False
    
    def get_ttl(self, key: str) -> int:
        """
        Get the time-to-live for a key in seconds.
        
        Args:
            key: Cache key
            
        Returns:
            TTL in seconds, -1 if key exists but has no TTL, -2 if key doesn't exist
        """
        if not self._is_connected:
            if not self.is_healthy():
                return -2
        
        try:
            client = self._get_client()
            return client.ttl(key)
        except Exception as e:
            logger.error(f"Failed to get TTL for cache key '{key}': {e}")
            return -2
    
    def flush_all(self) -> bool:
        """
        Clear all cached data (use with caution).
        
        Returns:
            True if successful, False otherwise
        """
        if not self._is_connected:
            if not self.is_healthy():
                return False
        
        try:
            client = self._get_client()
            client.flushall()
            logger.info("Redis cache cleared")
            return True
        except Exception as e:
            logger.error(f"Failed to flush Redis cache: {e}")
            return False
    
    def get_cache_stats(self) -> dict:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        try:
            client = self._get_client()
            info = client.info()
            
            return {
                "total_keys": info.get("db0", {}).get("keys", 0) if "db0" in info else 0,
                "used_memory": info.get("used_memory_human", "0B"),
                "hit_rate": info.get("keyspace_hits", 0) / max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0), 1) * 100,
                "connected_clients": info.get("connected_clients", 0),
                "uptime_seconds": info.get("uptime_in_seconds", 0)
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {
                "total_keys": 0,
                "used_memory": "0B",
                "hit_rate": 0.0,
                "connected_clients": 0,
                "uptime_seconds": 0,
                "error": str(e)
            }


# Global Redis client instance
_redis_client = None


def get_redis_client(config: dict = None) -> RedisClient:
    """
    Get or create the global Redis client instance.
    
    Args:
        config: Configuration dictionary with Redis settings
        
    Returns:
        RedisClient instance
    """
    global _redis_client
    
    if _redis_client is None:
        redis_url = "redis://localhost:6379"
        default_ttl = 300
        
        if config:
            redis_url = config.get("redis_url", redis_url)
            default_ttl = config.get("cache_ttl", default_ttl)
        
        _redis_client = RedisClient(redis_url, default_ttl)
    
    return _redis_client


def cache_key_builder(*args, **kwargs) -> str:
    """
    Build a cache key from arguments.
    
    Args:
        *args: Positional arguments to include in key
        **kwargs: Keyword arguments to include in key
        
    Returns:
        Cache key string
    """
    key_parts = []
    
    # Add positional arguments
    for arg in args:
        if isinstance(arg, (str, int, float)):
            key_parts.append(str(arg))
        else:
            key_parts.append(str(hash(str(arg))))
    
    # Add keyword arguments
    for k, v in sorted(kwargs.items()):
        if isinstance(v, (str, int, float)):
            key_parts.append(f"{k}:{v}")
        else:
            key_parts.append(f"{k}:{hash(str(v))}")
    
    return ":".join(key_parts)


def cached_function(ttl: int = 300, key_prefix: str = "", fallback_on_error: bool = True):
    """
    Decorator for caching function results with graceful error handling.
    
    Args:
        ttl: Time-to-live for cached results in seconds
        key_prefix: Prefix for cache keys
        fallback_on_error: If True, function executes normally when Redis is unavailable
        
    Returns:
        Decorator function
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Build cache key
            cache_key = f"{key_prefix}:{func.__name__}:{cache_key_builder(*args, **kwargs)}"
            
            try:
                # Try to get from cache
                redis_client = get_redis_client()
                cached_result = redis_client.get(cache_key)
                
                if cached_result is not None:
                    logger.debug(f"Cache hit for key: {cache_key}")
                    return cached_result
            except Exception as e:
                if fallback_on_error:
                    logger.warning(f"Cache read failed for {cache_key}, executing function: {e}")
                else:
                    logger.error(f"Cache read failed for {cache_key}: {e}")
                    raise
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Try to cache result
            try:
                redis_client = get_redis_client()
                redis_client.set(cache_key, result, ttl)
                logger.debug(f"Cached result for key: {cache_key}")
            except Exception as e:
                if fallback_on_error:
                    logger.warning(f"Cache write failed for {cache_key}, returning result: {e}")
                else:
                    logger.error(f"Cache write failed for {cache_key}: {e}")
                    # Don't raise here - we have the result
            
            return result
        
        # Add cache control methods with error handling
        def clear_cache(*args, **kwargs):
            try:
                return get_redis_client().delete(
                    f"{key_prefix}:{func.__name__}:{cache_key_builder(*args, **kwargs)}"
                )
            except Exception as e:
                logger.warning(f"Cache clear failed: {e}")
                return False
        
        def cache_exists(*args, **kwargs):
            try:
                return get_redis_client().exists(
                    f"{key_prefix}:{func.__name__}:{cache_key_builder(*args, **kwargs)}"
                )
            except Exception as e:
                logger.warning(f"Cache exists check failed: {e}")
                return False
        
        wrapper.clear_cache = clear_cache
        wrapper.cache_exists = cache_exists
        
        return wrapper
    return decorator
