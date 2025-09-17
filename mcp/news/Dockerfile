FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastmcp \
    aiohttp \
    feedparser \
    textblob \
    uvicorn \
    python-dotenv \
    fastapi

# Download TextBlob corpora
RUN python -m textblob.download_corpora

# Copy MCP server code
COPY mcp/news/server.py .
COPY mcp/news/requirements.txt .

# Install additional requirements if they exist
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

# Expose port
EXPOSE 9001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9001/health || exit 1

# Start server
CMD ["python", "server.py"]