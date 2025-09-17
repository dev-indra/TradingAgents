#!/usr/bin/env python3
"""
LM Studio Integration Example for TradingAgents

This script demonstrates how to use LM Studio for local model integration
with TradingAgents, enabling cost-free crypto analysis.

Prerequisites:
1. LM Studio installed and running
2. A model loaded in LM Studio (recommended: Llama 3.1 8B Instruct)
3. LM Studio server started (http://192.168.0.33:1234)

Usage:
    python example_lmstudio.py
"""

import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from tradingagents.providers.lmstudio_provider import create_lmstudio_provider


def test_lmstudio_connection():
    """Test connection to LM Studio server."""
    print("🔌 Testing LM Studio connection...")
    
    try:
        provider = create_lmstudio_provider()
        
        if provider.test_connection():
            print("✅ LM Studio connection successful!")
            
            # Get model info
            model_info = provider.get_model_info()
            print(f"📋 Model info: {model_info}")
            
            return True
        else:
            print("❌ Cannot connect to LM Studio server")
            return False
            
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False


def print_setup_instructions():
    """Print setup instructions if connection fails."""
    print("\n" + "="*60)
    print("🛠️  LM STUDIO SETUP REQUIRED")
    print("="*60)
    print("Please ensure the following steps are completed:")
    print()
    print("1. 📥 Install LM Studio from https://lmstudio.ai/")
    print("2. 🤖 Download a model (recommended: llama-3.1-8b-instruct)")
    print("3. 💬 Go to Chat tab and select your model")  
    print("4. 🚀 Click 'Start Server' button")
    print("5. 🌐 Verify server is running at http://192.168.0.33:1234")
    print()
    print("💡 Tip: Keep LM Studio running while using this script!")
    print("📚 Full setup guide: See LMSTUDIO_SETUP.md")
    print("="*60)


def run_crypto_analysis_example():
    """Run a cryptocurrency analysis using local models."""
    print("\n🚀 Starting Crypto Analysis with Local Models")
    print("=" * 50)
    
    # Configure for LM Studio
    config = DEFAULT_CONFIG.copy()
    config["llm_provider"] = "lmstudio"
    config["deep_think_llm"] = "local-model"
    config["quick_think_llm"] = "local-model"
    
    # Reduce debate rounds for faster demo
    config["max_debate_rounds"] = 1
    config["max_risk_discuss_rounds"] = 1
    
    print(f"💰 Cost: $0.00 (local models)")
    print(f"🏠 Provider: {config['llm_provider']}")
    print(f"🧠 Model: Auto-detected from LM Studio")
    print()
    
    try:
        # Initialize TradingAgents
        print("🔧 Initializing TradingAgents...")
        ta = TradingAgentsGraph(debug=True, config=config)
        
        # Run analysis on Bitcoin
        print("\n📊 Analyzing Bitcoin (BTC)...")
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        state, decision = ta.propagate("BTC", current_date)
        
        print("\n" + "="*50)
        print("🎯 ANALYSIS COMPLETE")
        print("="*50)
        print(f"💰 Cryptocurrency: Bitcoin (BTC)")
        print(f"📅 Date: {current_date}")
        print(f"🤖 Decision: {decision}")
        print(f"💸 Cost: $0.00 (saved ~$0.50 vs cloud APIs)")
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        print()
        print("💡 Common solutions:")
        print("  - Ensure LM Studio server is running")
        print("  - Try restarting LM Studio")
        print("  - Check if model is fully loaded")
        return False


def run_multi_crypto_example():
    """Run analysis on multiple cryptocurrencies."""
    print("\n🌟 Multi-Crypto Analysis Example")
    print("=" * 40)
    
    config = DEFAULT_CONFIG.copy()
    config["llm_provider"] = "lmstudio"
    config["max_debate_rounds"] = 1  # Faster demo
    
    try:
        ta = TradingAgentsGraph(debug=False, config=config)
        
        cryptos = ["BTC", "ETH", "SOL"]
        current_date = datetime.now().strftime("%Y-%m-%d")
        results = {}
        
        print(f"📊 Analyzing {len(cryptos)} cryptocurrencies...")
        print()
        
        for i, crypto in enumerate(cryptos, 1):
            print(f"[{i}/{len(cryptos)}] Analyzing {crypto}...")
            try:
                state, decision = ta.propagate(crypto, current_date)
                results[crypto] = decision
                print(f"  ✅ {crypto}: {decision}")
            except Exception as e:
                results[crypto] = f"Error: {str(e)}"
                print(f"  ❌ {crypto}: Failed - {e}")
        
        print("\n🎯 MULTI-CRYPTO SUMMARY")
        print("-" * 30)
        for crypto, decision in results.items():
            status = "✅" if "Error" not in str(decision) else "❌"
            print(f"{status} {crypto}: {decision}")
        
        successful = len([r for r in results.values() if "Error" not in str(r)])
        print(f"\n💰 Analyses completed: {successful}/{len(cryptos)}")
        print(f"💸 Total cost: $0.00 (saved ~${len(cryptos) * 0.5:.2f})")
        
        return successful > 0
        
    except Exception as e:
        print(f"❌ Multi-crypto analysis failed: {e}")
        return False


def main():
    """Main function to run LM Studio integration examples."""
    print("🏠 TradingAgents - LM Studio Integration Example")
    print("=" * 60)
    print("This script demonstrates cost-free crypto analysis using local models.")
    print("=" * 60)
    
    # Test connection first
    if not test_lmstudio_connection():
        print_setup_instructions()
        sys.exit(1)
    
    print("\n🎉 LM Studio is ready! Let's run some examples...")
    
    # Example 1: Single crypto analysis
    success1 = run_crypto_analysis_example()
    
    if success1:
        # Example 2: Multi-crypto analysis
        run_multi_crypto_example()
        
        print("\n" + "🎊" * 20)
        print("SUCCESS! You've successfully integrated LM Studio!")
        print("🎊" * 20)
        print()
        print("💡 What's next?")
        print("  • Try different models in LM Studio")
        print("  • Analyze your favorite cryptocurrencies")  
        print("  • Explore advanced configuration options")
        print("  • Read LMSTUDIO_SETUP.md for more examples")
        print()
        print("💰 You're now saving money with local AI models!")
    else:
        print("\n❌ Example failed. Please check the troubleshooting guide.")
        

if __name__ == "__main__":
    main()