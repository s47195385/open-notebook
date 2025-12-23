# VS Code Extension Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VS Code Window                            │
│                                                                  │
│  ┌───────────────────┐  ┌──────────────────────────────────┐   │
│  │  Activity Bar     │  │  Editor Area                     │   │
│  │  ┌─────────────┐  │  │                                  │   │
│  │  │ 📚 Open     │  │  │  ┌───────────────────────────┐  │   │
│  │  │  Notebook   │  │  │  │  Code Editor              │  │   │
│  │  │             │  │  │  │                           │  │   │
│  │  │  Notebooks  │  │  │  │  Right-click menu:        │  │   │
│  │  │  Sources    │  │  │  │  - Ask About Selection    │  │   │
│  │  │  Status     │  │  │  │  - Agent Write            │  │   │
│  │  └─────────────┘  │  │  │  - Attach File            │  │   │
│  └───────────────────┘  │  └───────────────────────────┘  │   │
│                         │                                  │   │
│  Status Bar:            │  Command Palette (Ctrl+Shift+P)  │   │
│  [✓ Open Notebook]      │  • Start/Stop Services          │   │
│                         │  • Create Notebook              │   │
└─────────────────────────│  • All Commands...              │   │
                          └──────────────────────────────────┘   │
                                                                  │
└──────────────────────────────────────────────────────────────┘
```

## Extension Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     VS Code Extension                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    extension.ts                           │   │
│  │                   (Entry Point)                           │   │
│  └────────────┬─────────────────────────┬───────────────────┘   │
│               │                         │                        │
│  ┌────────────▼─────────┐  ┌───────────▼─────────────┐         │
│  │      Commands         │  │        Views             │         │
│  │                       │  │                          │         │
│  │  • lifecycle.ts       │  │  • notebooksView.ts     │         │
│  │  • chat.ts            │  │  • sourcesView.ts       │         │
│  │  • notebook.ts        │  │  • statusView.ts        │         │
│  └───────────┬───────────┘  └──────────────────────────┘         │
│              │                                                   │
│  ┌───────────▼──────────────────────────────────────────────┐   │
│  │                      Services                             │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌────────────┐  ┌────────────────┐   │   │
│  │  │ Process      │  │ Config     │  │ Context        │   │   │
│  │  │ Manager      │  │ Manager    │  │ Manager        │   │   │
│  │  │              │  │            │  │                │   │   │
│  │  │ • Start/Stop │  │ • Settings │  │ • File context │   │   │
│  │  │ • Health     │  │ • Wizard   │  │ • Folder scan  │   │   │
│  │  │ • Status     │  │ • Validate │  │ • Selection    │   │   │
│  │  └──────────────┘  └────────────┘  └────────────────┘   │   │
│  └──────────────────────────┬────────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐   │
│  │                      API Layer                             │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │   │
│  │  │ client.ts│  │notebooks │  │  chat.ts │  │sources  │  │   │
│  │  │          │  │   .ts    │  │          │  │  .ts    │  │   │
│  │  │ • Axios  │  │          │  │          │  │         │  │   │
│  │  │ • Auth   │  │ • CRUD   │  │ • Send   │  │ • CRUD  │  │   │
│  │  │ • Errors │  │ • List   │  │ • Build  │  │ • List  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │   │
│  └────────────────────────┬──────────────────────────────────┘   │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Open Notebook Backend                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              FastAPI (Python)                          │     │
│  │              Port 5055                                 │     │
│  │                                                        │     │
│  │  Endpoints:                                           │     │
│  │  • GET  /api/health                                  │     │
│  │  • GET  /api/notebooks                               │     │
│  │  • POST /api/chat/execute                            │     │
│  │  • POST /api/chat/context                            │     │
│  │  • GET  /api/sources                                 │     │
│  └────────────────────┬──────────────────────────────────┘     │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────┐      │
│  │              SurrealDB                                │      │
│  │              Port 8000                                │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Ollama (Local LLM)                      │      │
│  │              Port 11434                              │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: Ask About Selection

```
User selects code → Right-click → "Ask About Selection"
    ↓
extension.ts → chat.ts command
    ↓
1. contextManager.getSelectionContext()
   → Extracts code with file info
    ↓
2. User enters question via input box
    ↓
3. notebooksApi.list()
   → Gets available notebooks
    ↓
4. chatApi.createSession()
   → Creates chat session
    ↓
5. chatApi.sendMessage()
   → Sends question + context
    ↓
6. Backend processes with Ollama
    ↓
