import * as vscode from 'vscode';
import { ProcessManager } from './services/processManager';
import { ConfigManager } from './services/configManager';
import { ContextManager } from './services/contextManager';
import { registerLifecycleCommands } from './commands/lifecycle';
import { registerChatCommands } from './commands/chat';
import { registerNotebookCommands } from './commands/notebook';
import { registerNotebooksTreeView } from './views/notebooksView';
import { registerSourcesTreeView } from './views/sourcesView';
import { registerStatusTreeView } from './views/statusView';
import { getApiClient } from './api/client';

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('Open Notebook extension is now active!');

  // Initialize services
  const processManager = new ProcessManager();
  const configManager = new ConfigManager();
  const contextManager = new ContextManager(configManager);

  // Register services for disposal
  context.subscriptions.push(processManager);

  // Register all commands
  registerLifecycleCommands(context, processManager);
  registerChatCommands(context, configManager, contextManager);
  registerNotebookCommands(context, configManager);

  // Register tree views
  const notebooksTreeView = registerNotebooksTreeView(context);
  const sourcesTreeView = registerSourcesTreeView(context, configManager);
  const statusTreeView = registerStatusTreeView(context, processManager);

  // Check initial status
  setTimeout(async () => {
    const isRunning = await processManager.checkStatus();
    
    if (!isRunning) {
      const config = vscode.workspace.getConfiguration('openNotebook');
      const autoStart = config.get<boolean>('autoStart');

      if (autoStart) {
        await vscode.commands.executeCommand('openNotebook.start');
      } else {
        const result = await vscode.window.showInformationMessage(
          'Open Notebook services are not running. Would you like to start them?',
          'Start Now',
          'Configure',
          'Dismiss'
        );

        if (result === 'Start Now') {
          await vscode.commands.executeCommand('openNotebook.start');
        } else if (result === 'Configure') {
          await configManager.showConfigWizard();
        }
      }
    }
  }, 2000);

  // Show welcome message
  vscode.window.showInformationMessage(
    'Open Notebook extension activated! Use the sidebar to get started.'
  );
}

/**
 * Extension deactivation
 */
export function deactivate() {
  console.log('Open Notebook extension is now deactivated');
}
