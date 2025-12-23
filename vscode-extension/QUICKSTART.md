# Quick Start Guide - VS Code Extension

## Get Started in 5 Minutes! 🚀

This guide will get you up and running with the Open Notebook VS Code extension.

## Prerequisites

Before starting, make sure you have:
- ✅ VS Code 1.80.0 or higher
- ✅ Docker and Docker Compose installed
- ✅ Open Notebook backend (can be started from extension)
- ✅ Node.js and npm installed

## Step 1: Install the Extension

### Option A: From Source (Development)

```bash
# Navigate to the extension directory
cd vscode-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile
```

Then press **F5** in VS Code to launch the Extension Development Host.

### Option B: From VSIX (Distribution)

```bash
# Package the extension
npm run vscode:prepublish
npx vsce package

# This creates: open-notebook-0.1.0.vsix
```

Then in VS Code:
1. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
2. Click "..." menu → "Install from VSIX..."
3. Select the `.vsix` file

## Step 2: Configure the Extension

1. Open VS Code Settings (Ctrl+, / Cmd+,)
2. Search for "Open Notebook"
3. Set the following:

```json
{
  "openNotebook.apiUrl": "http://localhost:5055",
  "openNotebook.dockerComposePath": "/path/to/your/docker-compose.yml"
}
```

**For local development:**
```json
{
  "openNotebook.apiUrl": "http://localhost:5055",
  "openNotebook.dockerComposePath": "/path/to/open-notebook/docker-compose.full.yml",
  "openNotebook.autoStart": true
}
```

**For remote server:**
```json
{
  "openNotebook.apiUrl": "http://192.168.1.100:5055"
}
```

## Step 3: Start the Services

### If Docker Compose is configured:

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type: "Open Notebook: Start Services"
3. Press Enter
4. Wait for services to start (status bar shows progress)

### If services are already running:

The extension will detect them automatically. Check the status bar for the ✓ indicator.

## Step 4: Create Your First Notebook

1. Open Command Palette (Ctrl+Shift+P)
2. Type: "Open Notebook: Create New Notebook"
3. Enter a name (e.g., "My Research Project")
4. Optionally add a description
5. Choose "Yes" to set as default notebook

## Step 5: Try the Features!

### Ask About Code

1. **Select some code** in your editor
2. **Right-click** → "Open Notebook: Ask About Selection"
3. **Enter a question** (e.g., "What does this function do?")
4. **View the AI's response** in a new document

### Generate Code

1. **Position your cursor** where you want code
2. **Right-click** → "Open Notebook: Agent Write"
3. **Describe what you want** (e.g., "Create a function to validate email addresses")
4. **AI-generated code** is inserted automatically

### Attach Context

1. **Right-click a file** in Explorer → "Open Notebook: Attach Current File to Chat"
2. **Context is copied** to clipboard
3. **Paste into chat** or other tools

## Step 6: Explore the Sidebar

Click the **Open Notebook icon** (📚) in the Activity Bar to see:

### Notebooks View
- Lists all your notebooks
- Click to view details
- Create new notebooks
- Set default notebook

### Sources View
- Shows sources for default notebook
- Click to view content
- Quick access to web sources

### Status View
- Real-time service status
- Configuration overview
- Auto-refreshes every 30 seconds

## Common Tasks

### Start Services
```
Ctrl+Shift+P → "Open Notebook: Start Services"
```

### Stop Services
```
Ctrl+Shift+P → "Open Notebook: Stop Services"
```

### Check Status
```
Click status bar item (✓ Open Notebook)
```

### Ask AI Question
```
1. Select code
2. Right-click → "Ask About Selection"
3. Enter question
```

### Generate Code
```
1. Position cursor
2. Right-click → "Agent Write"  
3. Describe what you want
```

### Create Notebook
```
Ctrl+Shift+P → "Open Notebook: Create New Notebook"
```

## Keyboard Shortcuts (Optional)

You can add custom shortcuts:

1. Open Keyboard Shortcuts (Ctrl+K Ctrl+S)
2. Search for "Open Notebook"
3. Add your preferred shortcuts

**Suggested:**
- Ask Selection: `Ctrl+Alt+A` / `Cmd+Alt+A`
- Agent Write: `Ctrl+Alt+W` / `Cmd+Alt+W`
- Start Services: `Ctrl+Alt+S` / `Cmd+Alt+S`

## Troubleshooting

### Extension won't activate
- Check VS Code version (must be 1.80.0+)
- Check Output panel → Extension Host for errors

### Can't connect to API
```bash
# Check if services are running
docker ps

# Check if API is accessible
curl http://localhost:5055/api/health

# Start services if needed
docker compose up -d
```

### Docker commands fail
- Check Docker Compose path in settings
- Verify Docker daemon is running: `docker version`
- Make sure you have permissions: `docker ps`

### "No notebooks found" error
1. Make sure services are running
2. Create a notebook via command palette
3. Set it as default in settings

## Tips & Tricks

### Use Context Wisely
- Attach relevant files for better AI responses
- Use folder context for project-wide questions
- Be mindful of the maxContextFiles limit (default: 50)

### Organize with Notebooks
- Create separate notebooks for different projects
- Set a default notebook for quick access
- Archive old notebooks to keep things tidy

### Monitor Service Health
- Watch the status bar for real-time updates
- Click to check detailed status
- Enable auto-start for convenience

### Experiment with AI
- Try different question phrasings
- Use Agent Write for code generation
- Review and refine AI responses

## Next Steps

Now that you're set up:

1. **Read the full documentation**: Check README.md for detailed features
2. **Explore architecture**: See ARCHITECTURE.md for system design
3. **Join the community**: [Discord](https://discord.gg/37XJPXfz2w)
4. **Report issues**: [GitHub Issues](https://github.com/lfnovo/open-notebook/issues)

## Resources

- 📖 **README.md** - Complete user guide
- 🏗️ **ARCHITECTURE.md** - System design and diagrams
- 🔧 **DEVELOPMENT.md** - Developer guide
- 📝 **CHANGELOG.md** - Version history
- 📚 **docs/features/vscode-extension.md** - Detailed features

## Support

Need help?
- 💬 [Discord Community](https://discord.gg/37XJPXfz2w)
- 🐛 [GitHub Issues](https://github.com/lfnovo/open-notebook/issues)
- 📧 [Email Support](mailto:luis@lfnovo.com)

---

**You're all set!** Start using Open Notebook in VS Code and supercharge your development workflow! 🎉
