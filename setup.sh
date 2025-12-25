#!/bin/bash
set -e

# Open Notebook Setup Script
# ==========================
# This script helps you set up Open Notebook with Ollama (local AI models)
# 
# Features:
# - Works in minimal Docker environments with missing commands
# - Checks for required tools (docker, curl) and offers to install them
# - Creates .env and docker.env files configured for Ollama
# - Tests Ollama connection and offers to pull recommended models
# - Provides clear next steps for running Open Notebook
#
# Usage:
#   ./setup.sh
#
# The script will ask you where Ollama is running and configure accordingly.
# No API keys required when using Ollama!

# Colors for output (fallback to no color if tput unavailable)
if command -v tput >/dev/null 2>&1 && [ -t 1 ]; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    BOLD=$(tput bold)
    RESET=$(tput sgr0)
else
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    BOLD=""
    RESET=""
fi

# Helper functions
print_header() {
    echo ""
    echo "${BOLD}${BLUE}========================================${RESET}"
    echo "${BOLD}${BLUE}$1${RESET}"
    echo "${BOLD}${BLUE}========================================${RESET}"
    echo ""
}

print_success() {
    echo "${GREEN}✓${RESET} $1"
}

print_warning() {
    echo "${YELLOW}⚠${RESET} $1"
}

print_error() {
    echo "${RED}✗${RESET} $1"
}

print_info() {
    echo "${BLUE}ℹ${RESET} $1"
}

# Check if running in Docker
is_docker() {
    [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup 2>/dev/null
}

# Check and optionally install a command
check_command() {
    local cmd=$1
    local install_cmd=$2
    local package=$3
    
    if command -v "$cmd" >/dev/null 2>&1; then
        print_success "$cmd is available"
        return 0
    else
        print_warning "$cmd is not installed"
        if [ -n "$install_cmd" ] && [ -n "$package" ]; then
            read -p "Would you like to install $package? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_info "Installing $package..."
                eval "$install_cmd $package"
                if [ $? -eq 0 ]; then
                    print_success "$package installed successfully"
                    return 0
                else
                    print_error "Failed to install $package"
                    return 1
                fi
            fi
        fi
        return 1
    fi
}

# Detect package manager and set install command
detect_package_manager() {
    local sudo_cmd=""
    # Check if we need sudo (not root and not using brew)
    if [ "$EUID" -ne 0 ] && ! command -v brew >/dev/null 2>&1; then
        if command -v sudo >/dev/null 2>&1; then
            sudo_cmd="sudo "
        fi
    fi
    
    if command -v apt-get >/dev/null 2>&1; then
        echo "${sudo_cmd}apt-get install -y"
    elif command -v yum >/dev/null 2>&1; then
        echo "${sudo_cmd}yum install -y"
    elif command -v apk >/dev/null 2>&1; then
        echo "${sudo_cmd}apk add"
    elif command -v brew >/dev/null 2>&1; then
        echo "brew install"
    else
        echo ""
    fi
}

# Create .env file for Ollama configuration
create_env_file() {
    local env_file=".env"
    
    print_header "Creating Environment Configuration"
    
    if [ -f "$env_file" ]; then
        print_warning ".env file already exists"
        read -p "Would you like to back it up and create a new one? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            mv "$env_file" "${env_file}.backup.$(date +%Y%m%d_%H%M%S)"
            print_success "Existing .env backed up"
        else
            print_info "Keeping existing .env file"
            return 0
        fi
    fi
    
    # Get Ollama configuration
    echo ""
    print_info "Configuring Ollama (local AI models)"
    echo ""
    echo "Where is Ollama running?"
    echo "  1) On this same machine (localhost)"
    echo "  2) In Docker on the host machine (host.docker.internal)"
    echo "  3) On a remote machine (enter IP address)"
    echo "  4) Skip Ollama configuration"
    echo ""
    read -p "Select option (1-4): " -n 1 -r ollama_option
    echo ""
    
    case $ollama_option in
        1)
            OLLAMA_API_BASE="http://localhost:11434"
            print_info "Ollama will connect to localhost:11434"
            ;;
        2)
            OLLAMA_API_BASE="http://host.docker.internal:11434"
            print_warning "Make sure Ollama is running with: OLLAMA_HOST=0.0.0.0:11434"
            ;;
        3)
            read -p "Enter Ollama server IP address: " ollama_ip
            OLLAMA_API_BASE="http://${ollama_ip}:11434"
            print_info "Ollama will connect to ${ollama_ip}:11434"
            ;;
        4)
            print_warning "Skipping Ollama configuration - you can add it later"
            OLLAMA_API_BASE=""
            ;;
        *)
            print_warning "Invalid option, defaulting to localhost"
            OLLAMA_API_BASE="http://localhost:11434"
            ;;
    esac
    
    # Copy from example file and customize
    if [ -f ".env.example" ]; then
        cp .env.example "$env_file"
        print_success "Created .env from .env.example"
    else
        # Create minimal .env if example doesn't exist
        cat > "$env_file" << 'EOF'
