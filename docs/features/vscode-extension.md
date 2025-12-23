# VS Code Extension

The Open Notebook VS Code extension brings AI-powered research capabilities directly into your development environment.

## Overview

Work with your research notebooks, chat with AI about your code, and generate code snippets - all without leaving VS Code.

### Key Features

- 🚀 **Service Management** - Start/stop Open Notebook services from VS Code
- 💬 **AI Chat** - Ask questions about code, get AI-powered responses
- ✍️ **Agent Write** - Generate or modify code using AI
- 📁 **Context Attachments** - Add files and folders as context for better AI responses
- 📚 **Notebook Management** - Browse and manage research notebooks
- 📊 **Status Monitoring** - Real-time service health monitoring

## Installation

### Prerequisites

- VS Code 1.80.0 or higher
- Open Notebook backend services (Docker setup)
- Docker and Docker Compose (for service management)

### Installing the Extension

#### Option 1: From VSIX (Recommended)

1. Download the latest `.vsix` file from the [releases page](https://github.com/lfnovo/open-notebook/releases)
2. Open VS Code
3. Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the "..." menu → "Install from VSIX..."
5. Select the downloaded `.vsix` file

#### Option 2: From Source

```bash
cd vscode-extension
npm install
npm run compile
```

Press F5 in VS Code to launch the Extension Development Host.

## Quick Start

### 1. Configure the Extension

Open VS Code settings (Ctrl+, / Cmd+,) and search for "Open Notebook":

- **API URL**: Set to your Open Notebook backend (default: `http://localhost:5055`)
- **Docker Compose Path**: Path to your `docker-compose.yml` file (optional)

### 2. Start Services

If Open Notebook isn't running:

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run: "Open Notebook: Start Services"
3. Wait for services to start (status bar shows progress)

### 3. Create a Notebook

1. Open Command Palette
2. Run: "Open Notebook: Create New Notebook"
3. Enter a name and description
4. Optionally set as default notebook

### 4. Start Using AI Features

#### Ask About Code

1. Select code in your editor
2. Right-click → "Open Notebook: Ask About Selection"
3. Enter your question
4. View the AI's response

#### Generate Code

1. Position cursor or select code to modify
2. Right-click → "Open Notebook: Agent Write"
3. Describe what you want
4. AI-generated code is inserted automatically

## Features in Detail

### Service Management

The extension can start, stop, and monitor Open Notebook services:

**Commands:**
- `Open Notebook: Start Services` - Start Docker containers
- `Open Notebook: Stop Services` - Stop Docker containers
- `Open Notebook: Restart Services` - Restart all services
- `Open Notebook: Check Service Status` - Verify services are running

**Status Bar:**
- Shows current service status (✓ running, ⊘ stopped, ⚠ error)
- Click to check status
- Auto-updates every 30 seconds

### AI-Powered Chat

Ask questions about your code and get intelligent responses powered by your local LLM.

**Use Cases:**
- Explain what a function does
- Suggest improvements or refactoring
- Debug issues
- Generate documentation
- Review code for potential problems

**Example:**
```
Selection: async function fetchData() { ... }
Question: "What does this function do and how can I improve it?"
```

### Agent Write Mode

Let AI write or modify code for you.

**Use Cases:**
- Generate new functions
- Add error handling
- Write tests
- Refactor code
- Implement features

**Example:**
```
Selection: function add(a, b) { return a + b; }
Prompt: "Add input validation and error handling"
```

### Context Management

Attach files and folders to provide better context for AI responses.

**Commands:**
- `Open Notebook: Attach Current File to Chat` - Add current file
- `Open Notebook: Attach Folder to Chat` - Add entire folder

Context is copied to clipboard for use in chat.

**Settings:**
- `maxContextFiles`: Maximum files to include from folders (default: 50)
- `autoAttachWorkspaceContext`: Auto-attach workspace (default: false)

### Notebook Management

Browse and manage your research notebooks directly from VS Code.

**Sidebar Views:**
- **Notebooks** - List all notebooks, create new ones, set defaults
- **Sources** - View sources attached to default notebook
- **Status** - Monitor service health and configuration

**Commands:**
- `Open Notebook: Create New Notebook` - Create new research notebook
- `Open Notebook: Refresh Notebooks` - Refresh notebook list
- `Open Notebook: Refresh Sources` - Refresh source list

## Configuration

### Extension Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `openNotebook.apiUrl` | Open Notebook API URL | `http://localhost:5055` |
| `openNotebook.dockerComposePath` | Path to docker-compose.yml | (none) |
| `openNotebook.autoStart` | Auto-start services on VS Code launch | `false` |
| `openNotebook.ollamaPath` | Path to Ollama executable | (none) |
| `openNotebook.defaultNotebook` | Default notebook ID | (none) |
| `openNotebook.autoAttachWorkspaceContext` | Auto-attach workspace | `false` |
| `openNotebook.maxContextFiles` | Max files in folder context | `50` |

### Configuration Examples

**Local Development:**
```json
{
  "openNotebook.apiUrl": "http://localhost:5055",
  "openNotebook.dockerComposePath": "/path/to/open-notebook/docker-compose.full.yml",
  "openNotebook.autoStart": true,
  "openNotebook.maxContextFiles": 100
}
```

**Remote Server:**
```json
{
  "openNotebook.apiUrl": "http://192.168.1.100:5055",
  "openNotebook.defaultNotebook": "notebook-id-here"
}
```

## Keyboard Shortcuts

The extension doesn't define default keyboard shortcuts to avoid conflicts. You can add your own in VS Code:

1. Open Keyboard Shortcuts (Ctrl+K Ctrl+S / Cmd+K Cmd+S)
2. Search for "Open Notebook"
3. Click the "+" icon to add a keybinding

**Suggested shortcuts:**
- Ask Selection: `Ctrl+Alt+A` / `Cmd+Alt+A`
- Agent Write: `Ctrl+Alt+W` / `Cmd+Alt+W`
- Start Services: `Ctrl+Alt+S` / `Cmd+Alt+S`

## Troubleshooting

### Extension Won't Activate

**Check:**
- VS Code version is 1.80.0 or higher
- Extension is installed correctly (check Extensions view)
- Check Output panel → Extension Host for errors

### Can't Connect to API

**Check:**
1. API URL is correct in settings
2. Services are running: `docker ps`
3. Port 5055 is accessible
4. Try: `curl http://localhost:5055/api/health`

**Fix:**
```bash
# Check services
docker ps

# Start services if needed
docker compose up -d

# Check logs
docker compose logs open_notebook
```

### Docker Commands Fail

**Check:**
1. Docker Compose path is correct
2. Docker daemon is running
3. User has Docker permissions
4. Using `docker compose` (not `docker-compose`)

**Fix:**
```bash
# Check Docker is running
docker version

# Check permissions
docker ps

# Update Docker Compose path in settings
```

### AI Responses Are Slow

This is expected with local LLMs, especially on slower hardware.

**Tips:**
- Use smaller models (e.g., llama2:7b instead of llama2:70b)
- Reduce context size (fewer files/folders)
- Ensure Ollama is using GPU acceleration
- Close other resource-intensive applications

### "No notebooks found" Error

**Fix:**
1. Make sure services are running
2. Create a notebook using the command palette
3. Set it as default in settings

## Use Cases

### Code Review

1. Select code to review
2. Right-click → "Ask About Selection"
3. Ask: "Review this code for potential issues"

### Documentation Generation

1. Select function/class
2. Right-click → "Agent Write"
3. Prompt: "Add comprehensive JSDoc documentation"

### Refactoring

1. Select code to refactor
2. Right-click → "Agent Write"
3. Prompt: "Refactor to use async/await"

### Test Generation

1. Select function
2. Right-click → "Agent Write"
3. Prompt: "Generate unit tests for this function"

### Learning

1. Select unfamiliar code
2. Right-click → "Ask About Selection"
3. Ask: "Explain this code in simple terms"

## Privacy & Security

The VS Code extension follows Open Notebook's privacy-first principles:

- ✅ **Local-First**: Works with local Ollama models, no cloud required
- ✅ **No Telemetry**: No data collection or tracking
- ✅ **Open Source**: Fully auditable code
- ✅ **Self-Hosted**: Your data stays on your machine

## Known Limitations

### Current Version (v0.1.0)

- ❌ No inline chat panel (planned for v0.2.0)
- ❌ No streaming responses (planned for v0.2.0)
- ❌ No audio/podcast features (intentionally excluded)
- ❌ Limited error messages (improving in future versions)

## Roadmap

### v0.2.0 (Planned)
- Inline chat panel with conversation history
- Streaming AI responses
- Better syntax highlighting
- Source management from VS Code

### v0.3.0 (Future)
- Code actions and quick fixes
- Workspace-wide semantic search
- Real-time collaboration
- Custom keyboard shortcuts

## Contributing

We welcome contributions! See the [main repository](https://github.com/lfnovo/open-notebook) for contribution guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/lfnovo/open-notebook
cd open-notebook/vscode-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Launch Extension Development Host
# Press F5 in VS Code
```

## Support

- 💬 [Discord Community](https://discord.gg/37XJPXfz2w)
- 🐛 [GitHub Issues](https://github.com/lfnovo/open-notebook/issues)
- 📧 [Contact](mailto:luis@lfnovo.com)
- 📖 [Documentation](https://www.open-notebook.ai)

## License

MIT License - see [LICENSE](../../LICENSE)

---

**Ready to supercharge your development workflow?** Install the extension and start using AI-powered research in VS Code! 🚀
