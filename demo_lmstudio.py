#!/usr/bin/env python3
"""
Demo script showing LM Studio integration with TradingAgents LLM Factory
"""

from tradingagents.llm_factory import LLMFactory, get_available_providers
from tradingagents.default_config import DEFAULT_CONFIG

print('🏭 Testing LLM Factory with LM Studio')
print('=' * 50)

# Test available providers
print('📋 Available LLM Providers:')
providers = get_available_providers()
for name, desc in providers.items():
    emoji = '🏠' if name == 'lmstudio' else '☁️'
    print(f'  {emoji} {name}: {desc}')

print()

# Configure for LM Studio
config = DEFAULT_CONFIG.copy()
config['llm_provider'] = 'lmstudio'

print(f'🔧 Testing provider: {config["llm_provider"]}')

# Test connection
if LLMFactory.test_provider_connection(config):
    print('✅ LM Studio connection successful!')
    
    # Create LLMs
    try:
        print('🧠 Creating deep thinking LLM...')
        deep_llm = LLMFactory.create_llm(config, 'deep_think')
        print(f'✅ Deep LLM created: {type(deep_llm)}')
        
        print('⚡ Creating quick thinking LLM...')  
        quick_llm = LLMFactory.create_llm(config, 'quick_think')
        print(f'✅ Quick LLM created: {type(quick_llm)}')
        
        print()
        print('🎯 SUCCESS! LLM Factory working with local models')
        print('💰 Cost for using these models: $0.00')
        
        # Test a simple crypto analysis prompt
        print()
        print('🔬 Testing crypto analysis with local model...')
        from langchain_core.messages import HumanMessage
        
        prompt = HumanMessage(content="""
        You are a cryptocurrency analyst. Provide a brief analysis of Bitcoin's current market position.
        Consider these factors: market dominance, institutional adoption, and recent price trends.
        Keep your response concise (2-3 sentences).
        """)
        
        response = deep_llm.invoke([prompt])
        print()
        print('🤖 Local Model Analysis:')
        print('-' * 40)
        print(response.content)
        print('-' * 40)
        print()
        print('✅ Crypto analysis complete!')
        print('💸 Total cost: $0.00 (vs ~$0.20 with cloud APIs)')
        
    except Exception as e:
        print(f'❌ LLM creation/usage failed: {e}')
else:
    print('❌ LM Studio connection failed')
    print('Make sure LM Studio is running with a model loaded!')