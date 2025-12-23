import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigManager } from './configManager';

/**
 * Manages file and folder context for chat
 * Supports #file and #folder syntax like GitHub Copilot
 */
export class ContextManager {
  constructor(private configManager: ConfigManager) {}

  /**
   * Get content of a single file
   */
  async getFileContext(uri: vscode.Uri): Promise<string> {
    try {
      const document = await vscode.workspace.openTextDocument(uri);
      const fileName = path.basename(uri.fsPath);
      const relativePath = vscode.workspace.asRelativePath(uri);
      
      return `\`\`\`${fileName}\nFile: ${relativePath}\n\n${document.getText()}\n\`\`\``;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read file ${uri.fsPath}: ${message}`);
    }
  }

  /**
   * Get content of all files in a folder
   */
  async getFolderContext(uri: vscode.Uri): Promise<string> {
    const maxFiles = this.configManager.getMaxContextFiles();
    
    try {
      // Find all files in the folder, excluding common ignore patterns
      const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(uri, '**/*'),
        new vscode.RelativePattern(uri, '{**/node_modules/**,**/.git/**,**/dist/**,**/build/**,**/.next/**,**/__pycache__/**,**/*.pyc}')
      );

      if (files.length === 0) {
        return `Folder: ${vscode.workspace.asRelativePath(uri)}\n(No files found)`;
      }

      if (files.length > maxFiles) {
        const proceed = await vscode.window.showWarningMessage(
          `Folder contains ${files.length} files. Only the first ${maxFiles} will be included. Continue?`,
          'Yes', 'No'
        );
        
        if (proceed !== 'Yes') {
          throw new Error('User cancelled folder context attachment');
        }
      }

      const filesToInclude = files.slice(0, maxFiles);
      const contexts = await Promise.all(
        filesToInclude.map(file => this.getFileContext(file))
      );

      const folderPath = vscode.workspace.asRelativePath(uri);
      return `Folder: ${folderPath}\n(${filesToInclude.length} of ${files.length} files)\n\n${contexts.join('\n\n')}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read folder ${uri.fsPath}: ${message}`);
    }
  }

  /**
   * Get context of currently active file
   */
  async getCurrentFileContext(): Promise<string | null> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }

    return this.getFileContext(editor.document.uri);
  }

  /**
   * Get selected text from active editor
   */
  getSelectedText(): string | null {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      return null;
    }

    return editor.document.getText(editor.selection);
  }

  /**
   * Get context for selected text with file info
   */
  async getSelectionContext(): Promise<string | null> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      return null;
    }

    const selection = editor.document.getText(editor.selection);
    const fileName = path.basename(editor.document.uri.fsPath);
    const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
    const startLine = editor.selection.start.line + 1;
    const endLine = editor.selection.end.line + 1;

    return `\`\`\`${fileName}\nFile: ${relativePath}\nLines: ${startLine}-${endLine}\n\n${selection}\n\`\`\``;
  }

  /**
   * Parse #file:path and #folder:path references from message
   */
  parseContextReferences(message: string): {
    files: string[];
    folders: string[];
    cleanedMessage: string;
  } {
    const fileRegex = /#file:([^\s]+)/g;
    const folderRegex = /#folder:([^\s]+)/g;
    
    const files: string[] = [];
    const folders: string[] = [];

    let match;
    
    // Extract file references
    while ((match = fileRegex.exec(message)) !== null) {
      files.push(match[1]);
    }
    
    // Extract folder references
    while ((match = folderRegex.exec(message)) !== null) {
      folders.push(match[1]);
    }

    // Remove the references from the message
    const cleanedMessage = message
      .replace(fileRegex, '')
      .replace(folderRegex, '')
      .trim();

    return { files, folders, cleanedMessage };
  }

  /**
   * Resolve context references and build context string
   */
  async resolveContextReferences(message: string): Promise<{
    context: string;
    cleanedMessage: string;
  }> {
    const { files, folders, cleanedMessage } = this.parseContextReferences(message);
    const contexts: string[] = [];

    // Resolve file references
    for (const filePath of files) {
      try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          continue;
        }

        const uri = vscode.Uri.joinPath(workspaceFolder.uri, filePath);
        const context = await this.getFileContext(uri);
        contexts.push(context);
      } catch (error) {
        vscode.window.showWarningMessage(`Could not read file: ${filePath}`);
      }
    }

    // Resolve folder references
    for (const folderPath of folders) {
      try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          continue;
        }

        const uri = vscode.Uri.joinPath(workspaceFolder.uri, folderPath);
        const context = await this.getFolderContext(uri);
        contexts.push(context);
      } catch (error) {
        vscode.window.showWarningMessage(`Could not read folder: ${folderPath}`);
      }
    }

    return {
      context: contexts.join('\n\n'),
      cleanedMessage,
    };
  }

  /**
   * Get workspace context (all workspace files, limited)
   */
  async getWorkspaceContext(): Promise<string> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return '';
    }

    return this.getFolderContext(workspaceFolder.uri);
  }
}
