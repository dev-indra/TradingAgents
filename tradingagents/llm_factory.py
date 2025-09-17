"""
LLM Factory for TradingAgents

This module provides a factory for creating different types of LLM providers
including OpenRouter, LM Studio (local models), and direct OpenAI integration.
"""

import os
import logging
from typing import Dict, Any, Optional, Union
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

from .providers.lmstudio_provider import LMStudioProvider, create_lmstudio_provider


logger = logging.getLogger(__name__)


class LLMFactory:
    """
    Factory class for creating LLM instances based on provider configuration.
    """
    
    @staticmethod
    def create_llm(
        config: Dict[str, Any], 
        model_type: str = "deep_think",
        **kwargs
    ) -> Union[ChatOpenAI, ChatAnthropic]:
        """
        Create an LLM instance based on configuration.
        
        Args:
            config: Configuration dictionary containing LLM settings
            model_type: Type of model to create ("deep_think" or "quick_think")
            **kwargs: Additional arguments to pass to the LLM
            
        Returns:
            Configured LLM instance
        """
        provider = config.get("llm_provider", "openrouter").lower()
        
        # Determine which model to use
        if model_type == "deep_think":
            model_name = config.get("deep_think_llm", "anthropic/claude-3.5-sonnet")
        else:
            model_name = config.get("quick_think_llm", "openai/gpt-4o-mini")
        
        logger.info(f"Creating {model_type} LLM: {provider} - {model_name}")
        
        if provider == "lmstudio":
            return LLMFactory._create_lmstudio_llm(config, model_name, **kwargs)
        elif provider == "openrouter":
            return LLMFactory._create_openrouter_llm(config, model_name, **kwargs)
        elif provider == "openai":
            return LLMFactory._create_openai_llm(config, model_name, **kwargs)
        elif provider == "anthropic":
            return LLMFactory._create_anthropic_llm(config, model_name, **kwargs)
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
    
    @staticmethod
    def _create_lmstudio_llm(
        config: Dict[str, Any], 
        model_name: str, 
        **kwargs
    ) -> ChatOpenAI:
        """Create LM Studio LLM instance."""
        lmstudio_provider = LMStudioProvider.from_config(config)
        
        # Test connection first
        if not lmstudio_provider.test_connection():
            logger.error("Failed to connect to LM Studio. Please ensure LM Studio is running with a loaded model.")
            raise ConnectionError("Cannot connect to LM Studio server")
        
        # Get model info
        model_info = lmstudio_provider.get_model_info()
        logger.info(f"Using LM Studio model: {model_info}")
        
        return lmstudio_provider.get_chat_model(**kwargs)
    
    @staticmethod
    def _create_openrouter_llm(
        config: Dict[str, Any], 
        model_name: str, 
        **kwargs
    ) -> ChatOpenAI:
        """Create OpenRouter LLM instance."""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is required for OpenRouter provider")
        
        return ChatOpenAI(
            model=model_name,
            base_url=config.get("backend_url", "https://openrouter.ai/api/v1"),
            api_key=api_key,
            temperature=kwargs.get("temperature", 0.7),
            **kwargs
        )
    
    @staticmethod
    def _create_openai_llm(
        config: Dict[str, Any], 
        model_name: str, 
        **kwargs
    ) -> ChatOpenAI:
        """Create direct OpenAI LLM instance."""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required for OpenAI provider")
        
        return ChatOpenAI(
            model=model_name,
            api_key=api_key,
            temperature=kwargs.get("temperature", 0.7),
            **kwargs
        )
    
    @staticmethod
    def _create_anthropic_llm(
        config: Dict[str, Any], 
        model_name: str, 
        **kwargs
    ) -> ChatAnthropic:
        """Create Anthropic LLM instance."""
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is required for Anthropic provider")
        
        return ChatAnthropic(
            model=model_name,
            api_key=api_key,
            temperature=kwargs.get("temperature", 0.7),
            **kwargs
        )
    
    @staticmethod
    def get_cost_estimate(provider: str, model_name: str, tokens: int) -> float:
        """Get cost estimate for a given provider and model."""
        if provider.lower() == "lmstudio":
            return 0.0  # Local models are free
        
        # Approximate costs per 1K tokens (as of 2025)
        cost_per_1k = {
            # OpenRouter pricing
            "anthropic/claude-3.5-sonnet": 0.003,
            "openai/gpt-4o": 0.005,
            "openai/gpt-4o-mini": 0.0015,
            "openai/gpt-4": 0.03,
            
            # Direct API pricing
            "gpt-4o": 0.005,
            "gpt-4o-mini": 0.0015,
            "claude-3.5-sonnet": 0.003,
        }
        
        rate = cost_per_1k.get(model_name, 0.002)  # Default rate
        return (tokens / 1000) * rate
    
    @staticmethod
    def validate_config(config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize configuration."""
        provider = config.get("llm_provider", "openrouter").lower()
        
        # Set default models based on provider
        if provider == "lmstudio":
            if not config.get("deep_think_llm"):
                config["deep_think_llm"] = "local-model"
            if not config.get("quick_think_llm"):
                config["quick_think_llm"] = "local-model"
        
        return config
    
    @staticmethod
    def test_provider_connection(config: Dict[str, Any]) -> bool:
        """Test connection to the configured provider."""
        provider = config.get("llm_provider", "openrouter").lower()
        
        try:
            if provider == "lmstudio":
                lmstudio_provider = LMStudioProvider.from_config(config)
                return lmstudio_provider.test_connection()
            else:
                # For other providers, try creating a simple LLM instance
                llm = LLMFactory.create_llm(config, "quick_think")
                return True  # If no exception, connection is likely working
        except Exception as e:
            logger.error(f"Provider connection test failed: {e}")
            return False


def create_llm_from_config(config: Dict[str, Any], model_type: str = "deep_think", **kwargs):
    """Convenience function to create an LLM from configuration."""
    return LLMFactory.create_llm(config, model_type, **kwargs)


def get_available_providers() -> Dict[str, str]:
    """Get list of available LLM providers."""
    return {
        "lmstudio": "LM Studio (Local Models) - FREE",
        "openrouter": "OpenRouter (Multiple Models) - Paid",
        "openai": "OpenAI Direct - Paid", 
        "anthropic": "Anthropic Direct - Paid"
    }


def recommend_provider_for_budget(budget_per_day: float = 0.0) -> str:
    """Recommend the best provider based on budget."""
    if budget_per_day == 0.0:
        return "lmstudio"  # Free local models
    elif budget_per_day < 5.0:
        return "openrouter"  # Cost-effective with model variety
    else:
        return "openai"  # Premium direct access
