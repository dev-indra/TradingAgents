# TradingAgents Docker Startup Script for Windows
# This script helps set up and start the crypto trading environment

Write-Host "🚀 Starting TradingAgents Crypto Trading Framework" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "📋 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit .env file with your API keys before continuing!" -ForegroundColor Yellow
    Write-Host "   Required: OPENROUTER_API_KEY, COINGECKO_API_KEY" -ForegroundColor Yellow
    Read-Host "Press enter when you've configured your .env file"
}

# Create necessary directories
Write-Host "📁 Creating directories..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "results" | Out-Null
New-Item -ItemType Directory -Force -Path "data" | Out-Null
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Pull latest images if they exist
Write-Host "📦 Pulling latest images..." -ForegroundColor Blue
docker-compose pull

# Build and start services
Write-Host "🏗️  Building and starting services..." -ForegroundColor Blue
docker-compose up --build -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Check service health
Write-Host "🔍 Checking service status..." -ForegroundColor Blue
docker-compose ps

# Show logs
Write-Host "📋 Service logs (press Ctrl+C to stop viewing logs):" -ForegroundColor Blue
Write-Host "=================================================="
docker-compose logs -f --tail=50

Write-Host ""
Write-Host "🎉 TradingAgents is running!" -ForegroundColor Green
Write-Host "   - Web interface: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Main API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   - Crypto MCP: http://localhost:9000" -ForegroundColor Cyan
Write-Host "   - News MCP: http://localhost:9001" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop services: docker-compose down" -ForegroundColor Yellow
Write-Host "To view logs: docker-compose logs -f tradingagents" -ForegroundColor Yellow