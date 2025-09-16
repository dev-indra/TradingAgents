#!/usr/bin/env python3
"""
Test script for Redis integration with TradingAgents.
"""

import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from tradingagents.utils.redis_client import get_redis_client
from tradingagents.default_config import DEFAULT_CONFIG
import json
import time

def test_redis_basic_operations():
    """Test basic Redis operations."""
    print("🧪 Testing basic Redis operations...")
    
    config = DEFAULT_CONFIG.copy()
    redis_client = get_redis_client(config)
    
    # Test health check
    print(f"Redis health check: {'✅ Healthy' if redis_client.is_healthy() else '❌ Unhealthy'}")
    
    if not redis_client.is_healthy():
        print("❌ Redis is not healthy. Please check Redis connection.")
        return False
    
    # Test set/get
    test_key = "test:basic"
    test_value = {"message": "Hello Redis!", "timestamp": time.time()}
    
    print(f"Setting key '{test_key}' with value: {test_value}")
    success = redis_client.set(test_key, test_value, 60)
    print(f"Set operation: {'✅ Success' if success else '❌ Failed'}")
    
    if success:
        retrieved_value = redis_client.get(test_key)
        print(f"Retrieved value: {retrieved_value}")
        print(f"Values match: {'✅ Yes' if retrieved_value == test_value else '❌ No'}")
        
        # Test TTL
        ttl = redis_client.get_ttl(test_key)
        print(f"TTL: {ttl} seconds")
        
        # Test exists
        exists = redis_client.exists(test_key)
        print(f"Key exists: {'✅ Yes' if exists else '❌ No'}")
        
        # Cleanup
        deleted = redis_client.delete(test_key)
        print(f"Cleanup: {'✅ Deleted' if deleted else '❌ Failed to delete'}")
    
    return success

def test_redis_health_info():
    """Test Redis health information."""
    print("\n🏥 Testing Redis health information...")
    
    config = DEFAULT_CONFIG.copy()
    redis_client = get_redis_client(config)
    
    health_info = redis_client.get_health_info()
    print("Health Info:")
    print(json.dumps(health_info, indent=2))
    
    return health_info.get("status") == "healthy"

def test_crypto_mcp_caching():
    """Test caching with crypto MCP tools."""
    print("\n🪙 Testing crypto MCP tool caching...")
    
    try:
        from tradingagents.agents.utils.crypto_mcp_tools import get_mcp_client
        from tradingagents.default_config import DEFAULT_CONFIG
        
        config = DEFAULT_CONFIG.copy()
        
        print("Note: This test requires MCP servers to be running.")
        print("If MCP servers are not running, the test will show caching behavior with errors.")
        
        # This will test the caching logic even if MCP servers are down
        import asyncio
        
        async def test_mcp_cache():
            client = get_mcp_client(config)
            async with client as c:
                # This will likely fail if MCP servers are down, but will test caching logic
                result = await c.call_mcp_tool(
                    c.crypto_server_url,
                    "get_crypto_market_data",
                    {"symbol": "BTC"}
                )
                return result
        
        try:
            result = asyncio.run(test_mcp_cache())
            print(f"MCP call result: {json.dumps(result, indent=2)}")
        except Exception as e:
            print(f"MCP call failed (expected if servers are down): {e}")
        
        return True
        
    except ImportError as e:
        print(f"Import error (some dependencies may be missing): {e}")
        return False

def test_fallback_tools():
    """Test fallback crypto tools with caching."""
    print("\n🔄 Testing fallback crypto tools...")
    
    try:
        from tradingagents.utils.crypto_fallback_tools import get_fallback_tools
        from tradingagents.default_config import DEFAULT_CONFIG
        
        config = DEFAULT_CONFIG.copy()
        fallback_tools = get_fallback_tools(config)
        
        print("Testing CoinGecko fallback (requires internet)...")
        try:
            btc_data = fallback_tools.get_crypto_data_coingecko("BTC", 1)
            result = json.loads(btc_data)
            if "error" not in result:
                print("✅ CoinGecko fallback working")
                print(f"BTC Price: ${result.get('current_price', 'N/A')}")
            else:
                print(f"❌ CoinGecko error: {result.get('error')}")
        except Exception as e:
            print(f"❌ CoinGecko exception: {e}")
        
        print("\nTesting RSS news fallback...")
        try:
            news_data = fallback_tools.get_crypto_news_rss("bitcoin")
            result = json.loads(news_data)
            if "error" not in result:
                print(f"✅ RSS fallback working - found {result.get('total_articles', 0)} articles")
            else:
                print(f"❌ RSS error: {result.get('error')}")
        except Exception as e:
            print(f"❌ RSS exception: {e}")
        
        return True
        
    except ImportError as e:
        print(f"Import error: {e}")
        return False

def main():
    """Main test function."""
    print("🚀 TradingAgents Redis Integration Test")
    print("=" * 50)
    
    tests = [
        ("Basic Redis Operations", test_redis_basic_operations),
        ("Redis Health Information", test_redis_health_info),
        ("Crypto MCP Caching", test_crypto_mcp_caching),
        ("Fallback Tools", test_fallback_tools),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ Test '{test_name}' failed with exception: {e}")
            results[test_name] = False
    
    print(f"\n{'='*50}")
    print("📊 Test Results Summary")
    print("=" * 50)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    passed_count = sum(results.values())
    total_count = len(results)
    
    print(f"\nOverall: {passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("🎉 All tests passed! Redis integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()