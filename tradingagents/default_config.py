import os

DEFAULT_CONFIG = {
    "project_dir": os.path.abspath(os.path.join(os.path.dirname(__file__), ".")),
    "results_dir": os.getenv("TRADINGAGENTS_RESULTS_DIR", "./results"),
    "data_dir": os.getenv("TRADINGAGENTS_DATA_DIR", "./data"),
    "data_cache_dir": os.path.join(
        os.path.abspath(os.path.join(os.path.dirname(__file__), ".")),
        "dataflows/data_cache",
    ),
    
    # Trading mode configuration
    "trading_mode": "crypto",  # "stocks" or "crypto"
    "base_currency": "USDT",  # Base currency for crypto trading
    
    # LLM settings - Support for multiple providers
    "llm_provider": os.getenv("LLM_PROVIDER", "openrouter"),  # "openrouter", "lmstudio", or "openai"
    "deep_think_llm": os.getenv("DEEP_THINK_LLM", "anthropic/claude-3.5-sonnet"),
    "quick_think_llm": os.getenv("QUICK_THINK_LLM", "openai/gpt-4o-mini"),
    "backend_url": "https://openrouter.ai/api/v1",
    
    # LM Studio settings for local models
    "lmstudio_base_url": os.getenv("LMSTUDIO_BASE_URL", "http://192.168.0.33:1234/v1"),
    "lmstudio_api_key": os.getenv("LMSTUDIO_API_KEY", "lm-studio"),
    "lmstudio_model_name": os.getenv("LMSTUDIO_MODEL_NAME", None),  # Auto-detect if None
    "lmstudio_timeout": int(os.getenv("LMSTUDIO_TIMEOUT", "300")),
    
    # MCP Server settings
    "use_mcp_servers": True,
    "mcp_crypto_server_url": os.getenv("MCP_CRYPTO_SERVER_URL", "http://localhost:9000"),
    "mcp_news_server_url": os.getenv("MCP_NEWS_SERVER_URL", "http://localhost:9001"),
    
    # Redis settings for caching
    "redis_url": os.getenv("REDIS_URL", "redis://localhost:6379"),
    "cache_enabled": True,
    "cache_ttl": 300,  # 5 minutes
    
    # Debate and discussion settings
    "max_debate_rounds": 1,
    "max_risk_discuss_rounds": 1,
    "max_recur_limit": 100,
    
    # Tool settings
    "online_tools": True,
    
    # Crypto-specific settings
    "supported_cryptos": [
        "BTC", "ETH", "BNB", "XRP", "ADA", "DOGE", "MATIC", "SOL", "DOT", "AVAX",
        "SHIB", "LTC", "ATOM", "LINK", "XLM", "UNI", "AAVE", "COMP", "MKR", "SNX"
    ],
    
    # Risk management for crypto
    "crypto_risk_settings": {
        "max_position_size": 0.1,  # Maximum 10% of portfolio per position
        "stop_loss_percentage": 0.05,  # 5% stop loss
        "take_profit_percentage": 0.15,  # 15% take profit
        "max_daily_trades": 5,
        "min_volume_threshold": 1000000,  # Minimum daily volume in USD
    },
}
