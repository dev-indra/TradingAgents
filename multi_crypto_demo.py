#!/usr/bin/env python3
"""
Multi-cryptocurrency analysis demo using LM Studio
Shows the cost savings of local models vs cloud APIs
"""

import time
from tradingagents.llm_factory import LLMFactory
from tradingagents.default_config import DEFAULT_CONFIG
from langchain_core.messages import HumanMessage

def analyze_crypto(llm, crypto_symbol):
    """Analyze a cryptocurrency using the local model"""
    prompt = HumanMessage(content=f"""
    You are a professional cryptocurrency analyst. Provide a concise analysis of {crypto_symbol}.
    
    Focus on:
    1. Current market position and trends
    2. Key strengths or use cases  
    3. Short-term outlook (bullish/bearish/neutral)
    
    Keep your response to 2-3 sentences. Be specific and actionable.
    """)
    
    response = llm.invoke([prompt])
    return response.content

def main():
    print('📊 Multi-Crypto Analysis with Local Models')
    print('=' * 60)
    print('🏠 Provider: LM Studio (Local)')
    print('💰 Cost per analysis: $0.00')
    print('=' * 60)
    
    # Configure for LM Studio
    config = DEFAULT_CONFIG.copy()
    config['llm_provider'] = 'lmstudio'
    
    # Test connection
    if not LLMFactory.test_provider_connection(config):
        print('❌ LM Studio connection failed!')
        print('Make sure LM Studio is running with a model loaded.')
        return
    
    # Create LLM
    try:
        llm = LLMFactory.create_llm(config, 'deep_think')
        print('✅ Local model ready for analysis')
    except Exception as e:
        print(f'❌ Failed to create LLM: {e}')
        return
    
    # List of cryptocurrencies to analyze
    cryptos = [
        'Bitcoin (BTC)',
        'Ethereum (ETH)', 
        'Solana (SOL)',
        'Cardano (ADA)',
        'Polygon (MATIC)'
    ]
    
    print(f'\n🔍 Analyzing {len(cryptos)} cryptocurrencies...')
    print()
    
    total_start_time = time.time()
    results = {}
    
    for i, crypto in enumerate(cryptos, 1):
        print(f'[{i}/{len(cryptos)}] Analyzing {crypto}...')
        
        try:
            start_time = time.time()
            analysis = analyze_crypto(llm, crypto)
            end_time = time.time()
            
            results[crypto] = {
                'analysis': analysis,
                'time': end_time - start_time,
                'cost': 0.00  # Local model cost
            }
            
            print(f'  ✅ Complete ({results[crypto]["time"]:.1f}s)')
            
        except Exception as e:
            print(f'  ❌ Failed: {e}')
            results[crypto] = {
                'analysis': f'Error: {e}',
                'time': 0,
                'cost': 0.00
            }
    
    total_time = time.time() - total_start_time
    
    # Display results
    print('\n' + '=' * 60)
    print('📋 ANALYSIS RESULTS')
    print('=' * 60)
    
    successful_analyses = 0
    for crypto, result in results.items():
        if not result['analysis'].startswith('Error'):
            successful_analyses += 1
            print(f'\n💎 {crypto}:')
            print('-' * 40)
            print(result['analysis'])
            print(f'⏱️  Time: {result["time"]:.1f}s | 💰 Cost: ${result["cost"]:.2f}')
    
    # Cost comparison
    print('\n' + '=' * 60)
    print('💰 COST COMPARISON')
    print('=' * 60)
    
    cloud_cost_per_analysis = 0.25  # Average cloud API cost
    total_local_cost = 0.00
    total_cloud_cost = successful_analyses * cloud_cost_per_analysis
    
    print(f'📊 Analyses completed: {successful_analyses}')
    print(f'⏱️  Total time: {total_time:.1f} seconds')
    print()
    print('💸 Cost Breakdown:')
    print(f'  🏠 Local Models (LM Studio): ${total_local_cost:.2f}')
    print(f'  ☁️  Cloud APIs (estimated):   ${total_cloud_cost:.2f}')
    print(f'  💰 Money saved:              ${total_cloud_cost - total_local_cost:.2f}')
    print()
    
    if successful_analyses > 0:
        monthly_analyses = 100  # Estimate
        monthly_local = monthly_analyses * 0.00
        monthly_cloud = monthly_analyses * cloud_cost_per_analysis
        monthly_savings = monthly_cloud - monthly_local
        
        print(f'📅 Monthly Projections ({monthly_analyses} analyses):')
        print(f'  🏠 Local cost:    ${monthly_local:.2f}')
        print(f'  ☁️  Cloud cost:    ${monthly_cloud:.2f}')
        print(f'  💰 Monthly savings: ${monthly_savings:.2f}')
        
        print('\n🎉 SUCCESS! Local models provide professional analysis at ZERO cost!')
        print('🚀 Your crypto trading agents are now cost-optimized!')
    else:
        print('❌ No analyses completed successfully.')

if __name__ == '__main__':
    main()