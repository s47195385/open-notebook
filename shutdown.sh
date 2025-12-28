#!/bin/bash
# Shutdown script for Open Notebook and Ollama
# =============================================
# This script cleanly stops all Open Notebook services
#
# What it does:
# 1. Stops the Open Notebook Docker container
# 2. Stops the Ollama service (if started by run.sh)
# 3. Provides status of what was stopped
#
# Usage:
#   ./shutdown.sh
#
# To start everything again:
#   ./run.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Open Notebook - Shutdown Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠${NC} Docker not found, skipping container shutdown"
        return 1
    fi
    return 0
}

# Stop Open Notebook container
echo -e "${BLUE}Stopping Open Notebook container...${NC}"
if check_docker; then
    if docker ps --format '{{.Names}}' | grep -q '^open-notebook$'; then
        docker stop open-notebook
        echo -e "${GREEN}✓${NC} Open Notebook container stopped"
    else
        echo -e "${YELLOW}⚠${NC} Open Notebook container is not running"
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping container shutdown (Docker not available)"
fi

echo ""

# Stop Ollama service
echo -e "${BLUE}Stopping Ollama service...${NC}"

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Ollama service is not running"
else
    # Try to stop Ollama
    STOPPED=false
    
    # Check if we have a PID file from run.sh
    if [ -f "$HOME/.ollama/ollama.pid" ]; then
        PID=$(cat "$HOME/.ollama/ollama.pid")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "Stopping Ollama process (PID: $PID)..."
            # Try graceful shutdown first with TERM signal
            kill -TERM "$PID" 2>/dev/null || true
            
            # Wait up to 5 seconds for graceful shutdown
            for _ in {1..5}; do
                if ! ps -p "$PID" > /dev/null 2>&1; then
                    break
                fi
                sleep 1
            done
            
            # If still running, force kill
            if ps -p "$PID" > /dev/null 2>&1; then
                echo "Process still running, forcing shutdown..."
                kill -KILL "$PID" 2>/dev/null || true
                sleep 1
            fi
            
            # Check if it's stopped
            if ! ps -p "$PID" > /dev/null 2>&1; then
                rm -f "$HOME/.ollama/ollama.pid"
                STOPPED=true
                echo -e "${GREEN}✓${NC} Ollama service stopped"
            else
                echo -e "${YELLOW}⚠${NC} Could not stop Ollama process (may need manual intervention)"
            fi
        else
            # PID file exists but process is not running
            rm -f "$HOME/.ollama/ollama.pid"
            echo -e "${YELLOW}⚠${NC} Ollama PID file was stale, removed"
        fi
    fi
    
    # Try systemd if available and not stopped yet
    if [ "$STOPPED" = false ] && command -v systemctl &> /dev/null; then
        if systemctl is-active --quiet ollama 2>/dev/null; then
            echo "Stopping Ollama via systemd..."
            sudo systemctl stop ollama 2>/dev/null && {
                STOPPED=true
                echo -e "${GREEN}✓${NC} Ollama service stopped via systemd"
            }
        fi
    fi
    
    # If still running, inform user
    if [ "$STOPPED" = false ]; then
        if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠${NC} Ollama is still running (managed externally)"
            echo "  If you want to stop it manually:"
            echo "  • Find process: ps aux | grep ollama"
            echo "  • Stop via systemd: sudo systemctl stop ollama"
            echo "  • Or kill process: kill <PID>"
        else
            echo -e "${GREEN}✓${NC} Ollama service stopped"
        fi
    fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Shutdown Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check final status
DOCKER_RUNNING=false
OLLAMA_RUNNING=false

if check_docker && docker ps --format '{{.Names}}' | grep -q '^open-notebook$'; then
    DOCKER_RUNNING=true
fi

if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    OLLAMA_RUNNING=true
fi

if [ "$DOCKER_RUNNING" = false ] && [ "$OLLAMA_RUNNING" = false ]; then
    echo -e "${GREEN}✓${NC} All services stopped successfully"
    echo ""
    echo "To start everything again, run:"
    echo "  ./run.sh"
else
    echo "Service Status:"
    if [ "$DOCKER_RUNNING" = true ]; then
        echo -e "  Open Notebook: ${YELLOW}Still running${NC}"
    else
        echo -e "  Open Notebook: ${GREEN}Stopped${NC}"
    fi
    
    if [ "$OLLAMA_RUNNING" = true ]; then
        echo -e "  Ollama:        ${YELLOW}Still running${NC}"
    else
        echo -e "  Ollama:        ${GREEN}Stopped${NC}"
    fi
fi

echo ""

# Offer to remove container
if check_docker; then
    if docker ps -a --format '{{.Names}}' | grep -q '^open-notebook$'; then
        echo ""
        read -p "Would you like to remove the Open Notebook container? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker rm open-notebook
            echo -e "${GREEN}✓${NC} Container removed"
            echo ""
            echo "Note: Your data in ./notebook_data and ./surreal_data is preserved"
        fi
    fi
fi

echo ""
echo "Done! 👋"
echo ""
