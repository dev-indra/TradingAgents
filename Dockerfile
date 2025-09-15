# TradingAgents Dockerfile for Crypto Trading with MCP
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt pyproject.toml setup.py ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -e .

# Copy application code
COPY . .

# Create directories for data and results
RUN mkdir -p /app/results /app/data /app/logs

# Expose port for web interface
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV TRADINGAGENTS_RESULTS_DIR=/app/results
ENV TRADINGAGENTS_DATA_DIR=/app/data

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import tradingagents; print('OK')" || exit 1

# Default command
CMD ["python", "-m", "cli.main"]