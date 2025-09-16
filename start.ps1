# TradingAgents Docker Startup Script for Windows
# This script helps set up and start the crypto trading environment

Write-Host "🚀 Starting TradingAgents Crypto Trading Framework" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "📋 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "⚠️  SETUP REQUIRED: Please configure your API keys!" -ForegroundColor Yellow
    Write-Host "   ✅ Required: OPENROUTER_API_KEY (AI agents)" -ForegroundColor Yellow  
    Write-Host "   ✅ Required: COINGECKO_API_KEY (crypto data - free)" -ForegroundColor Yellow
    Write-Host "   📖 See API_SETUP.md for detailed instructions" -ForegroundColor Cyan
    Write-Host "   📝 Edit .env file with: notepad .env" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press enter when you've added your API keys to .env"
}

# Check if required API keys are configured
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
if ($envContent) {
    $hasOpenRouter = $envContent | Where-Object { $_ -match "^OPENROUTER_API_KEY=.+" -and $_ -notmatch "your_openrouter_api_key_here" }
    $hasCoinGecko = $envContent | Where-Object { $_ -match "^COINGECKO_API_KEY=.+" -and $_ -notmatch "your_coingecko_api_key_here" }
    
    if (-not $hasOpenRouter) {
        Write-Host "❌ OPENROUTER_API_KEY not configured in .env" -ForegroundColor Red
        Write-Host "   Get key: https://openrouter.ai/keys" -ForegroundColor Cyan
    }
    if (-not $hasCoinGecko) {
        Write-Host "❌ COINGECKO_API_KEY not configured in .env" -ForegroundColor Red  
        Write-Host "   Get key: https://www.coingecko.com/en/api" -ForegroundColor Cyan
    }
    
    if (-not $hasOpenRouter -or -not $hasCoinGecko) {
        Write-Host ""
        Write-Host "📖 See API_SETUP.md for step-by-step instructions" -ForegroundColor Yellow
        Read-Host "Press enter to continue anyway (some features may not work)"
    } else {
        Write-Host "✅ API keys configured!" -ForegroundColor Green
    }
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