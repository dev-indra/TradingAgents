#!/usr/bin/env python3
"""
Simple test script for LM Studio integration.

This script tests our LM Studio provider and LLM factory without
requiring all TradingAgents dependencies.
"""

import os
import sys

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tradingagents.providers.lmstudio_provider import LMStudioProvider, create_lmstudio_provider
from tradingagents.llm_factory import LLMFactory, get_available_providers
from tradingagents.default_config import DEFAULT_CONFIG


def test_provider_creation():
    """Test creating LM Studio provider."""
    print("🧪 Testing LM Studio provider creation...")
    
    try:
        provider = create_lmstudio_provider()
        print("✅ LM Studio provider created successfully")
        print(f"   Base URL: {provider.base_url}")
        print(f"   Model: {provider.model_name}")
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
            print("💡 Make sure LM Studio is running with a loaded model")
            return False
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False


def test_llm_factory():
    """Test LLM factory with LM Studio provider."""
    print("🏭 Testing LLM factory...")
    
    try:
        config = DEFAULT_CONFIG.copy()
        config["llm_provider"] = "lmstudio"
        
        # Validate config
        validated_config = LLMFactory.validate_config(config)
        print("✅ Configuration validated")
        
        # Test connection
        if LLMFactory.test_provider_connection(validated_config):
            print("✅ Factory connection test passed")
        else:
            print("⚠️  Factory connection test failed - LM Studio may not be running")
        
        return True
    except Exception as e:
        print(f"❌ LLM factory test failed: {e}")
        return False


def test_available_providers():
    """Test getting available providers."""
    print("📋 Testing available providers...")
    
    try:
        providers = get_available_providers()
        print("✅ Available providers:")
        for provider, description in providers.items():
            print(f"   • {provider}: {description}")
        return True
    except Exception as e:
        print(f"❌ Failed to get providers: {e}")
        return False


def main():
    """Run all tests."""
    print("🏠 LM Studio Integration Test Suite")
    print("=" * 50)
    print("This script tests the LM Studio integration components.")
    print("=" * 50)
    
    # Test 1: Provider creation
    test1 = test_provider_creation()
    print()
    
    # Test 2: Available providers
    test2 = test_available_providers()
    print()
    
    # Test 3: LLM Factory
    test3 = test_llm_factory()
    print()
    
    # Test 4: Connection test (may fail if LM Studio not running)
    test4 = test_connection()
    print()
    
    # Summary
    passed_tests = sum([test1, test2, test3])
    total_tests = 3  # Connection test is optional
    
    print("=" * 50)
    print(f"🎯 Test Results: {passed_tests}/{total_tests} core tests passed")
    
    if test4:
        print("✅ Connection test: PASSED (LM Studio is ready!)")
    else:
        print("⚠️  Connection test: FAILED (LM Studio not running)")
        print("   This is normal if you haven't set up LM Studio yet.")
    
    print("=" * 50)
    
    if passed_tests == total_tests:
        print("🎉 All core tests passed! Integration is working.")
        if test4:
            print("🚀 LM Studio is ready for trading analysis!")
        else:
            print("📚 Next: Follow LMSTUDIO_SETUP.md to set up LM Studio")
    else:
        print("❌ Some tests failed. Check the output above for details.")
    
    print("\n💡 To run full trading analysis:")
    print("   python example_lmstudio.py")


if __name__ == "__main__":
    main()