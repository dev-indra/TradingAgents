#!/usr/bin/env python3
"""
Minimal test for LM Studio provider functionality.

This tests only the core LM Studio provider without requiring
all the TradingAgents dependencies.
"""

import os
import sys

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tradingagents.providers.lmstudio_provider import LMStudioProvider, create_lmstudio_provider


def test_provider_creation():
    """Test creating LM Studio provider."""
    print("🧪 Testing LM Studio provider creation...")
    
    try:
        provider = create_lmstudio_provider()
        print("✅ LM Studio provider created successfully")
        print(f"   Base URL: {provider.base_url}")
        print(f"   Model: {provider.model_name}")
        print(f"   API Key: {provider.api_key}")
        return True
    except Exception as e:
        print(f"❌ Failed to create provider: {e}")
        return False


def test_connection():
    """Test connection to LM Studio server."""
    print("🔌 Testing LM Studio connection...")
    
    try:
        provider = create_lmstudio_provider()
        
        if provider.test_connection():
            print("✅ Connection successful!")
            
            # Get model info
            model_info = provider.get_model_info()
            print(f"📋 Model info: {model_info}")
            
            return True
        else:
            print("❌ Cannot connect to LM Studio server")
            print("💡 This is normal if LM Studio is not running")
            return False
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        print("💡 This is normal if LM Studio is not running")
        return False


def test_chat_model_creation():
    """Test creating a chat model (without connection)."""
    print("🤖 Testing chat model creation...")
    
    try:
        provider = create_lmstudio_provider()
        
        # This should work even without LM Studio running
        chat_model = provider.get_chat_model()
        print("✅ Chat model created successfully")
        print(f"   Model type: {type(chat_model)}")
        return True
    except Exception as e:
        print(f"❌ Failed to create chat model: {e}")
        return False


def test_cost_estimation():
    """Test cost estimation (should always be 0 for local models)."""
    print("💰 Testing cost estimation...")
    
    try:
        provider = create_lmstudio_provider()
        
        cost = provider.estimate_cost(1000, 500)  # 1000 prompt tokens, 500 completion tokens
        print(f"✅ Cost estimation working: ${cost:.2f}")
        
        if cost == 0.0:
            print("✅ Correctly returns $0.00 for local models")
            return True
        else:
            print("⚠️  Expected $0.00 for local models")
            return False
            
    except Exception as e:
        print(f"❌ Cost estimation failed: {e}")
        return False


def test_from_config():
    """Test creating provider from configuration."""
    print("⚙️ Testing configuration-based creation...")
    
    try:
        config = {
            "lmstudio_base_url": "http://192.168.0.33:1234/v1",
            "lmstudio_api_key": "lm-studio",
            "lmstudio_model_name": "test-model",
            "temperature": 0.7,
            "max_tokens": 2048,
            "timeout": 300
        }
        
        provider = LMStudioProvider.from_config(config)
        print("✅ Provider created from config successfully")
        print(f"   Base URL: {provider.base_url}")
        print(f"   Model: {provider.model_name}")
        return True
    except Exception as e:
        print(f"❌ Failed to create from config: {e}")
        return False


def main():
    """Run all tests."""
    print("🏠 LM Studio Minimal Integration Test")
    print("=" * 50)
    print("Testing core LM Studio provider functionality...")
    print("=" * 50)
    
    # Run tests
    tests = [
        ("Provider Creation", test_provider_creation),
        ("Chat Model Creation", test_chat_model_creation),
        ("Cost Estimation", test_cost_estimation),
        ("Config-based Creation", test_from_config),
        ("Connection Test", test_connection),  # This may fail and that's OK
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}:")
        print("-" * 30)
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    print("\n" + "=" * 50)
    print("🎯 TEST RESULTS")
    print("=" * 50)
    
    passed = 0
    core_tests = 4  # First 4 tests are core functionality
    
    for i, (test_name, result) in enumerate(results):
        status = "✅ PASS" if result else "❌ FAIL"
        note = ""
        
        if test_name == "Connection Test" and not result:
            note = " (expected if LM Studio not running)"
            
        print(f"{status} {test_name}{note}")
        
        if i < core_tests and result:
            passed += 1
    
    print("-" * 50)
    print(f"Core functionality: {passed}/{core_tests} tests passed")
    
    connection_works = results[-1][1]  # Last test is connection
    if connection_works:
        print("🚀 LM Studio is running and ready!")
    else:
        print("📚 LM Studio not detected (install from https://lmstudio.ai/)")
    
    if passed == core_tests:
        print("\n🎉 SUCCESS! LM Studio integration is properly installed.")
        print("\n💡 Next steps:")
        if connection_works:
            print("   • Run: python example_lmstudio.py")
            print("   • Try full trading analysis with local models")
        else:
            print("   • Install LM Studio from https://lmstudio.ai/")
            print("   • Download a model and start the server")
            print("   • Read LMSTUDIO_SETUP.md for detailed instructions")
    else:
        print("\n❌ Some core tests failed. Check installation.")
    

if __name__ == "__main__":
    main()