#!/bin/bash
# Simple script to run Open Notebook with Ollama
# ================================================
# This is the EASIEST way to get Open Notebook running!
#
# What it does:
# 1. Checks if Docker is installed and running (starts it if possible)
# 2. Runs setup.sh automatically if configuration doesn't exist
# 3. Pulls the latest Open Notebook Docker image
# 4. Creates and starts the container with your configuration
# 5. Shows you where to access Open Notebook
#
# Usage:
#   ./run.sh
#
# That's it! One command to get everything running.
# The script handles existing containers gracefully and provides helpful status messages.

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
echo -e "${BLUE}Starting Open Notebook...${NC}"
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
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo "  View logs:    docker logs -f open-notebook"
    echo "  Stop:         docker stop open-notebook"
    echo "  Restart:      docker restart open-notebook"
    echo "  Remove:       docker rm -f open-notebook"
    echo ""
    echo -e "${YELLOW}Ollama Setup:${NC}"
    echo "  If you haven't set up Ollama yet:"
    echo "  1. Install: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "  2. Start with external access: export OLLAMA_HOST=0.0.0.0:11434 && ollama serve"
    echo "  3. Pull models: ollama pull qwen3 && ollama pull mxbai-embed-large"
    echo ""
    echo "See OLLAMA_QUICKSTART.md for detailed instructions"
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
