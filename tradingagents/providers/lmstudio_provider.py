"""
LM Studio Provider for Local Model Integration

This module provides integration with LM Studio for running local language models.
LM Studio provides an OpenAI-compatible API, making integration seamless.
"""

import os
import logging
from typing import Optional, Dict, Any, List
from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain.callbacks.manager import CallbackManagerForLLMRun
from langchain.schema import ChatResult, LLMResult
from langchain_core.messages import BaseMessage


logger = logging.getLogger(__name__)


class LMStudioProvider:
    """
    LM Studio provider for local model integration.
    
    This class handles communication with LM Studio's local server,
    which provides an OpenAI-compatible API for running local models.
    """
    
    def __init__(
        self,
        base_url: str = "http://192.168.0.33:1234/v1",
        api_key: str = "lm-studio",
        model_name: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        timeout: int = 300,
        **kwargs
    ):
        """
        Initialize LM Studio provider.
        
        Args:
            base_url: LM Studio server URL (default: http://192.168.0.33:1234/v1)
            api_key: API key (LM Studio uses "lm-studio" by default)
            model_name: Name of the loaded model (will auto-detect if None)
            temperature: Model temperature for response generation
            max_tokens: Maximum tokens in response
            timeout: Request timeout in seconds
            **kwargs: Additional arguments passed to the OpenAI client
        """
        self.base_url = base_url
        self.api_key = api_key
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout = timeout
        
        # Initialize OpenAI client for LM Studio
        self.client = OpenAI(
            base_url=base_url,
            api_key=api_key,
            timeout=timeout
        )
        
        # Auto-detect model if not specified
        if not self.model_name:
            self.model_name = self._detect_loaded_model()
            
        logger.info(f"Initialized LM Studio provider with model: {self.model_name}")
    
    def _detect_loaded_model(self) -> str:
        """
        Auto-detect the currently loaded model in LM Studio.
        
        Returns:
            Name of the loaded model
        """
        try:
            models = self.client.models.list()
            if models.data:
                model_name = models.data[0].id
                logger.info(f"Auto-detected LM Studio model: {model_name}")
                return model_name
            else:
                logger.warning("No models detected in LM Studio. Using default name.")
                return "local-model"
        except Exception as e:
            logger.error(f"Failed to detect LM Studio model: {e}")
            return "local-model"
    
    def get_chat_model(self, **kwargs) -> ChatOpenAI:
        """
        Get a LangChain ChatOpenAI instance configured for LM Studio.
        
        Args:
            **kwargs: Additional arguments to override defaults
            
        Returns:
            Configured ChatOpenAI instance
        """
        config = {
            "model": self.model_name,
            "temperature": self.temperature,
            "base_url": self.base_url,
            "api_key": self.api_key,
            "timeout": self.timeout,
        }
        
        if self.max_tokens:
            config["max_tokens"] = self.max_tokens
            
        # Override with any provided kwargs
        config.update(kwargs)
        
        return ChatOpenAI(**config)
    
    def test_connection(self) -> bool:
        """
        Test connection to LM Studio server.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            # Try to list models
            models = self.client.models.list()
            logger.info(f"LM Studio connection successful. Available models: {len(models.data)}")
            return True
        except Exception as e:
            logger.error(f"LM Studio connection failed: {e}")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded model.
        
        Returns:
            Dictionary containing model information
        """
        try:
            models = self.client.models.list()
            if models.data:
                model = models.data[0]
                return {
                    "id": model.id,
                    "object": model.object,
                    "owned_by": getattr(model, 'owned_by', 'local'),
                    "created": getattr(model, 'created', None)
                }
            return {"error": "No models loaded"}
        except Exception as e:
            return {"error": str(e)}
    
    def estimate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Estimate cost for local model usage (always returns 0 for local models).
        
        Args:
            prompt_tokens: Number of prompt tokens
            completion_tokens: Number of completion tokens
            
        Returns:
            Always 0.0 for local models
        """
        return 0.0
    
    @classmethod
    def from_config(cls, config: Dict[str, Any]) -> "LMStudioProvider":
        """
        Create LM Studio provider from configuration dictionary.
        
        Args:
            config: Configuration dictionary
            
        Returns:
            Configured LMStudioProvider instance
        """
        return cls(
            base_url=config.get("lmstudio_base_url", "http://192.168.0.33:1234/v1"),
            api_key=config.get("lmstudio_api_key", "lm-studio"),
            model_name=config.get("lmstudio_model_name"),
            temperature=config.get("temperature", 0.7),
            max_tokens=config.get("max_tokens"),
            timeout=config.get("timeout", 300)
        )


def create_lmstudio_provider(
    base_url: Optional[str] = None,
    model_name: Optional[str] = None,
    **kwargs
) -> LMStudioProvider:
    """
    Convenience function to create an LM Studio provider.
    
    Args:
        base_url: LM Studio server URL
        model_name: Name of the model to use
        **kwargs: Additional configuration
        
    Returns:
        Configured LMStudioProvider instance
    """
    base_url = base_url or os.getenv("LMSTUDIO_BASE_URL", "http://192.168.0.33:1234/v1")
    model_name = model_name or os.getenv("LMSTUDIO_MODEL_NAME")
    
    return LMStudioProvider(
        base_url=base_url,
        model_name=model_name,
        **kwargs
    )


# Recommended models for different use cases
RECOMMENDED_MODELS = {
    "reasoning": [
        "llama-3.1-70b-instruct",
        "llama-3.1-8b-instruct", 
        "qwen2.5-14b-instruct",
        "yi-34b-chat"
    ],
    "speed": [
        "llama-3.1-8b-instruct",
        "phi-3.5-mini-instruct",
        "qwen2.5-7b-instruct"
    ],
    "balanced": [
        "llama-3.1-8b-instruct",
        "qwen2.5-14b-instruct",
        "mistral-nemo-12b-instruct"
    ]
}


def get_recommended_models(use_case: str = "balanced") -> List[str]:
    """
    Get recommended models for a specific use case.
    
    Args:
        use_case: One of "reasoning", "speed", or "balanced"
        
    Returns:
        List of recommended model names
    """
    return RECOMMENDED_MODELS.get(use_case, RECOMMENDED_MODELS["balanced"])