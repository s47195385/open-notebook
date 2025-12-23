import * as vscode from 'vscode';

/**
 * Manages VS Code extension configuration
 */
export class ConfigManager {
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration('openNotebook');
    
    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('openNotebook')) {
        this.config = vscode.workspace.getConfiguration('openNotebook');
        this.onConfigChanged();
      }
    });
  }

  /**
   * Get API URL
   */
  getApiUrl(): string {
    return this.config.get('apiUrl') || 'http://localhost:5055';
  }

  /**
   * Get Docker Compose path
   */
  getDockerComposePath(): string | undefined {
    return this.config.get('dockerComposePath');
  }

  /**
   * Get auto-start setting
   */
  getAutoStart(): boolean {
    return this.config.get('autoStart') || false;
  }

  /**
   * Get Ollama path
   */
  getOllamaPath(): string | undefined {
    return this.config.get('ollamaPath');
  }

  /**
   * Get default notebook ID
   */
  getDefaultNotebook(): string | undefined {
    return this.config.get('defaultNotebook');
  }

  /**
   * Set default notebook ID
   */
  async setDefaultNotebook(notebookId: string): Promise<void> {
    await this.config.update('defaultNotebook', notebookId, vscode.ConfigurationTarget.Global);
  }

  /**
   * Get auto-attach workspace context setting
   */
  getAutoAttachWorkspaceContext(): boolean {
    return this.config.get('autoAttachWorkspaceContext') || false;
  }

  /**
   * Get max context files setting
   */
  getMaxContextFiles(): number {
    return this.config.get('maxContextFiles') || 50;
  }

  /**
   * Update API URL
   */
  async updateApiUrl(url: string): Promise<void> {
    await this.config.update('apiUrl', url, vscode.ConfigurationTarget.Global);
  }

  /**
   * Update Docker Compose path
   */
  async updateDockerComposePath(path: string): Promise<void> {
    await this.config.update('dockerComposePath', path, vscode.ConfigurationTarget.Global);
  }

  /**
   * Handle configuration changes
   */
  private onConfigChanged(): void {
    // Notify other components that config has changed
    // This could trigger API client updates, etc.
    console.log('Open Notebook configuration changed');
  }

  /**
   * Validate configuration
   */
  async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const apiUrl = this.getApiUrl();
    if (!apiUrl) {
      errors.push('API URL is not configured');
    }

    const dockerComposePath = this.getDockerComposePath();
    if (dockerComposePath) {
      const fs = require('fs');
      if (!fs.existsSync(dockerComposePath)) {
        errors.push(`Docker Compose file not found: ${dockerComposePath}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Show configuration wizard
   */
  async showConfigWizard(): Promise<void> {
    const apiUrl = await vscode.window.showInputBox({
      prompt: 'Enter Open Notebook API URL',
      value: this.getApiUrl(),
      placeHolder: 'http://localhost:5055',
    });

    if (apiUrl) {
      await this.updateApiUrl(apiUrl);
    }

    const dockerComposePath = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'YAML files': ['yml', 'yaml'],
      },
      title: 'Select docker-compose.yml file',
    });

    if (dockerComposePath && dockerComposePath[0]) {
      await this.updateDockerComposePath(dockerComposePath[0].fsPath);
    }
  }
}
