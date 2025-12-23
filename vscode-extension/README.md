# Open Notebook VS Code Extension

The official VS Code extension for [Open Notebook](https://github.com/lfnovo/open-notebook) - your privacy-focused, AI-powered research assistant integrated directly into your development environment.

## Features

### 🚀 Service Management
- Start, stop, and monitor Open Notebook services directly from VS Code
- Automatic service health monitoring with status bar indicator
- Auto-start services on VS Code launch (configurable)

### 💬 AI-Powered Chat
- **Ask About Selection**: Highlight code and ask questions about it
- **Agent Write Mode**: Generate or modify code using AI
- **Context Attachments**: Attach files or folders to your chat for better context

### 📚 Notebook Management
- View and manage your notebooks directly in the sidebar
- Create new notebooks from the command palette
- Set default notebooks for quick access

### 📄 Source Management
- Browse sources attached to your notebooks
- View source content directly in VS Code
- Quick access to web-based sources

### 🔍 Context-Aware Features
- Automatic file context extraction
- Folder-based context (with configurable limits)
- Support for `#file:path` and `#folder:path` syntax (coming soon)

### 📊 Status Monitoring
- Real-time service status display
- Configuration status overview
- Quick access to settings

## Requirements

- VS Code 1.80.0 or higher
- Docker and Docker Compose (for service management)
- Open Notebook backend services (can be started from the extension)

## Installation

### From VSIX Package
1. Download the latest `.vsix` file from releases
2. Open VS Code
3. Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the "..." menu → "Install from VSIX"
5. Select the downloaded file

### From Source
```bash
cd vscode-extension
npm install
npm run compile
```

Press F5 in VS Code to launch the Extension Development Host.

## Setup

### Initial Configuration

1. **Set API URL** (default: `http://localhost:5055`)
   - Open Settings (Ctrl+, / Cmd+,)
   - Search for "Open Notebook"
   - Set the API URL to your Open Notebook backend

2. **Configure Docker Compose** (optional, for service management)
   - Set the path to your `docker-compose.yml` file
   - This enables starting/stopping services from VS Code

3. **Set Default Notebook** (optional)
   - Create or select a notebook to use as default
   - This is used for quick chat and context operations

### Quick Start

1. Open the Open Notebook sidebar (click the book icon in the Activity Bar)
2. Check the Status view to see if services are running
3. If not running, use Command Palette (Ctrl+Shift+P / Cmd+Shift+P):
   - Run: "Open Notebook: Start Services"
4. Create a notebook if you don't have one:
   - Run: "Open Notebook: Create New Notebook"
5. Start chatting with your code!

## Usage

### Ask About Code
1. Select code in your editor
2. Right-click → "Open Notebook: Ask About Selection"
3. Enter your question
4. View the AI's response in a new document

### Generate Code
1. Position cursor where you want code (or select code to modify)
2. Right-click → "Open Notebook: Agent Write"
3. Describe what you want to write
4. AI-generated code is inserted automatically

### Attach Context
1. Right-click a file in Explorer → "Open Notebook: Attach Current File to Chat"
2. For folders → "Open Notebook: Attach Folder to Chat"
3. Context is copied to clipboard for use in chat

## Commands

All commands are accessible via Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

### Service Management
- `Open Notebook: Start Services` - Start Docker containers
- `Open Notebook: Stop Services` - Stop Docker containers
- `Open Notebook: Restart Services` - Restart all services
- `Open Notebook: Check Service Status` - Check if services are running

### Chat & AI
- `Open Notebook: Open Chat` - Open chat panel (coming soon)
- `Open Notebook: Ask About Selection` - Ask about selected code
- `Open Notebook: Agent Write` - Generate or modify code
- `Open Notebook: Attach Current File to Chat` - Attach file context
- `Open Notebook: Attach Folder to Chat` - Attach folder context

### Notebooks
- `Open Notebook: Create New Notebook` - Create a new research notebook
- `Open Notebook: Refresh Notebooks` - Refresh notebook list
- `Open Notebook: Refresh Sources` - Refresh source list

### Configuration
- `Open Notebook: Open Settings` - Open extension settings

## Extension Settings

This extension contributes the following settings:

* `openNotebook.apiUrl`: Open Notebook API URL (default: `http://localhost:5055`)
* `openNotebook.dockerComposePath`: Path to docker-compose.yml file (optional)
* `openNotebook.autoStart`: Automatically start services when VS Code starts (default: `false`)
* `openNotebook.ollamaPath`: Path to Ollama executable (optional)
* `openNotebook.defaultNotebook`: Default notebook ID for chat sessions
* `openNotebook.autoAttachWorkspaceContext`: Automatically attach workspace context (default: `false`)
* `openNotebook.maxContextFiles`: Maximum number of files to include in folder context (default: `50`)

## Known Issues

- Chat webview panel is not yet implemented (coming soon)
- Streaming responses not yet supported
- Audio/podcast features intentionally excluded (focus on local LLM use)

## Roadmap

### Coming Soon
- [ ] Inline chat panel with conversation history
- [ ] Streaming AI responses
- [ ] Better syntax highlighting for AI responses
- [ ] Notebook source management from VS Code
- [ ] Real-time collaboration features

### Future Plans
- [ ] Code suggestions as you type
- [ ] Integration with VS Code's native AI features
- [ ] Custom keyboard shortcuts
- [ ] Workspace-wide semantic search

## Privacy & Local-First

This extension is designed for **privacy-conscious developers**:
- ✅ Works entirely with local Ollama models (no API keys required)
- ✅ All data stays on your machine
- ✅ No telemetry or data collection
- ✅ Open source and auditable

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/lfnovo/open-notebook) for contribution guidelines.

## Support

- 💬 [Discord Community](https://discord.gg/37XJPXfz2w)
- 🐛 [GitHub Issues](https://github.com/lfnovo/open-notebook/issues)
- 📧 [Contact](mailto:luis@lfnovo.com)

## License

MIT License - see the [LICENSE](../LICENSE) file for details.

## Credits

Built with ❤️ for the Open Notebook project by the community.

---

**Enjoy researching with Open Notebook!** 📚✨
