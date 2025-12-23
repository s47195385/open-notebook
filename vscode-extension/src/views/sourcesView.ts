import * as vscode from 'vscode';
import { sourcesApi } from '../api/sources';
import { Source } from '../api/types';
import { ConfigManager } from '../services/configManager';

/**
 * Tree item for sources
 */
class SourceTreeItem extends vscode.TreeItem {
  constructor(
    public readonly source: Source,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(source.title, collapsibleState);
    
    this.tooltip = `Type: ${source.source_type}`;
    this.description = source.source_type;
    this.contextValue = 'source';
    
    // Set icon based on source type
    switch (source.source_type.toLowerCase()) {
      case 'pdf':
        this.iconPath = new vscode.ThemeIcon('file-pdf');
        break;
      case 'text':
      case 'markdown':
        this.iconPath = new vscode.ThemeIcon('file-text');
        break;
      case 'url':
      case 'web':
        this.iconPath = new vscode.ThemeIcon('globe');
        break;
      default:
        this.iconPath = new vscode.ThemeIcon('file');
    }
  }
}

/**
 * Tree data provider for sources
 */
export class SourcesTreeDataProvider implements vscode.TreeDataProvider<SourceTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SourceTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private configManager: ConfigManager) {}

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item
   */
  getTreeItem(element: SourceTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children (sources)
   */
  async getChildren(element?: SourceTreeItem): Promise<SourceTreeItem[]> {
    if (element) {
      // No children for individual sources
      return [];
    }

    try {
      // Get default notebook
      const defaultNotebookId = this.configManager.getDefaultNotebook();
      
      if (!defaultNotebookId) {
        return [];
      }

      // Get sources for the default notebook
      const sources = await sourcesApi.list(defaultNotebookId);
      
      return sources.map(
        (source) => new SourceTreeItem(source, vscode.TreeItemCollapsibleState.None)
      );
    } catch (error) {
      return [];
    }
  }
}

/**
 * Register sources tree view
 */
export function registerSourcesTreeView(
  context: vscode.ExtensionContext,
  configManager: ConfigManager
): SourcesTreeDataProvider {
  const treeDataProvider = new SourcesTreeDataProvider(configManager);
  
  const treeView = vscode.window.createTreeView('openNotebook.sources', {
    treeDataProvider,
    showCollapseAll: false,
  });

  context.subscriptions.push(treeView);

  // Register refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.refreshSources', () => {
      treeDataProvider.refresh();
    })
  );

  // Register command to view source
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.viewSource', async (source: Source) => {
      // Show source content in a new document
      if (source.content) {
        const doc = await vscode.workspace.openTextDocument({
          content: source.content,
          language: source.source_type === 'markdown' ? 'markdown' : 'text',
        });
        await vscode.window.showTextDocument(doc);
      } else if (source.url) {
        vscode.env.openExternal(vscode.Uri.parse(source.url));
      } else {
        vscode.window.showInformationMessage('No content available for this source');
      }
    })
  );

  return treeDataProvider;
}
