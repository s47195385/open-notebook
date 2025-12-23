import * as vscode from 'vscode';
import { notebooksApi } from '../api/notebooks';
import { Notebook } from '../api/types';

/**
 * Tree item for notebooks
 */
class NotebookTreeItem extends vscode.TreeItem {
  constructor(
    public readonly notebook: Notebook,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(notebook.name, collapsibleState);
    
    this.tooltip = notebook.description || notebook.name;
    this.description = notebook.archived ? '(archived)' : '';
    this.contextValue = 'notebook';
    this.iconPath = new vscode.ThemeIcon('book');
    
    // Add command to open notebook details
    this.command = {
      command: 'openNotebook.openNotebookDetails',
      title: 'Open Notebook',
      arguments: [notebook],
    };
  }
}

/**
 * Tree data provider for notebooks
 */
export class NotebooksTreeDataProvider implements vscode.TreeDataProvider<NotebookTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<NotebookTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor() {}

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item
   */
  getTreeItem(element: NotebookTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children (notebooks)
   */
  async getChildren(element?: NotebookTreeItem): Promise<NotebookTreeItem[]> {
    if (element) {
      // No children for individual notebooks in this simple view
      return [];
    }

    try {
      // Get all non-archived notebooks
      const notebooks = await notebooksApi.list({ archived: false });
      
      return notebooks.map(
        (notebook) => new NotebookTreeItem(notebook, vscode.TreeItemCollapsibleState.None)
      );
    } catch (error) {
      vscode.window.showErrorMessage('Failed to load notebooks. Make sure services are running.');
      return [];
    }
  }
}

/**
 * Register notebooks tree view
 */
export function registerNotebooksTreeView(context: vscode.ExtensionContext): NotebooksTreeDataProvider {
  const treeDataProvider = new NotebooksTreeDataProvider();
  
  const treeView = vscode.window.createTreeView('openNotebook.notebooks', {
    treeDataProvider,
    showCollapseAll: false,
  });

  context.subscriptions.push(treeView);

  // Register refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.refreshNotebooks', () => {
      treeDataProvider.refresh();
    })
  );

  // Register command to open notebook details
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.openNotebookDetails', async (notebook: Notebook) => {
      const config = vscode.workspace.getConfiguration('openNotebook');
      const apiUrl = config.get('apiUrl') || 'http://localhost:5055';
      
      // Show quick pick with notebook actions
      const action = await vscode.window.showQuickPick(
        [
          'Set as Default',
          'View in Browser',
          'Copy ID',
          'Archive',
        ],
        {
          placeHolder: `Notebook: ${notebook.name}`,
        }
      );

      switch (action) {
        case 'Set as Default':
          await config.update('defaultNotebook', notebook.id, vscode.ConfigurationTarget.Global);
          vscode.window.showInformationMessage(`Set "${notebook.name}" as default notebook`);
          break;
        case 'View in Browser':
          // Open in browser (assuming frontend runs on port 8502)
          const frontendUrl = apiUrl.replace('5055', '8502');
          vscode.env.openExternal(vscode.Uri.parse(`${frontendUrl}/notebooks/${notebook.id}`));
          break;
        case 'Copy ID':
          await vscode.env.clipboard.writeText(notebook.id);
          vscode.window.showInformationMessage('Notebook ID copied to clipboard');
          break;
        case 'Archive':
          try {
            await notebooksApi.update(notebook.id, { archived: true });
            vscode.window.showInformationMessage(`Notebook "${notebook.name}" archived`);
            treeDataProvider.refresh();
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to archive notebook: ${message}`);
          }
          break;
      }
    })
  );

  return treeDataProvider;
}
