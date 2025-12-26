#!/bin/bash
# Complete startup script for Open Notebook with Ollama
# =======================================================
# This script provides COMPLETE automation for Open Notebook!
#
# What it does:
# 1. Checks if Docker is installed and running (starts it if possible)
# 2. Runs setup.sh automatically if configuration doesn't exist
# 3. Starts Ollama service (if not already running)
# 4. Pulls the latest Open Notebook Docker image
# 5. Creates and starts the container with your configuration
# 6. Installs VS Code extension (if VS Code is available)
# 7. Shows you where to access Open Notebook
#
# Usage:
#   ./run.sh
#
# To stop everything:
#   ./shutdown.sh
#
# That's it! One command to get everything running.
# The script handles existing services gracefully and provides helpful status messages.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Open Notebook - Quick Run Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed or not in PATH${NC}"
    echo ""
    echo "Please install Docker first:"
    echo "  https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is available"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Docker daemon is not running"
    echo ""
    echo "Attempting to start Docker daemon..."
    
    # Try different methods to start Docker
    if command -v systemctl &> /dev/null; then
        echo "Using systemctl to start Docker..."
        sudo systemctl start docker 2>/dev/null || true
    elif command -v service &> /dev/null; then
        echo "Using service to start Docker..."
        sudo service docker start 2>/dev/null || true
    elif [ -f "/usr/local/bin/com.docker.cli" ]; then
        echo "Starting Docker Desktop..."
        open -a Docker 2>/dev/null || true
    fi
    
    # Wait a bit for Docker to start
    echo "Waiting for Docker daemon to start..."
    for i in {1..10}; do
        if docker info &> /dev/null; then
            echo -e "${GREEN}✓${NC} Docker daemon started successfully"
            break
        fi
        sleep 2
        echo -n "."
    done
    echo ""
    
    # Check again
    if ! docker info &> /dev/null; then
        echo -e "${RED}✗ Could not start Docker daemon${NC}"
        echo ""
        echo "Please start Docker manually:"
        echo "  • Linux: sudo systemctl start docker"
        echo "  • macOS/Windows: Start Docker Desktop application"
        echo ""
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Docker daemon is running"

# Check if configuration exists
if [ ! -f "docker.env" ] && [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} No configuration file found"
    echo ""
    echo "Running setup script first..."
    echo ""
    
    if [ -f "setup.sh" ]; then
        ./setup.sh
    else
        echo -e "${RED}✗ setup.sh not found${NC}"
        echo ""
        echo "Please run this script from the open-notebook directory:"
        echo "  cd open-notebook"
        echo "  ./run.sh"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Configuration files found"

# Determine which config file to use
ENV_FILE=""
if [ -f "docker.env" ]; then
    ENV_FILE="docker.env"
