# Startup and Shutdown Scripts

This directory contains automated scripts for managing Open Notebook with Ollama and VS Code integration.

## Scripts Overview

### `run.sh` - Complete Startup Automation

The main startup script that handles everything you need to get Open Notebook running.

**What it does:**
1. ✅ Checks Docker availability and starts daemon if needed
2. ✅ Runs `setup.sh` automatically if configuration doesn't exist
3. ✅ Installs Ollama if not present (Linux/macOS)
4. ✅ Starts Ollama service with external access (`OLLAMA_HOST=0.0.0.0:11434`)
5. ✅ Offers to pull recommended AI models (qwen3, mxbai-embed-large)
6. ✅ Pulls and starts Open Notebook Docker container
7. ✅ Installs VS Code extension (if VS Code is available)
8. ✅ Shows access URLs and helpful commands

**Usage:**
```bash
./run.sh
```

**Features:**
- 🔄 Gracefully handles services already running
- 🛡️ Error handling with helpful messages
- 📊 Health checks for all services
- 📝 Logs Ollama output to `~/.ollama/logs/`
- 🔢 Tracks Ollama PID for clean shutdown

### `shutdown.sh` - Complete Shutdown Automation

The shutdown script that cleanly stops all services.

**What it does:**
1. ✅ Stops Open Notebook Docker container
2. ✅ Stops Ollama service (if started by run.sh)
3. ✅ Verifies services are stopped
4. ✅ Optionally removes container (data is preserved)

**Usage:**
```bash
./shutdown.sh
```

**Features:**
- 🔄 Handles both PID-based and systemd-based Ollama
- 🛡️ Safe shutdown with status verification
- 💾 Preserves all user data
- 📊 Shows final status of all services

## Quick Start

### First Time Setup
```bash
# Clone the repository
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook

# Run everything (will configure automatically)
./run.sh
```

### Daily Usage
```bash
# Start everything
./run.sh

# ... do your work ...

# Stop everything
./shutdown.sh
```

### With Configuration First
```bash
# Configure interactively
./setup.sh

# Start everything
./run.sh

# Stop everything
./shutdown.sh
```

## Service Status

After running `./run.sh`, you can check:

```bash
# Web Interface
http://localhost:8502

# API Documentation
http://localhost:5055/docs

# Ollama API
http://localhost:11434/api/tags

# Docker container logs
docker logs -f open-notebook

# Ollama logs
tail -f ~/.ollama/logs/ollama-*.log
```

## Troubleshooting

### Services won't start

**Check Docker:**
```bash
docker info
docker ps
```

**Check Ollama:**
```bash
curl http://localhost:11434/api/tags
ps aux | grep ollama
```

**Check container:**
```bash
docker logs open-notebook
docker ps -a | grep open-notebook
```

### Ollama connection issues

The scripts start Ollama with `OLLAMA_HOST=0.0.0.0:11434` to allow Docker container access.

If Ollama was started manually without this setting:
```bash
# Stop Ollama
./shutdown.sh

# Start with the script
./run.sh
```

Or start manually with correct settings:
```bash
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

### VS Code extension issues

The script packages and installs the extension automatically if:
1. VS Code is installed (`code` command available)
2. Node.js and npm are installed
3. The `vscode-extension` directory exists

If installation fails:
```bash
cd vscode-extension
npm install
npm run compile
npx vsce package
code --install-extension *.vsix
```

### Clean restart

If you need to start fresh:
```bash
# Stop everything
./shutdown.sh

# Remove container (keeps data)
docker rm open-notebook

# Start again
./run.sh
```

### Complete reset

⚠️ **Warning: This deletes all data!**
```bash
./shutdown.sh
docker rm open-notebook
rm -rf notebook_data surreal_data
./run.sh
```

## Advanced Usage

### Custom configuration

Edit `docker.env` before running:
```bash
./setup.sh          # Create initial config
nano docker.env     # Customize settings
./run.sh           # Start with custom config
```

### Running without VS Code extension

The script automatically skips VS Code extension if:
- VS Code is not installed
- You answer "No" to the installation prompt
- Node.js/npm is not available

### Running with existing Ollama

If Ollama is already running:
1. Make sure it's accessible: `curl http://localhost:11434/api/tags`
2. If running on different port, update `docker.env`:
   ```env
   OLLAMA_API_BASE=http://host.docker.internal:YOUR_PORT
   ```
3. Run the script: `./run.sh`

### Logs and debugging

**Ollama logs:**
```bash
# Latest log file
tail -f ~/.ollama/logs/ollama-*.log

# All logs
ls -lh ~/.ollama/logs/
```

**Docker logs:**
```bash
# Follow logs
docker logs -f open-notebook

# Last 100 lines
docker logs --tail 100 open-notebook
```

**Check PID:**
```bash
# See if Ollama is tracked
cat ~/.ollama/ollama.pid
ps -p $(cat ~/.ollama/ollama.pid)
```

## Files Created

These scripts create the following files:

```
📁 Repository root
├── docker.env               # Configuration (created by setup.sh)
├── notebook_data/           # Your notebooks and content
└── surreal_data/           # Database files

📁 Home directory
└── .ollama/
    ├── logs/               # Ollama service logs
    │   └── ollama-*.log
    └── ollama.pid         # Process ID for shutdown
```

## Requirements

**Essential:**
- Docker (will be started automatically if available)
- Curl (for health checks)

**Optional but recommended:**
- Ollama (will be installed automatically on Linux/macOS)
- VS Code (for extension features)
- Node.js and npm (for VS Code extension)

## Support

For issues with these scripts:
1. Check the [OLLAMA_QUICKSTART.md](OLLAMA_QUICKSTART.md) guide
2. Review [Troubleshooting docs](docs/troubleshooting/common-issues.md)
3. Join our [Discord](https://discord.gg/37XJPXfz2w)
4. Open an [issue](https://github.com/lfnovo/open-notebook/issues)

## Contributing

Found a bug or want to improve the scripts? PRs welcome!

Key areas for contribution:
- Windows support (currently Linux/macOS focused)
- Additional service managers (currently systemd + manual)
- More robust error handling
- Additional VS Code features

---

**Happy researching with Open Notebook! 🚀**