7. Response displayed in new document
```

### Example 2: Agent Write

```
User positions cursor → Right-click → "Agent Write"
    ↓
extension.ts → chat.ts command
    ↓
1. User enters prompt via input box
    ↓
2. contextManager.getSelectionContext()
   → Gets selected code (if any)
    ↓
3. chatApi.sendMessage()
   → Sends prompt + code context
    ↓
4. Backend processes with Ollama
    ↓
5. Extract code from response
    ↓
6. Insert code at cursor position
```

### Example 3: Start Services

```
User executes "Start Services" command
    ↓
extension.ts → lifecycle.ts command
    ↓
1. configManager.getDockerComposePath()
   → Gets docker-compose.yml location
    ↓
2. processManager.startDocker()
   → Executes: docker compose up -d
    ↓
3. processManager.waitForHealthy()
   → Polls /api/health endpoint
    ↓
4. processManager.updateStatusBar()
   → Updates UI to show "✓ Running"
    ↓
5. processManager.startHealthCheckMonitoring()
   → Sets up 30-second health checks
```

## Component Responsibilities

### Commands Layer
- **Purpose**: Handle user actions from command palette and context menus
- **Responsibilities**: 
  - Input validation
  - Progress indicators
  - Error handling
  - User feedback
- **Files**: lifecycle.ts, chat.ts, notebook.ts

### Services Layer
- **Purpose**: Business logic and state management
- **Responsibilities**:
  - Service lifecycle management
  - Configuration management
  - Context extraction and parsing
  - Health monitoring
- **Files**: processManager.ts, configManager.ts, contextManager.ts

### API Layer
- **Purpose**: Communication with backend
- **Responsibilities**:
  - HTTP requests
  - Authentication
  - Error handling
  - Type safety
- **Files**: client.ts, types.ts, notebooks.ts, chat.ts, sources.ts, settings.ts

### Views Layer
- **Purpose**: UI components in sidebar
- **Responsibilities**:
  - Tree data providers
  - Item rendering
  - User interactions
  - Auto-refresh
- **Files**: notebooksView.ts, sourcesView.ts, statusView.ts

## Configuration Flow

```
User opens Settings (Ctrl+,)
    ↓
Searches for "Open Notebook"
    ↓
Modifies settings:
  • apiUrl
  • dockerComposePath
  • autoStart
  • defaultNotebook
  • maxContextFiles
    ↓
configManager detects change
    ↓
Updates internal state
    ↓
Notifies dependent components:
  • apiClient.updateBaseURL()
  • processManager updates
  • Views refresh
```

## Error Handling Strategy

```
Error occurs in any layer
    ↓
Caught by try-catch
    ↓
Logged to console
    ↓
User-friendly message shown:
  • vscode.window.showErrorMessage()
  • Include recovery suggestions
  • Provide actionable next steps
    ↓
Error doesn't crash extension
```

## Key Design Patterns

### Singleton Pattern
- **ApiClient**: Single instance shared across extension
- **Managers**: Single instance of each service

### Observer Pattern
- **Configuration Changes**: Components listen for config updates
- **Health Checks**: Periodic status updates trigger UI refresh

### Command Pattern
- **All Commands**: Registered in extension.ts
- **Consistent Structure**: Input → Process → Output → Feedback

### Provider Pattern
- **Tree Views**: DataProvider pattern for sidebar trees
- **Refresh**: On-demand and automatic updates

## Extension Lifecycle

```
1. Activation
   ↓
   extension.ts activate()
   ↓
   Initialize services:
   • ProcessManager
   • ConfigManager
   • ContextManager
   ↓
   Register commands
   ↓
   Register tree views
   ↓
   Check initial status
   ↓
   Show welcome message

2. Running
   ↓
   User interacts with:
   • Commands
   • Tree views
   • Status bar
   ↓
   Services handle requests
   ↓
   API calls to backend
   ↓
   Results displayed to user

3. Deactivation
   ↓
   extension.ts deactivate()
   ↓
   Cleanup resources:
   • Stop health checks
   • Dispose status bar
   • Clear intervals
```

## Summary

The extension follows a **layered architecture**:

1. **UI Layer**: Commands + Views
2. **Business Logic Layer**: Services
3. **Data Access Layer**: API Client
4. **External Systems**: Backend + Docker

Key benefits:
- ✅ Separation of concerns
- ✅ Easy to test
- ✅ Easy to maintain
- ✅ Easy to extend
- ✅ Type-safe throughout
