import * as vscode from 'vscode';
import { ProcessManager } from '../services/processManager';

/**
 * Tree item for status information
 */
class StatusTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly status: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    
    this.description = status;
    this.contextValue = 'status';
    
    // Set icon based on status
    if (status.includes('Running') || status.includes('OK')) {
      this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
    } else if (status.includes('Stopped') || status.includes('Not')) {
      this.iconPath = new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('charts.red'));
    } else {
      this.iconPath = new vscode.ThemeIcon('question', new vscode.ThemeColor('charts.yellow'));
    }
  }
}

/**
 * Tree data provider for status
 */
export class StatusTreeDataProvider implements vscode.TreeDataProvider<StatusTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<StatusTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private processManager: ProcessManager) {
    // Auto-refresh every 30 seconds
    setInterval(() => this.refresh(), 30000);
  }

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item
   */
  getTreeItem(element: StatusTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children (status items)
   */
  async getChildren(element?: StatusTreeItem): Promise<StatusTreeItem[]> {
    if (element) {
      // No children for status items
      return [];
    }

    const items: StatusTreeItem[] = [];

    // Check API status
    const isRunning = await this.processManager.checkStatus();
    items.push(
      new StatusTreeItem(
        'API Server',
        isRunning ? 'Running' : 'Not Running',
        vscode.TreeItemCollapsibleState.None
      )
    );

    // Add configuration info
    const config = vscode.workspace.getConfiguration('openNotebook');
    const apiUrl = config.get<string>('apiUrl') || 'http://localhost:5055';
    
    items.push(
      new StatusTreeItem(
        'API URL',
        apiUrl,
        vscode.TreeItemCollapsibleState.None
      )
    );

    const dockerComposePath = config.get<string>('dockerComposePath');
    items.push(
      new StatusTreeItem(
        'Docker Compose',
        dockerComposePath ? 'Configured' : 'Not Configured',
        vscode.TreeItemCollapsibleState.None
      )
    );

    const defaultNotebook = config.get<string>('defaultNotebook');
    items.push(
      new StatusTreeItem(
        'Default Notebook',
        defaultNotebook ? 'Set' : 'Not Set',
        vscode.TreeItemCollapsibleState.None
      )
    );

    return items;
  }
}

/**
 * Register status tree view
 */
export function registerStatusTreeView(
  context: vscode.ExtensionContext,
  processManager: ProcessManager
): StatusTreeDataProvider {
  const treeDataProvider = new StatusTreeDataProvider(processManager);
  
  const treeView = vscode.window.createTreeView('openNotebook.status', {
    treeDataProvider,
    showCollapseAll: false,
  });

  context.subscriptions.push(treeView);

  return treeDataProvider;
}
