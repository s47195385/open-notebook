import * as vscode from 'vscode';
import { notebooksApi } from '../api/notebooks';
import { ConfigManager } from '../services/configManager';

/**
 * Commands for notebook operations
 */
export function registerNotebookCommands(
  context: vscode.ExtensionContext,
  configManager: ConfigManager
): void {
  
  // Create new notebook command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.newNotebook', async () => {
      const name = await vscode.window.showInputBox({
        prompt: 'Enter notebook name',
        placeHolder: 'My Research Project',
      });

      if (!name) {
        return;
      }

      const description = await vscode.window.showInputBox({
        prompt: 'Enter notebook description (optional)',
        placeHolder: 'Description of your research...',
      });

      try {
        const notebook = await notebooksApi.create({
          name,
          description: description || undefined,
        });

        vscode.window.showInformationMessage(`Notebook "${name}" created successfully!`);

        // Ask if user wants to set as default
        const setDefault = await vscode.window.showQuickPick(['Yes', 'No'], {
          placeHolder: 'Set as default notebook?',
        });

        if (setDefault === 'Yes') {
          await configManager.setDefaultNotebook(notebook.id);
        }

        // Refresh notebooks view
        await vscode.commands.executeCommand('openNotebook.refreshNotebooks');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to create notebook: ${message}`);
      }
    })
  );

  // Refresh notebooks command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.refreshNotebooks', async () => {
      // This will trigger the tree view to refresh
      // The actual refresh will be handled by the tree data provider
      vscode.commands.executeCommand('workbench.actions.treeView.openNotebook.notebooks.refresh');
    })
  );

  // Refresh sources command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.refreshSources', async () => {
      // This will trigger the tree view to refresh
      vscode.commands.executeCommand('workbench.actions.treeView.openNotebook.sources.refresh');
    })
  );

  // Open settings command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.openSettings', async () => {
      await vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'openNotebook'
      );
    })
  );
}
