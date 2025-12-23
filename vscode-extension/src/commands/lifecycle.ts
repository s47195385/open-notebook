import * as vscode from 'vscode';
import { ProcessManager } from '../services/processManager';

/**
 * Commands for managing service lifecycle
 */
export function registerLifecycleCommands(
  context: vscode.ExtensionContext,
  processManager: ProcessManager
): void {
  
  // Start services command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.start', async () => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Starting Open Notebook services...',
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 });
            await processManager.startServices();
            progress.report({ increment: 100 });
          }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to start services: ${message}`);
      }
    })
  );

  // Stop services command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.stop', async () => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Stopping Open Notebook services...',
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 });
            await processManager.stopServices();
            progress.report({ increment: 100 });
          }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to stop services: ${message}`);
      }
    })
  );

  // Restart services command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.restart', async () => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Restarting Open Notebook services...',
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0, message: 'Stopping...' });
            await processManager.stopServices();
            
            progress.report({ increment: 50, message: 'Starting...' });
            await new Promise(resolve => setTimeout(resolve, 2000));
            await processManager.startServices();
            
            progress.report({ increment: 100 });
          }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to restart services: ${message}`);
      }
    })
  );

  // Check status command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.checkStatus', async () => {
      const isRunning = await processManager.checkStatus();
      
      if (isRunning) {
        vscode.window.showInformationMessage('Open Notebook services are running');
      } else {
        const result = await vscode.window.showWarningMessage(
          'Open Notebook services are not running',
          'Start Services'
        );
        
        if (result === 'Start Services') {
          await vscode.commands.executeCommand('openNotebook.start');
        }
      }
    })
  );
}
