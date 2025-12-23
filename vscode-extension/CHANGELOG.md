# Change Log

All notable changes to the "open-notebook" VS Code extension will be documented in this file.

## [0.1.0] - Initial Release

### Added
- **Service Management**
  - Start/stop/restart Open Notebook Docker services
  - Automatic health monitoring with status bar indicator
  - Auto-start option on VS Code launch
  
- **Chat & AI Features**
  - "Ask About Selection" - Query AI about selected code
  - "Agent Write" - Generate or modify code with AI assistance
  - File and folder context attachment
  
- **Notebook Management**
  - View notebooks in sidebar tree view
  - Create new notebooks from command palette
  - Set default notebook for quick access
  - Archive notebooks
  
- **Source Management**
  - Browse sources in sidebar tree view
  - View source content directly in VS Code
  - Quick access to web-based sources
  
- **Status Monitoring**
  - Real-time service status display
  - Configuration status overview
  - Auto-refresh status checks
  
- **Configuration**
  - API URL configuration
  - Docker Compose path configuration
  - Default notebook selection
  - Max context files limit
  - Auto-start services option

### Known Limitations
- Chat webview panel not yet implemented (planned for v0.2.0)
- No streaming responses yet (planned for v0.2.0)
- Audio/podcast features intentionally excluded (local LLM focus)

## [Unreleased]

### Planned for v0.2.0
- Inline chat panel with conversation history
- Streaming AI responses
- Better syntax highlighting in responses
- Source management from VS Code
- Improved error handling and user feedback
