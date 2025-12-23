import * as vscode from 'vscode';
import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { getApiClient } from '../api/client';

const execAsync = promisify(exec);

/**
 * Manages the lifecycle of Open Notebook services (Docker, Ollama)
 */
export class ProcessManager {
  private dockerProcess: ChildProcess | null = null;
  private ollamaProcess: ChildProcess | null = null;
  private statusBarItem: vscode.StatusBarItem;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = 'openNotebook.checkStatus';
    this.statusBarItem.show();
    this.updateStatusBar('unknown');
  }

  /**
   * Start all services
   */
  async startServices(): Promise<void> {
    const config = vscode.workspace.getConfiguration('openNotebook');
    const dockerComposePath = config.get<string>('dockerComposePath');

    if (!dockerComposePath) {
      const result = await vscode.window.showWarningMessage(
        'Docker Compose path not configured. Would you like to set it now?',
        'Configure',
        'Skip'
      );

      if (result === 'Configure') {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'openNotebook.dockerComposePath');
      }
      return;
    }

    try {
      this.updateStatusBar('starting');
      
      // Start Docker containers
      await this.startDocker(dockerComposePath);
      
      // Wait for services to be healthy
      await this.waitForHealthy();
      
      this.updateStatusBar('running');
      
      vscode.window.showInformationMessage('Open Notebook services started successfully!');
      
      // Start health check monitoring
      this.startHealthCheckMonitoring();
    } catch (error) {
      this.updateStatusBar('error');
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to start services: ${message}`);
      throw error;
    }
  }

  /**
   * Stop all services
   */
  async stopServices(): Promise<void> {
    const config = vscode.workspace.getConfiguration('openNotebook');
    const dockerComposePath = config.get<string>('dockerComposePath');

    if (!dockerComposePath) {
      vscode.window.showWarningMessage('Docker Compose path not configured.');
      return;
    }

    try {
      this.updateStatusBar('stopping');
      
      // Stop health check monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
      
      // Stop Docker containers
      await this.stopDocker(dockerComposePath);
      
      this.updateStatusBar('stopped');
      
      vscode.window.showInformationMessage('Open Notebook services stopped.');
    } catch (error) {
      this.updateStatusBar('error');
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to stop services: ${message}`);
      throw error;
    }
  }

  /**
   * Restart services
   */
  async restartServices(): Promise<void> {
    await this.stopServices();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await this.startServices();
  }

  /**
   * Check if services are running
   */
  async checkStatus(): Promise<boolean> {
    try {
      const isHealthy = await getApiClient().checkHealth();
      this.updateStatusBar(isHealthy ? 'running' : 'stopped');
      return isHealthy;
    } catch (error) {
      this.updateStatusBar('error');
      return false;
    }
  }

  /**
   * Start Docker containers
   */
  private async startDocker(dockerComposePath: string): Promise<void> {
    const composeDir = path.dirname(dockerComposePath);
    const composeFile = path.basename(dockerComposePath);

    try {
      const { stdout, stderr } = await execAsync(
        `docker compose -f ${composeFile} up -d`,
        { cwd: composeDir }
      );

      if (stderr && !stderr.includes('Starting') && !stderr.includes('started')) {
        console.error('Docker compose stderr:', stderr);
      }
      console.log('Docker compose output:', stdout);
    } catch (error) {
      throw new Error(`Failed to start Docker containers: ${error}`);
    }
  }

  /**
   * Stop Docker containers
   */
  private async stopDocker(dockerComposePath: string): Promise<void> {
    const composeDir = path.dirname(dockerComposePath);
    const composeFile = path.basename(dockerComposePath);

    try {
      const { stdout, stderr } = await execAsync(
        `docker compose -f ${composeFile} down`,
        { cwd: composeDir }
      );

      if (stderr && !stderr.includes('Stopping') && !stderr.includes('stopped')) {
        console.error('Docker compose stderr:', stderr);
      }
      console.log('Docker compose output:', stdout);
    } catch (error) {
      throw new Error(`Failed to stop Docker containers: ${error}`);
    }
  }

  /**
   * Wait for services to become healthy
   */
  private async waitForHealthy(maxAttempts: number = 30, delayMs: number = 2000): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const isHealthy = await getApiClient().checkHealth();
        if (isHealthy) {
          return;
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    throw new Error('Services did not become healthy within the expected time.');
  }

  /**
   * Start health check monitoring
   */
  private startHealthCheckMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.checkStatus();
    }, 30000);
  }

  /**
   * Update status bar
   */
  private updateStatusBar(status: 'unknown' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error'): void {
    const statusConfig = {
      unknown: { text: '$(question) Open Notebook', tooltip: 'Status unknown' },
      starting: { text: '$(sync~spin) Open Notebook', tooltip: 'Starting services...' },
      running: { text: '$(check) Open Notebook', tooltip: 'Services running' },
      stopping: { text: '$(sync~spin) Open Notebook', tooltip: 'Stopping services...' },
      stopped: { text: '$(circle-slash) Open Notebook', tooltip: 'Services stopped' },
      error: { text: '$(error) Open Notebook', tooltip: 'Error - check logs' },
    };

    const config = statusConfig[status];
    this.statusBarItem.text = config.text;
    this.statusBarItem.tooltip = config.tooltip;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.statusBarItem.dispose();
  }
}
