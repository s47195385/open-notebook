# Quick Start Guide - Ollama Setup

Get Open Notebook running with Ollama (local AI) in just a few commands!

## 🚀 Super Quick Start (Truly One-Command!)

```bash
# Clone, setup, and run everything automatically
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook
./run.sh
```

**That's it!** The `run.sh` script will:
- ✅ Check if Docker daemon is running (and start it if possible)
- ✅ Run setup.sh automatically if no configuration exists
- ✅ **Start Ollama service automatically** (installs if needed)
- ✅ **Pull recommended AI models** (with your permission)
- ✅ Pull the latest Open Notebook Docker image
- ✅ Create and start the container with your configuration
- ✅ **Set up VS Code extension** (if VS Code is installed)
- ✅ Show you where to access Open Notebook

**To stop everything:**
```bash
./shutdown.sh
```

The `shutdown.sh` script will:
- ✅ Stop the Open Notebook Docker container
- ✅ Stop the Ollama service (if started by run.sh)
- ✅ Clean up gracefully

**What the script does automatically:**
1. Checks for Docker and starts the daemon if needed
2. Runs `setup.sh` if configuration files don't exist
3. **Installs and starts Ollama service**
4. **Offers to pull recommended AI models**
5. Creates data directories
6. Pulls the latest Open Notebook image
7. Starts the Docker container with your configuration
8. **Installs VS Code extension (optional)**
9. Shows you where to access the application

**Alternative: Setup first, then run:**

```bash
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook
./setup.sh   # Configure Ollama settings
./run.sh     # Start everything (Ollama + Docker + VS Code extension)
./shutdown.sh # Stop everything when done
```

The `setup.sh` script will guide you through:
- ✅ Checking and installing missing tools
- ✅ Creating configuration files for Ollama
- ✅ Testing your Ollama connection
- ✅ Pulling recommended AI models (optional)

## 📋 Manual Setup (Step by Step)

### Step 1: Install Ollama

```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Step 2: Start Ollama (Important for Docker users!)

```bash
# If Open Notebook will run in Docker, use this:
export OLLAMA_HOST=0.0.0.0:11434
ollama serve

# If running Open Notebook directly on host:
# Just start normally - ollama serve
```

**Why `0.0.0.0:11434`?** By default, Ollama only accepts connections from localhost. When Open Notebook runs in Docker, it needs external access.

### Step 3: Pull AI Models

```bash
# Essential models
ollama pull qwen3                 # Language model (7B - good balance)
ollama pull mxbai-embed-large     # Embedding model (for search)

# Optional: More models
ollama pull deepseek-r1           # Reasoning model (best quality)
ollama pull phi4                  # Lightweight model (faster)
```

### Step 4: Configure Open Notebook

**Option A: Use the pre-configured template**

```bash
# Copy the Ollama template
cp docker.env.ollama docker.env

# Edit if needed (choose your Ollama location)
nano docker.env
```

**Option B: Create configuration manually**

Create `docker.env`:

```env
# For Docker deployment with Ollama on host
API_URL=http://localhost:5055
OLLAMA_API_BASE="http://host.docker.internal:11434"

SURREAL_URL="ws://localhost:8000/rpc"
SURREAL_USER="root"
SURREAL_PASSWORD="root"
SURREAL_NAMESPACE="open_notebook"
SURREAL_DATABASE="production"
```

### Step 5: Run Open Notebook

**Using Docker (Recommended):**

```bash
docker run -d \
  --name open-notebook \
  -p 8502:8502 -p 5055:5055 \
  -v $(pwd)/notebook_data:/app/data \
  -v $(pwd)/surreal_data:/mydata \
  --env-file docker.env \
  lfnovo/open_notebook:v1-latest-single