# Open Notebook Configuration
# Generated by setup.sh

# API CONFIGURATION
API_URL=http://localhost:5055

# OLLAMA CONFIGURATION
EOF
        print_success "Created new .env file"
    fi
    
    # Add or update Ollama configuration
    if [ -n "$OLLAMA_API_BASE" ]; then
        if grep -q "^OLLAMA_API_BASE=" "$env_file" 2>/dev/null; then
            # Uncommented line exists, update it
            sed -i.bak "s|^OLLAMA_API_BASE=.*|OLLAMA_API_BASE=\"${OLLAMA_API_BASE}\"|" "$env_file"
            rm -f "${env_file}.bak"
        elif grep -q "^# OLLAMA_API_BASE=" "$env_file" 2>/dev/null; then
            # Commented line exists, uncomment and update it
            sed -i.bak "s|^# OLLAMA_API_BASE=.*|OLLAMA_API_BASE=\"${OLLAMA_API_BASE}\"|" "$env_file"
            rm -f "${env_file}.bak"
        else
            # No line exists, add it after the OLLAMA comment section
            if grep -q "^# OLLAMA$" "$env_file" 2>/dev/null; then
                # Insert after the # OLLAMA line
                sed -i.bak "/^# OLLAMA$/a OLLAMA_API_BASE=\"${OLLAMA_API_BASE}\"" "$env_file"
                rm -f "${env_file}.bak"
            else
                # Just append to end
                echo "" >> "$env_file"
                echo "# OLLAMA CONFIGURATION" >> "$env_file"
                echo "OLLAMA_API_BASE=\"${OLLAMA_API_BASE}\"" >> "$env_file"
            fi
        fi
        print_success "Ollama configuration added to .env"
    fi
    
    # Configure SurrealDB for single container
    if ! grep -q "^SURREAL_URL=" "$env_file" 2>/dev/null; then
        cat >> "$env_file" << 'EOF'

# SURREALDB CONFIGURATION (Single Container)
SURREAL_URL="ws://localhost:8000/rpc"
SURREAL_USER="root"
SURREAL_PASSWORD="root"
SURREAL_NAMESPACE="open_notebook"
SURREAL_DATABASE="production"
EOF
        print_success "SurrealDB configuration added to .env"
    fi
    
    echo ""
    print_success "Environment configuration complete!"
    print_info "Configuration saved to: $env_file"
}

# Create docker.env file for Docker deployments
create_docker_env() {
    local env_file="docker.env"
    
    if [ -f "$env_file" ]; then
        print_info "docker.env already exists, skipping"
        return 0
    fi
    
    print_info "Creating docker.env for Docker deployments..."
    
    # Use the OLLAMA_API_BASE from previous configuration
    cat > "$env_file" << EOF
# Open Notebook Docker Configuration
# For use with docker-compose or docker run

# API Configuration
API_URL=http://localhost:5055

# Ollama Configuration
# Uncomment and configure based on your setup:
# OLLAMA_API_BASE="http://host.docker.internal:11434"  # When Ollama runs on host
# OLLAMA_API_BASE="http://ollama:11434"                 # When Ollama in same compose
# OLLAMA_API_BASE="http://192.168.1.100:11434"          # Remote Ollama server

# SurrealDB Configuration (Single Container)
SURREAL_URL="ws://localhost:8000/rpc"
SURREAL_USER="root"
SURREAL_PASSWORD="root"
SURREAL_NAMESPACE="open_notebook"
SURREAL_DATABASE="production"

# Optional: Add API keys if you want to use cloud providers
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
# GOOGLE_API_KEY=
EOF
    
    print_success "Created docker.env file"
}

