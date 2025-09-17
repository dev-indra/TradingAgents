# 🏠 LM Studio Integration Guide

## Overview

This guide will help you set up **LM Studio** for local model integration with TradingAgents, enabling you to run AI models locally for **ZERO API costs** while maintaining full functionality of your crypto trading agents.

## 🎯 Why Use LM Studio?

- **💰 Zero API Costs**: Run models locally without paying per-token fees
- **🔒 Privacy**: Your trading data never leaves your machine
- **⚡ Speed**: No network latency for model responses  
- **🎮 Full Control**: Choose any compatible model and adjust parameters
- **📶 Offline Capability**: Works without internet connection

## 🚀 Quick Setup

### Step 1: Install LM Studio

1. Download LM Studio from: https://lmstudio.ai/
2. Install and launch LM Studio
3. The application will start a local server on `http://localhost:1234`

### Step 2: Download a Model

**Recommended models for trading analysis:**

#### 🧠 For Best Reasoning (if you have powerful hardware):
- **Llama 3.1 70B Instruct** (requires ~40GB VRAM)
- **Qwen 2.5 32B Instruct** (requires ~20GB VRAM)

#### ⚡ For Speed & Efficiency (recommended for most users):
- **Llama 3.1 8B Instruct** (requires ~5GB VRAM)
- **Qwen 2.5 14B Instruct** (requires ~8GB VRAM)  
- **Phi 3.5 Mini Instruct** (requires ~2GB VRAM)

#### 🏃‍♂️ For Low-End Hardware:
- **Phi 3.5 Mini Instruct** (2GB VRAM)
- **Llama 3.2 3B Instruct** (2GB VRAM)

**To download a model:**
1. Go to the "Discover" tab in LM Studio
2. Search for your chosen model (e.g., "llama-3.1-8b-instruct")
3. Click "Download" and wait for completion

### Step 3: Start the Model Server

1. Go to the "Chat" tab in LM Studio
2. Select your downloaded model from the dropdown
3. Click "Start Server" 
4. Note the server URL (usually `http://localhost:1234`)
5. Keep LM Studio running while using TradingAgents

### Step 4: Configure TradingAgents

Set environment variables or update your configuration:

```bash
# Using environment variables (recommended)
$env:LLM_PROVIDER = "lmstudio"
$env:LMSTUDIO_BASE_URL = "http://localhost:1234/v1"  # Optional, this is default
$env:LMSTUDIO_MODEL_NAME = "auto-detect"  # Optional, will auto-detect loaded model
```

Or modify your code directly:

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

# Configure for LM Studio
config = DEFAULT_CONFIG.copy()
config["llm_provider"] = "lmstudio"
config["deep_think_llm"] = "local-model"  # Will use whatever model is loaded
config["quick_think_llm"] = "local-model"

# Initialize with local models
ta = TradingAgentsGraph(debug=True, config=config)
```

## 🔧 Advanced Configuration

### Custom Server Settings

```python
config = {
    "llm_provider": "lmstudio",
    "lmstudio_base_url": "http://localhost:1234/v1",
    "lmstudio_api_key": "lm-studio",  # Default LM Studio API key
    "lmstudio_model_name": None,  # Auto-detect loaded model
    "lmstudio_timeout": 300,  # Request timeout in seconds
}
```

### Model-Specific Optimizations

```python
# For reasoning-heavy tasks (analysis)
config["deep_think_llm"] = "local-model"  # Uses loaded model
config["quick_think_llm"] = "local-model"  # Same model for consistency

# Temperature settings for different model types
if "phi" in model_name.lower():
    config["temperature"] = 0.5  # Phi models work better with lower temperature
elif "qwen" in model_name.lower():
    config["temperature"] = 0.7  # Qwen models are well-calibrated
elif "llama" in model_name.lower():
    config["temperature"] = 0.8  # Llama models benefit from slightly higher temp
```

### Hardware-Specific Settings

```python
# For GPU with limited VRAM
config["max_tokens"] = 2048  # Limit response length

# For CPU inference
config["lmstudio_timeout"] = 600  # Increase timeout for slower CPU inference
```

## 📊 Usage Examples

### Basic Usage

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from datetime import datetime

# Setup for local models
config = DEFAULT_CONFIG.copy()
config["llm_provider"] = "lmstudio"

print("🏠 Using LM Studio for local AI models")
ta = TradingAgentsGraph(debug=True, config=config)

# Analyze crypto with zero API costs
current_date = datetime.now().strftime("%Y-%m-%d")
state, decision = ta.propagate("BTC", current_date)
print(f"💰 Analysis complete - Cost: $0.00 (local model)")
print(f"🎯 Decision: {decision}")
```

### Multiple Crypto Analysis

```python
cryptos = ["BTC", "ETH", "SOL", "AVAX", "MATIC"]
results = {}

print("📊 Analyzing multiple cryptocurrencies with local models...")
for crypto in cryptos:
    try:
        state, decision = ta.propagate(crypto, current_date)
        results[crypto] = decision
        print(f"✅ {crypto}: {decision} (Cost: $0.00)")
    except Exception as e:
        print(f"❌ {crypto}: Error - {e}")

print("\n🎯 Summary of Local Analysis:")
for crypto, decision in results.items():
    print(f"  {crypto}: {decision}")
print(f"\n💰 Total Cost: $0.00 (saved ~$5-20 compared to API usage)")
```