```

**Using Docker Compose:**

```bash
# Use the existing docker-compose.single.yml
docker compose -f docker-compose.single.yml up -d
```

**From Source:**

```bash
make start-all
```

### Step 6: Access Open Notebook

Open your browser to: **http://localhost:8502**

## 🔧 Configuration Details

### Choosing the Right OLLAMA_API_BASE

| Your Setup | OLLAMA_API_BASE Value |
|------------|----------------------|
| Ollama on same machine (no Docker) | `http://localhost:11434` |
| Open Notebook in Docker, Ollama on host | `http://host.docker.internal:11434` |
| Both in same Docker Compose | `http://ollama:11434` |
| Ollama on remote machine | `http://192.168.1.100:11434` |

### Timeout Settings for CPU Inference

If using CPU-only Ollama (no GPU), add these to your `docker.env`:

```env
API_CLIENT_TIMEOUT=600           # 10 minutes
ESPERANTO_LLM_TIMEOUT=300        # 5 minutes
```

## 🎯 Using Your Models in Open Notebook

After starting Open Notebook:

1. **Go to Settings** (in the UI)
2. **Navigate to AI Models**
3. **Add your Ollama models:**
   - Language: `ollama/qwen3`
   - Embedding: `ollama/mxbai-embed-large`
   - Reasoning: `ollama/deepseek-r1`
4. **Set as default** for different tasks

## ✅ Verify Everything Works

### Test Ollama Connection

```bash
# From your terminal
curl http://localhost:11434/api/tags

# If Open Notebook is in Docker, test from inside container:
docker exec -it open-notebook curl http://host.docker.internal:11434/api/tags
```

### Test Open Notebook API

```bash
curl http://localhost:5055/health
```

### Check Logs (if something's wrong)

```bash
# Docker container logs
docker logs open-notebook

# Follow logs in real-time
docker logs -f open-notebook

# Ollama logs (if started by run.sh)
tail -f ~/.ollama/logs/ollama-*.log
```

## 🛑 Stopping Services

To stop all services (Open Notebook + Ollama):

```bash
./shutdown.sh
```

This will:
- Stop the Open Notebook Docker container
- Stop the Ollama service (if started by run.sh)
- Optionally remove the container (preserving your data)

**Manual shutdown if needed:**
```bash
# Stop Docker container
docker stop open-notebook

# Stop Ollama (if started by run.sh)
kill $(cat ~/.ollama/ollama.pid)

# Or stop via systemd
sudo systemctl stop ollama
```

## 🆘 Troubleshooting

### "Ollama unavailable" error

**Solution 1: Check Ollama is running**
```bash
curl http://localhost:11434/api/tags
```

**Solution 2: Enable external connections (most common issue!)**
```bash
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

**Solution 3: Verify OLLAMA_API_BASE in docker.env**
```bash
cat docker.env | grep OLLAMA_API_BASE
```

### "Unable to connect to API server" error

**Check both ports are exposed:**
```bash
docker ps | grep open-notebook
# Should show: 0.0.0.0:8502->8502 and 0.0.0.0:5055->5055
```

**Check API is running:**
```bash
curl http://localhost:5055/health
```

### Models are slow

**Check if GPU is being used:**
```bash
# NVIDIA GPU
nvidia-smi

# Or check Ollama logs
journalctl -u ollama -f  # Linux with systemd
```

**Try a smaller model:**
```bash
ollama pull phi4        # Smaller, faster
ollama pull gemma3:2b   # Even smaller
```

### Can't pull models

**Check disk space:**
```bash
df -h
```

**Use verbose mode:**
```bash
ollama pull qwen3 --verbose
```

## 📚 Next Steps

- **[Full Ollama Documentation](../docs/features/ollama.md)** - Comprehensive guide
- **[AI Models Guide](../docs/features/ai-models.md)** - Configure different providers
- **[User Guide](../docs/user-guide/index.md)** - Learn how to use Open Notebook
- **[Troubleshooting](../docs/troubleshooting/index.md)** - Common issues

## 💬 Get Help

- **Discord:** https://discord.gg/37XJPXfz2w
- **GitHub Issues:** https://github.com/lfnovo/open-notebook/issues
- **Documentation:** https://www.open-notebook.ai

---

**Pro Tip:** Start with `qwen3` for general tasks and `deepseek-r1` for complex reasoning. Both work great with Open Notebook!