elif [ -f ".env" ]; then
    ENV_FILE=".env"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Starting Ollama Backend${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Ollama is not installed"
    echo ""
    echo "Installing Ollama..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://ollama.ai/install.sh | sh
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            echo -e "${RED}✗ Homebrew not found. Please install Ollama manually:${NC}"
            echo "  Visit: https://ollama.ai/download"
            exit 1
        fi
    else
        echo -e "${RED}✗ Unsupported OS. Please install Ollama manually:${NC}"
        echo "  Visit: https://ollama.ai/download"
        exit 1
    fi
    
    echo -e "${GREEN}✓${NC} Ollama installed successfully"
else
    echo -e "${GREEN}✓${NC} Ollama is installed"
fi

# Check if Ollama is already running
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Ollama service is already running"
else
    echo -e "${YELLOW}⚠${NC} Ollama service is not running"
    echo ""
    echo "Starting Ollama service..."
    
    # Start Ollama in the background with external access
    export OLLAMA_HOST=0.0.0.0:11434
    
    # Create a log directory for Ollama
    mkdir -p "$HOME/.ollama/logs"
    OLLAMA_LOG="$HOME/.ollama/logs/ollama-$(date +%Y%m%d-%H%M%S).log"
    
    # Start Ollama in background based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - use systemd if available
        if command -v systemctl &> /dev/null; then
            echo "Starting Ollama via systemd..."
            sudo systemctl start ollama 2>/dev/null || {
                echo "Systemd not available, starting manually..."
                nohup ollama serve > "$OLLAMA_LOG" 2>&1 &
                echo $! > "$HOME/.ollama/ollama.pid"
            }
        else
            nohup ollama serve > "$OLLAMA_LOG" 2>&1 &
            echo $! > "$HOME/.ollama/ollama.pid"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        nohup ollama serve > "$OLLAMA_LOG" 2>&1 &
        echo $! > "$HOME/.ollama/ollama.pid"
    fi
    
    # Wait for Ollama to start
    echo "Waiting for Ollama to start..."
    for i in {1..30}; do
        if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Ollama service started successfully"
            echo "  Log file: $OLLAMA_LOG"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
    
    # Final check
    if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo -e "${RED}✗ Failed to start Ollama service${NC}"
        echo ""
        echo "Please start Ollama manually:"
        echo "  export OLLAMA_HOST=0.0.0.0:11434"
        echo "  ollama serve"
        echo ""
        echo "Then run this script again."
        exit 1
    fi
fi

# Check if recommended models are available
echo ""
echo "Checking for AI models..."
MODELS_OUTPUT=$(curl -s http://localhost:11434/api/tags 2>/dev/null || echo '{"models":[]}')

if echo "$MODELS_OUTPUT" | grep -q "qwen"; then
    echo -e "${GREEN}✓${NC} Language model (qwen) found"
else
    echo -e "${YELLOW}⚠${NC} Language model (qwen) not found"
    echo ""
    read -p "Would you like to pull the recommended language model (qwen3)? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pulling qwen3 model (this may take several minutes)..."
        ollama pull qwen3
        echo -e "${GREEN}✓${NC} qwen3 model installed"
    else
        echo "Skipping model installation. You can install later with: ollama pull qwen3"
    fi
fi

if echo "$MODELS_OUTPUT" | grep -q "mxbai-embed-large"; then
    echo -e "${GREEN}✓${NC} Embedding model (mxbai-embed-large) found"
else
    echo -e "${YELLOW}⚠${NC} Embedding model (mxbai-embed-large) not found"
    echo ""
    read -p "Would you like to pull the recommended embedding model? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pulling mxbai-embed-large model..."
        ollama pull mxbai-embed-large
        echo -e "${GREEN}✓${NC} mxbai-embed-large model installed"
    else
        echo "Skipping model installation. You can install later with: ollama pull mxbai-embed-large"
    fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Starting Open Notebook Docker${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q '^open-notebook$'; then
    echo -e "${YELLOW}⚠${NC} Container 'open-notebook' already exists"
    
    # Check if it's running
    if docker ps --format '{{.Names}}' | grep -q '^open-notebook$'; then
        echo -e "${GREEN}✓${NC} Open Notebook is already running!"
        echo ""
        echo "Access it at: ${GREEN}http://localhost:8502${NC}"
        echo ""
        echo "To restart: docker restart open-notebook"
        echo "To stop:    docker stop open-notebook"
        echo "To view logs: docker logs -f open-notebook"
        exit 0
    else
        echo "Starting existing container..."
        docker start open-notebook
        
        # Wait a moment and check if it started
        sleep 2
        if docker ps --format '{{.Names}}' | grep -q '^open-notebook$'; then
            echo -e "${GREEN}✓${NC} Open Notebook started!"
            echo ""
            echo "Access it at: ${GREEN}http://localhost:8502${NC}"
            echo "API docs at: ${BLUE}http://localhost:5055/docs${NC}"
            echo ""
            echo "To view logs: docker logs -f open-notebook"
            echo "To stop:      docker stop open-notebook"
        else
            echo -e "${RED}✗${NC} Failed to start container"
            echo "Check logs with: docker logs open-notebook"
            exit 1
        fi
        exit 0
    fi
fi

# Pull latest image
echo "Pulling latest Open Notebook image..."
docker pull lfnovo/open_notebook:v1-latest-single

# Create data directories
mkdir -p notebook_data surreal_data

# Run the container
echo ""
echo "Starting Open Notebook container..."
echo ""

docker run -d \
  --name open-notebook \
  -p 8502:8502 \
  -p 5055:5055 \
  -v "$(pwd)/notebook_data:/app/data" \
  -v "$(pwd)/surreal_data:/mydata" \
  --env-file "$ENV_FILE" \
  --restart unless-stopped \
  lfnovo/open_notebook:v1-latest-single

# Wait a moment for container to start
sleep 3

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q '^open-notebook$'; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   Open Notebook is now running!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "🌐 Web Interface: ${GREEN}http://localhost:8502${NC}"
    echo -e "📚 API Documentation: ${BLUE}http://localhost:5055/docs${NC}"
    echo ""
    echo -e "${GREEN}✓${NC} Ollama Backend: Running on port 11434"
    echo -e "${GREEN}✓${NC} Open Notebook: Running in Docker"
    echo ""
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo "  View logs:      docker logs -f open-notebook"
    echo "  Stop all:       ./shutdown.sh"
    echo "  Restart:        docker restart open-notebook"
    echo "  Ollama models:  ollama list"
    echo ""
    
    # Check for VS Code and offer to set up extension
    if command -v code &> /dev/null; then
        echo -e "${BLUE}========================================${NC}"
        echo -e "${BLUE}   VS Code Extension Setup${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo ""
        
        if [ -d "vscode-extension" ]; then
            echo -e "${GREEN}✓${NC} VS Code extension found"
            echo ""
            read -p "Would you like to install/update the VS Code extension? [y/N] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "Installing VS Code extension..."
                cd vscode-extension
                
                # Check if npm is installed
                if command -v npm &> /dev/null; then
                    echo "Installing dependencies..."
                    npm install
                    
                    echo "Compiling extension..."
                    npm run compile
                    
                    echo "Packaging extension..."
                    npx vsce package || {
                        echo -e "${YELLOW}⚠${NC} vsce not found, installing it..."
                        npm install -g @vscode/vsce
                        npx vsce package
                    }
                    
                    VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)
                    if [ -n "$VSIX_FILE" ]; then
                        echo "Installing extension to VS Code..."
                        code --install-extension "$VSIX_FILE" --force
                        echo -e "${GREEN}✓${NC} VS Code extension installed successfully!"
                        echo ""
                        echo "To use the extension:"
                        echo "  1. Restart VS Code or reload window (Ctrl+Shift+P → 'Reload Window')"
                        echo "  2. Open Command Palette (Ctrl+Shift+P)"
                        echo "  3. Search for 'Open Notebook' commands"
                    else
                        echo -e "${RED}✗${NC} Failed to package extension"
                    fi
                else
                    echo -e "${YELLOW}⚠${NC} npm not found. Please install Node.js to build the extension."
                fi
                
                cd ..
            fi
        else
            echo -e "${YELLOW}⚠${NC} VS Code extension directory not found"
        fi
        echo ""
    fi
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Next Steps${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "1. Open http://localhost:8502 in your browser"
    echo "2. Go to Settings → AI Models"
    echo "3. Add your Ollama models:"
    echo "   • Language: ollama/qwen3"
    echo "   • Embedding: ollama/mxbai-embed-large"
    echo "4. Start creating notebooks and adding sources!"
    echo ""
    echo "📖 For detailed help, see: OLLAMA_QUICKSTART.md"
    echo "💬 Join our Discord: https://discord.gg/37XJPXfz2w"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Failed to start Open Notebook${NC}"
    echo ""
    echo "Check logs with:"
    echo "  docker logs open-notebook"
    echo ""
    exit 1
fi
