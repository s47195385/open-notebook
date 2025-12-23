import * as vscode from 'vscode';
import { notebooksApi } from '../api/notebooks';
import { chatApi } from '../api/chat';
import { ConfigManager } from '../services/configManager';
import { ContextManager } from '../services/contextManager';

/**
 * Commands for chat interactions
 */
export function registerChatCommands(
  context: vscode.ExtensionContext,
  configManager: ConfigManager,
  contextManager: ContextManager
): void {
  
  // Open chat panel command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.chat', async () => {
      // This will be implemented when we create the chat panel webview
      vscode.window.showInformationMessage('Chat panel not yet implemented');
    })
  );

  // Ask about selection command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.askSelection', async () => {
      const selectionContext = await contextManager.getSelectionContext();
      
      if (!selectionContext) {
        vscode.window.showWarningMessage('No text selected');
        return;
      }

      const question = await vscode.window.showInputBox({
        prompt: 'What would you like to know about this code?',
        placeHolder: 'e.g., What does this function do?',
      });

      if (!question) {
        return;
      }

      try {
        // Get or create a default notebook
        const defaultNotebookId = configManager.getDefaultNotebook();
        let notebookId = defaultNotebookId;

        if (!notebookId) {
          // Try to get the first notebook
          const notebooks = await notebooksApi.list();
          if (notebooks.length === 0) {
            const result = await vscode.window.showWarningMessage(
              'No notebooks found. Create one first.',
              'Create Notebook'
            );
            if (result === 'Create Notebook') {
              await vscode.commands.executeCommand('openNotebook.newNotebook');
            }
            return;
          }
          notebookId = notebooks[0].id;
        }

        // Create or get a chat session
        const sessions = await chatApi.listSessions(notebookId);
        let sessionId: string;

        if (sessions.length === 0) {
          const session = await chatApi.createSession({
            notebook_id: notebookId,
            name: 'VS Code Chat',
          });
          sessionId = session.id;
        } else {
          sessionId = sessions[0].id;
        }

        // Send the message with context
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Asking Open Notebook...',
            cancellable: false,
          },
          async (progress) => {
            const fullMessage = `${question}\n\nContext:\n${selectionContext}`;
            
            const response = await chatApi.sendMessage({
              session_id: sessionId,
              message: fullMessage,
            });

            // Show the response
            const lastMessage = response.messages[response.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              // Create a new document to show the response
              const doc = await vscode.workspace.openTextDocument({
                content: `Question: ${question}\n\n---\n\n${lastMessage.content}`,
                language: 'markdown',
              });
              await vscode.window.showTextDocument(doc);
            }
          }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to get response: ${message}`);
      }
    })
  );

  // Agent write command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.agentWrite', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      const prompt = await vscode.window.showInputBox({
        prompt: 'What would you like me to write or modify?',
        placeHolder: 'e.g., Add error handling to this function',
      });

      if (!prompt) {
        return;
      }

      try {
        // Get or create a default notebook
        const defaultNotebookId = configManager.getDefaultNotebook();
        let notebookId = defaultNotebookId;

        if (!notebookId) {
          const notebooks = await notebooksApi.list();
          if (notebooks.length === 0) {
            const result = await vscode.window.showWarningMessage(
              'No notebooks found. Create one first.',
              'Create Notebook'
            );
            if (result === 'Create Notebook') {
              await vscode.commands.executeCommand('openNotebook.newNotebook');
            }
            return;
          }
          notebookId = notebooks[0].id;
        }

        // Create or get a chat session
        const sessions = await chatApi.listSessions(notebookId);
        let sessionId: string;

        if (sessions.length === 0) {
          const session = await chatApi.createSession({
            notebook_id: notebookId,
            name: 'VS Code Agent',
          });
          sessionId = session.id;
        } else {
          sessionId = sessions[0].id;
        }

        // Send the message with context
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Writing code with Open Notebook...',
            cancellable: false,
          },
          async (progress) => {
            let fullMessage = `${prompt}\n\nPlease provide only the code, without explanations.`;
            
            if (selectedText) {
              fullMessage += `\n\nCurrent code:\n\`\`\`\n${selectedText}\n\`\`\``;
            }

            const response = await chatApi.sendMessage({
              session_id: sessionId,
              message: fullMessage,
            });

            // Extract code from response and insert
            const lastMessage = response.messages[response.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              let code = lastMessage.content;
              
              // Try to extract code from markdown code blocks
              const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
              const match = code.match(codeBlockRegex);
              if (match) {
                code = match[1];
              }

              // Insert or replace the code
              await editor.edit((editBuilder) => {
                if (selection.isEmpty) {
                  editBuilder.insert(selection.start, code);
                } else {
                  editBuilder.replace(selection, code);
                }
              });

              vscode.window.showInformationMessage('Code generated successfully!');
            }
          }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to generate code: ${message}`);
      }
    })
  );

  // Attach file command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.attachFile', async (uri?: vscode.Uri) => {
      let fileUri = uri;
      
      if (!fileUri) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          fileUri = editor.document.uri;
        }
      }

      if (!fileUri) {
        vscode.window.showWarningMessage('No file to attach');
        return;
      }

      try {
        const context = await contextManager.getFileContext(fileUri);
        // Copy context to clipboard
        await vscode.env.clipboard.writeText(context);
        vscode.window.showInformationMessage('File context copied to clipboard!');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to attach file: ${message}`);
      }
    })
  );

  // Attach folder command
  context.subscriptions.push(
    vscode.commands.registerCommand('openNotebook.attachFolder', async (uri?: vscode.Uri) => {
      if (!uri) {
        vscode.window.showWarningMessage('No folder selected');
        return;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Reading folder contents...',
            cancellable: false,
          },
          async (progress) => {
            const context = await contextManager.getFolderContext(uri!);
            // Copy context to clipboard
            await vscode.env.clipboard.writeText(context);
            vscode.window.showInformationMessage('Folder context copied to clipboard!');
          }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to attach folder: ${message}`);
      }
    })
  );
}