# Check Ollama connection and optionally pull models
check_ollama() {
    print_header "Checking Ollama Configuration"
    
    # Read Ollama configuration from .env
    if [ -f ".env" ] && grep -q "^OLLAMA_API_BASE=" ".env" 2>/dev/null; then
        OLLAMA_BASE=$(grep "^OLLAMA_API_BASE=" ".env" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    else
        print_warning "Ollama not configured in .env"
        return 0
    fi
    
    print_info "Testing connection to: $OLLAMA_BASE"
    
    # Test connection with curl
    if command -v curl >/dev/null 2>&1; then
        if curl -s -f "${OLLAMA_BASE}/api/tags" >/dev/null 2>&1; then
            print_success "Successfully connected to Ollama!"
            
            # Check which models are installed
            echo ""
            print_info "Installed Ollama models:"
            if command -v jq >/dev/null 2>&1; then
                curl -s "${OLLAMA_BASE}/api/tags" | jq -r '.models[]?.name // empty' 2>/dev/null || echo "  (Unable to parse model list)"
            else
                curl -s "${OLLAMA_BASE}/api/tags" 2>/dev/null || echo "  (Install jq to see model list)"
            fi
            
            # Offer to pull recommended models
            echo ""
            read -p "Would you like to pull recommended Ollama models? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if command -v ollama >/dev/null 2>&1; then
                    print_info "Pulling recommended models (this may take a while)..."
                    print_info "Pulling qwen3 (language model)..."
                    ollama pull qwen3 || print_warning "Failed to pull qwen3"
                    print_info "Pulling mxbai-embed-large (embedding model)..."
                    ollama pull mxbai-embed-large || print_warning "Failed to pull mxbai-embed-large"
                    print_success "Model download complete!"
                else
                    print_warning "Ollama CLI not available on this machine"
                    print_info "You can pull models from the machine running Ollama:"
                    echo "  ollama pull qwen3"
                    echo "  ollama pull mxbai-embed-large"
                fi
            fi
        else
            print_warning "Cannot connect to Ollama at: $OLLAMA_BASE"
            print_info "Make sure:"
            echo "  1. Ollama is running"
            echo "  2. If Open Notebook is in Docker, start Ollama with:"
            echo "     export OLLAMA_HOST=0.0.0.0:11434"
            echo "     ollama serve"
            echo "  3. The OLLAMA_API_BASE URL is correct in .env"
        fi
    else
        print_warning "curl not available, skipping Ollama connection test"
    fi
}

# Display final instructions
show_instructions() {
    print_header "Setup Complete!"
    
    echo "Your Open Notebook is configured and ready to run!"
    echo ""
    echo "${BOLD}Next Steps:${RESET}"
    echo ""
    
    if is_docker; then
        print_info "You're running in a Docker environment"
        echo "The environment is already configured. Open Notebook should be running."
    else
        echo "${BOLD}To run Open Notebook:${RESET}"
        echo ""
        echo "  ${BOLD}Option 1: Using Docker (Recommended)${RESET}"
        echo "  Run the single-container image:"
        echo "  ${GREEN}docker run -d \\"
        echo "    --name open-notebook \\"
        echo "    -p 8502:8502 -p 5055:5055 \\"
        echo "    -v \$(pwd)/notebook_data:/app/data \\"
        echo "    -v \$(pwd)/surreal_data:/mydata \\"
        echo "    --env-file .env \\"
        echo "    lfnovo/open_notebook:v1-latest-single${RESET}"
        echo ""
        echo "  Then access: ${BLUE}http://localhost:8502${RESET}"
        echo ""
        echo "  ${BOLD}Option 2: Using Docker Compose${RESET}"
        echo "  ${GREEN}docker compose -f docker-compose.single.yml up -d${RESET}"
        echo ""
        echo "  ${BOLD}Option 3: From Source (Development)${RESET}"
        echo "  ${GREEN}make start-all${RESET}"
        echo ""
    fi
    
    echo "${BOLD}Configuration Files Created:${RESET}"
    echo "  • .env          - Main configuration file"
    echo "  • docker.env    - Docker-specific configuration"
    echo ""
    
    echo "${BOLD}Ollama Quick Start:${RESET}"
    echo "  If you haven't installed Ollama yet:"
    echo "  ${GREEN}curl -fsSL https://ollama.ai/install.sh | sh${RESET}"
    echo ""
    echo "  Pull recommended models:"
    echo "  ${GREEN}ollama pull qwen3              ${RESET}# Language model"
    echo "  ${GREEN}ollama pull mxbai-embed-large  ${RESET}# Embedding model"
    echo ""
    
    echo "${BOLD}Need Help?${RESET}"
    echo "  • Documentation: ${BLUE}docs/index.md${RESET}"
    echo "  • Ollama Setup: ${BLUE}docs/features/ollama.md${RESET}"
    echo "  • Discord: ${BLUE}https://discord.gg/37XJPXfz2w${RESET}"
    echo ""
    
    print_success "Happy researching! 🚀"
}

# Main setup flow
main() {
    print_header "Open Notebook Setup Script"
    
    print_info "This script will help you set up Open Notebook with Ollama"
    print_info "Designed to work with minimal Docker environments"
    echo ""
    
    # Detect environment
    if is_docker; then
        print_info "Detected: Running inside Docker container"
    else
        print_info "Detected: Running on host system"
    fi
    
    # Detect package manager
    INSTALL_CMD=$(detect_package_manager)
    if [ -n "$INSTALL_CMD" ]; then
        print_success "Package manager detected: ${INSTALL_CMD%% *}"
    else
        print_warning "No package manager detected - manual installation may be needed"
    fi
    
    echo ""
    print_info "Checking for required tools..."
    echo ""
    
    # Check for essential tools (but don't fail if missing)
    check_command "curl" "$INSTALL_CMD" "curl" || true
    check_command "docker" "$INSTALL_CMD" "docker.io" || print_warning "Docker not found - you may need to install it separately"
    
    # Optional tools
    check_command "jq" "$INSTALL_CMD" "jq" || print_info "jq not required but helpful for JSON parsing"
    
    echo ""
    
    # Create configuration files
    create_env_file
    echo ""
    create_docker_env
    
    echo ""
    
    # Check Ollama if configured
    check_ollama
    
    echo ""
    
    # Show final instructions
    show_instructions
}

# Run main function
main