### Connection Testing

```python
from tradingagents.providers.lmstudio_provider import create_lmstudio_provider

# Test LM Studio connection
provider = create_lmstudio_provider()

if provider.test_connection():
    print("✅ LM Studio connection successful!")
    model_info = provider.get_model_info()
    print(f"📋 Loaded model: {model_info}")
else:
    print("❌ Cannot connect to LM Studio. Please ensure:")
    print("  1. LM Studio is running")
    print("  2. A model is loaded and server is started")
    print("  3. Server is accessible at http://localhost:1234")
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Cannot connect to LM Studio server"

**Solutions:**
- Ensure LM Studio is running and a model is loaded
- Check that the server is started (look for "Server is running" in LM Studio)
- Verify the URL is correct: `http://localhost:1234`
- Try restarting LM Studio

#### 2. "Model responses are slow"

**Solutions:**
- Use a smaller model (e.g., Phi 3.5 Mini instead of Llama 70B)
- Enable GPU acceleration in LM Studio settings
- Increase the timeout value: `config["lmstudio_timeout"] = 600`
- Close other applications to free up system resources

#### 3. "Out of memory errors"

**Solutions:**
- Switch to a smaller model
- Reduce context length: `config["max_tokens"] = 1024`
- Enable CPU offloading in LM Studio settings
- Close other applications

#### 4. "Empty or nonsensical responses"

**Solutions:**
- Try a different model (some models work better for trading analysis)
- Adjust temperature: `config["temperature"] = 0.7`
- Check model is fully loaded (not just downloading)

### Performance Optimization

```python
# Optimized configuration for different hardware
def get_optimized_config(gpu_vram_gb: int):
    config = DEFAULT_CONFIG.copy()
    config["llm_provider"] = "lmstudio"
    
    if gpu_vram_gb >= 24:  # High-end GPU
        config["recommended_model"] = "llama-3.1-70b-instruct"
        config["max_tokens"] = 4096
    elif gpu_vram_gb >= 12:  # Mid-range GPU  
        config["recommended_model"] = "qwen2.5-14b-instruct"
        config["max_tokens"] = 2048
    elif gpu_vram_gb >= 6:   # Entry-level GPU
        config["recommended_model"] = "llama-3.1-8b-instruct"
        config["max_tokens"] = 1024
    else:  # CPU or low VRAM
        config["recommended_model"] = "phi-3.5-mini-instruct"
        config["max_tokens"] = 512
        config["lmstudio_timeout"] = 600
    
    return config

# Auto-optimize based on your hardware
config = get_optimized_config(gpu_vram_gb=8)  # Adjust for your GPU
ta = TradingAgentsGraph(config=config)
```

## 🎯 Model Recommendations by Use Case

### 📈 Trading Analysis (Recommended)

**Best Balance of Speed & Quality:**
- **Qwen 2.5 14B Instruct** - Excellent reasoning, good speed
- **Llama 3.1 8B Instruct** - Well-tested, reliable responses

### 🏃‍♂️ Fast Analysis (Speed Priority)

**For quick market updates:**
- **Phi 3.5 Mini Instruct** - Very fast, decent quality
- **Llama 3.2 3B Instruct** - Lightweight, good for simple analysis

### 🧠 Deep Analysis (Quality Priority)

**For comprehensive research:**
- **Llama 3.1 70B Instruct** - Top reasoning (if you have hardware)
- **Qwen 2.5 32B Instruct** - Excellent analysis capabilities

## 🔄 Switching Between Providers

You can easily switch between local and cloud models:

```python
# For development/testing - use free local models
config["llm_provider"] = "lmstudio"

# For production/complex analysis - use cloud models  
config["llm_provider"] = "openrouter"  
config["deep_think_llm"] = "anthropic/claude-3.5-sonnet"
```

## 📊 Cost Comparison

| Provider | Cost per Analysis* | Monthly Cost** | Notes |
|----------|-------------------|----------------|-------|
| **LM Studio** | **$0.00** | **$0.00** | Local models, one-time hardware cost |
| OpenRouter | $0.10-0.50 | $15-75 | Pay per token |
| OpenAI Direct | $0.15-0.60 | $20-90 | Premium pricing |

*Estimated cost for analyzing one cryptocurrency
**Based on 150 analyses per month

## 🎉 Benefits Summary

✅ **Zero ongoing costs** - No per-token charges  
✅ **Complete privacy** - Data never leaves your machine  
✅ **No rate limits** - Analyze as much as you want  
✅ **Offline capability** - Works without internet  
✅ **Model flexibility** - Choose from hundreds of models  
✅ **Easy integration** - Drop-in replacement for cloud APIs

## 🤝 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Visit LM Studio documentation: https://lmstudio.ai/docs
3. Create an issue in this repository
4. Check that your hardware meets the model requirements

---

**Ready to save money while maintaining full functionality?** Follow this guide to set up LM Studio and enjoy cost-free crypto trading analysis! 🚀