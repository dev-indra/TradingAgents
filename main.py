from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from datetime import datetime
import os

def main():
    """Main function to run crypto trading analysis"""
    
    # Default config is now set up for crypto and OpenRouter
    config = DEFAULT_CONFIG.copy()
    
    # Override for demo purposes - use cost-effective models
    config["deep_think_llm"] = "openai/gpt-4o-mini"  # More cost effective for demo
    config["quick_think_llm"] = "openai/gpt-4o-mini" 
    config["max_debate_rounds"] = 1
    config["trading_mode"] = "crypto"
    config["use_mcp_servers"] = True
    config["online_tools"] = True
    
    print("🚀 TradingAgents Crypto Analysis Framework")
    print("===========================================")
    print(f"Trading Mode: {config['trading_mode'].upper()}")
    print(f"LLM Provider: {config['llm_provider']}")
    print(f"Deep Think Model: {config['deep_think_llm']}")
    print(f"MCP Servers: {'Enabled' if config['use_mcp_servers'] else 'Disabled'}")
    print()
    
    # Initialize trading graph
    ta = TradingAgentsGraph(debug=True, config=config)
    
    # Analyze popular cryptocurrencies
    current_date = datetime.now().strftime("%Y-%m-%d")
    crypto_symbols = ["BTC", "ETH", "SOL", "AVAX"]
    
    print(f"📊 Analyzing cryptocurrencies for {current_date}...")
    print()
    
    results = {}
    for symbol in crypto_symbols:
        try:
            print(f"🔍 Analyzing {symbol}...")
            state, decision = ta.propagate(symbol, current_date)
            results[symbol] = decision
            print(f"✅ {symbol}: {decision}")
            print("-" * 50)
        except Exception as e:
            print(f"❌ Error analyzing {symbol}: {e}")
            results[symbol] = f"Error: {e}"
        print()
    
    # Print summary
    print("📋 TRADING ANALYSIS SUMMARY")
    print("===========================")
    for symbol, decision in results.items():
        status = "✅" if "Error" not in str(decision) else "❌"
        print(f"{status} {symbol}: {decision}")
    
    print()
    print("💡 Note: This is for research purposes only. Not financial advice.")
    
    # Optional: Reflect on performance (uncomment to use)
    # ta.reflect_and_remember(1000)  # parameter is the position returns

if __name__ == "__main__":
    main()
