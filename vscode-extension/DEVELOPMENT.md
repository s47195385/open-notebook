# Open Notebook VS Code Extension - Developer Guide

## Architecture Overview

This VS Code extension integrates Open Notebook's research capabilities directly into your development environment, focusing on local LLM usage (primarily Ollama) without audio/podcast features.

### Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts           # Main entry point
│   ├── api/                   # API client layer (ported from frontend)
│   │   ├── client.ts         # Axios-based API client
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── notebooks.ts      # Notebook API methods
│   │   ├── chat.ts           # Chat API methods
│   │   ├── sources.ts        # Source API methods
│   │   └── settings.ts       # Settings API methods
│   ├── services/              # Core services
│   │   ├── processManager.ts # Docker/Ollama lifecycle management
│   │   ├── configManager.ts  # VS Code configuration management
│   │   └── contextManager.ts # File/folder context extraction
│   ├── commands/              # Command implementations
│   │   ├── lifecycle.ts      # Start/stop/restart services
│   │   ├── chat.ts          # Chat and AI commands
│   │   └── notebook.ts      # Notebook management commands
│   ├── views/                 # Tree view providers
│   │   ├── notebooksView.ts # Notebooks tree view
│   │   ├── sourcesView.ts   # Sources tree view
│   │   └── statusView.ts    # Status tree view
│   └── utils/                 # Utility functions (future)
├── media/                     # Icons and assets
├── dist/                      # Compiled JavaScript
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
└── README.md                 # User documentation
```

## Key Design Decisions

### 1. API Client Reuse

The extension's API layer is **directly ported** from the frontend codebase:
- Same axios configuration
- Same timeout settings (10 minutes for slow LLM operations)
- Compatible type definitions
- Consistent error handling

This ensures:
- ✅ Feature parity with web UI
- ✅ Easier maintenance and updates
- ✅ Shared understanding of API behavior

### 2. Local-First Design

Per requirements:
- ❌ No audio/podcast functionality
- ❌ No online API integrations (OpenAI, etc.)
- ✅ Focus on local Ollama models
- ✅ Privacy-first approach

### 3. Service Management

The `ProcessManager` handles Docker Compose lifecycle:
- Starts/stops containers via `docker compose` commands
- Monitors health with periodic API checks
- Updates status bar in real-time
- Supports auto-start on VS Code launch

### 4. Context Management

The `ContextManager` provides GitHub Copilot-style context features:
- `#file:path/to/file` syntax for single files
- `#folder:path/to/folder` syntax for entire folders
- Automatic context extraction from selections
- Configurable limits for large folders

## Integration with Open Notebook Backend

### API Endpoints Used

```typescript
// Health check
GET /api/health

// Notebooks
GET /api/notebooks
POST /api/notebooks
GET /api/notebooks/:id
PUT /api/notebooks/:id
DELETE /api/notebooks/:id

// Chat
GET /api/chat/sessions?notebook_id=...
POST /api/chat/sessions
GET /api/chat/sessions/:id
POST /api/chat/execute
POST /api/chat/context

// Sources
GET /api/sources?notebook_id=...
GET /api/sources/:id
POST /api/sources
PUT /api/sources/:id
DELETE /api/sources/:id

// Settings
GET /api/settings
PUT /api/settings
```

### Expected Backend Behavior

1. **Health Endpoint**: Should return 200 OK when services are ready
2. **Chat Execute**: Synchronous chat (no streaming in v0.1.0)
3. **Context Building**: Backend handles RAG and embedding lookup
4. **Timeout Tolerance**: Backend should handle 10-minute timeout for LLM ops

## Development Workflow

### Setup

```bash
cd vscode-extension
npm install
npm run compile
```

### Testing

Press `F5` in VS Code to launch Extension Development Host.

### Debugging

1. Set breakpoints in TypeScript files
2. Launch "Run Extension" configuration
3. Extension Host opens with debugger attached
4. Console logs appear in Debug Console

### Building for Release

```bash
npm run vscode:prepublish
npx vsce package
```

This creates a `.vsix` file that can be installed manually or published to the marketplace.

## Configuration

### Required Settings

- `openNotebook.apiUrl`: Backend API URL (default: `http://localhost:5055`)

### Optional Settings

- `openNotebook.dockerComposePath`: Path to docker-compose.yml
- `openNotebook.autoStart`: Auto-start services on VS Code launch
- `openNotebook.defaultNotebook`: Default notebook for chat
- `openNotebook.maxContextFiles`: Max files in folder context (default: 50)

### Environment-Specific Configuration

**Local Development:**
```json
{
  "openNotebook.apiUrl": "http://localhost:5055",
  "openNotebook.dockerComposePath": "/path/to/open-notebook/docker-compose.full.yml"
}
```

**Remote Server:**
```json
{
  "openNotebook.apiUrl": "http://192.168.1.100:5055",
  "openNotebook.dockerComposePath": null
}
```

## Command Reference

### Service Management
- `openNotebook.start` - Start Docker services
- `openNotebook.stop` - Stop Docker services
- `openNotebook.restart` - Restart services
- `openNotebook.checkStatus` - Check service health

### Chat & AI
- `openNotebook.chat` - Open chat panel (future)
- `openNotebook.askSelection` - Ask about selected code
- `openNotebook.agentWrite` - Generate/modify code
- `openNotebook.attachFile` - Attach file context
- `openNotebook.attachFolder` - Attach folder context

### Notebooks
- `openNotebook.newNotebook` - Create new notebook
- `openNotebook.refreshNotebooks` - Refresh notebook list
- `openNotebook.refreshSources` - Refresh source list
- `openNotebook.openSettings` - Open extension settings

## Extension Points

### Tree Views

1. **Notebooks View** (`openNotebook.notebooks`)
   - Lists all non-archived notebooks
   - Click to view details/set as default
   - Refreshes on command

2. **Sources View** (`openNotebook.sources`)
   - Shows sources for default notebook
   - Click to view content
   - Supports web URLs and local files

3. **Status View** (`openNotebook.status`)
   - Real-time service status
   - Configuration overview
   - Auto-refreshes every 30s

### Context Menus

- **Editor context menu**: Ask selection, Agent write, Attach file
- **Explorer context menu**: Attach file/folder

### Status Bar

- Shows service status with icon
- Click to check status
- Updates automatically

## Future Enhancements (v0.2.0+)

### Planned Features

1. **Chat Webview Panel**
   - Inline chat with conversation history
   - Message editing and regeneration
   - Source citations

2. **Streaming Responses**
   - Real-time AI response streaming
   - Cancellable operations
   - Progress indicators

3. **Advanced Context**
   - Workspace-wide semantic search
   - Automatic dependency detection
   - Smart context suggestions

4. **Code Actions**
   - Quick fixes powered by AI
   - Refactoring suggestions
   - Test generation

## Troubleshooting

### Extension Won't Activate

Check:
1. VS Code version >= 1.80.0
2. Extension compiled successfully
3. Check Output panel → Extension Host

### Can't Connect to API

Check:
1. API URL is correct in settings
2. Services are running (`docker ps`)
3. Port 5055 is accessible
4. Firewall isn't blocking connections

### Docker Commands Fail

Check:
1. Docker Compose path is correct
2. Docker daemon is running
3. User has Docker permissions
4. `docker compose` command is available (not `docker-compose`)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) in the main repository.

## License

MIT - see [LICENSE](../LICENSE)
