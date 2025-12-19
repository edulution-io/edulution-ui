/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import BaseTool from './base.tool';

interface FileItem {
  filename: string; // ← RICHTIG
  type: 'FILE' | 'DIRECTORY';
  filePath?: string;
  etag?: string;
  size?: number;
  lastModified?: string;
}

@Injectable()
class FilesharingTool extends BaseTool {
  private formatFileItem(item: FileItem): string {
    const icon = item.type === 'DIRECTORY' ? '📁' : '📄';
    const size = item.size ? ` (${this.formatSize(item.size)})` : '';
    return `${icon} ${item.filename}${size}`;
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ==========================================
  // LIST TOOLS
  // ==========================================

  @Tool({
    name: 'files_list',
    description: 'Lists all files and directories. Call ONCE to see contents.',
    parameters: z.object({
      path: z.string().optional().describe('Path to list. Empty = user home directory.'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async listAll(params: { path?: string; share?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedPath = this.resolveFilePath(params.path);
      const share = params.share || 'Home';

      const [filesResult, dirsResult] = await Promise.all([
        this.callApi<FileItem[]>('/filesharing', {
          params: { path: resolvedPath, share, type: 'FILE' },
        }).catch(() => [] as FileItem[]),
        this.callApi<FileItem[]>('/filesharing', {
          params: { path: resolvedPath, share, type: 'DIRECTORY' },
        }).catch(() => [] as FileItem[]),
      ]);

      const files = filesResult || [];
      const dirs = dirsResult || [];

      if (files.length === 0 && dirs.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `User: ${this.username} (${this.userRole}) | Path: ${resolvedPath}\n\nDirectory is empty.`,
            },
          ],
        };
      }

      let output = `User: ${this.username} (${this.userRole}) | Path: ${resolvedPath}\n\n`;
      if (dirs.length > 0) {
        output += `Directories (${dirs.length}):\n${dirs.map((d) => this.formatFileItem(d)).join('\n')}\n\n`;
      }
      if (files.length > 0) {
        output += `Files (${files.length}):\n${files.map((f) => this.formatFileItem(f)).join('\n')}`;
      }

      return {
        content: [{ type: 'text', text: output }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error listing: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'files_list_files',
    description: 'Lists only FILES (no folders). Call ONCE to see contents.',
    parameters: z.object({
      path: z.string().optional().describe('Path to list. Empty = user home directory.'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async listFilesOnly(params: { path?: string; share?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedPath = this.resolveFilePath(params.path);
      const share = params.share || 'Home';

      const result = await this.callApi<FileItem[]>('/filesharing', {
        params: { path: resolvedPath, share, type: 'FILE' },
      });

      if (!result || result.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `User: ${this.username} (${this.userRole}) | Path: ${resolvedPath}\n\nNo files found.`,
            },
          ],
        };
      }

      let output = `User: ${this.username} (${this.userRole}) | Path: ${resolvedPath}\n\n`;
      output += `Files (${result.length}):\n${result.map((f) => this.formatFileItem(f)).join('\n')}`;

      return {
        content: [{ type: 'text', text: output }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error listing files: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'files_list_folders',
    description: 'Lists only FOLDERS (no files). Call ONCE to see contents.',
    parameters: z.object({
      path: z.string().optional().describe('Path to list. Empty = user home directory.'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async listFoldersOnly(params: { path?: string; share?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedPath = this.resolveFilePath(params.path);
      const share = params.share || 'Home';

      const result = await this.callApi<FileItem[]>('/filesharing', {
        params: { path: resolvedPath, share, type: 'DIRECTORY' },
      });

      if (!result || result.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `User: ${this.username} (${this.userRole}) | Path: ${resolvedPath}\n\nNo folders found.`,
            },
          ],
        };
      }

      let output = `User: ${this.username} (${this.userRole}) | Path: ${resolvedPath}\n\n`;
      output += `Directories (${result.length}):\n${result.map((d) => this.formatFileItem(d)).join('\n')}`;

      return {
        content: [{ type: 'text', text: output }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error listing folders: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  // ==========================================
  // CREATE TOOLS
  // ==========================================

  @Tool({
    name: 'files_create_folder',
    description: 'Create a new folder. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('Name of the new folder'),
      path: z.string().optional().describe('Parent path. Empty = user home directory.'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async createFolder(params: { name: string; path?: string; share?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedPath = this.resolveFilePath(params.path);
      const share = params.share || 'Home';

      await this.callApi('/filesharing', {
        method: 'POST',
        params: { path: resolvedPath, share },
        data: { newPath: params.name },
      });

      // Verifizierung mit type=DIRECTORY
      let verified = false;
      try {
        const folders = await this.callApi<FileItem[]>('/filesharing', {
          params: { path: resolvedPath, share, type: 'DIRECTORY' },
        });
        verified = folders?.some((f) => f.filename === params.name) ?? false;
      } catch {
        // Verification failed, but POST succeeded
      }

      return {
        content: [
          {
            type: 'text',
            text: `${verified ? 'CREATED & VERIFIED' : 'CREATED'}: Folder "${params.name}" in ${resolvedPath}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create folder: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'files_create_file',
    description: 'Create a new file with optional text content. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('Filename including extension (e.g., "notes.txt", "report.md")'),
      path: z.string().optional().describe('Parent path. Empty = user home directory.'),
      content: z.string().optional().describe('Text content for the file (empty = empty file)'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async createFile(params: { name: string; path?: string; content?: string; share?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedPath = this.resolveFilePath(params.path);
      const share = params.share || 'Home';

      await this.callApiRaw('/filesharing/upload', params.content ?? '', {
        path: resolvedPath,
        name: params.name,
        contentLength: params.content?.length ?? 0,
        share,
      });

      // Verifizierung mit type=FILE
      let verified = false;
      try {
        const files = await this.callApi<FileItem[]>('/filesharing', {
          params: { path: resolvedPath, share, type: 'FILE' },
        });
        verified = files?.some((f) => f.filename === params.name) ?? false;
      } catch {
        // Verification failed, but POST succeeded
      }

      const sizeInfo = params.content ? ` (${params.content.length} chars)` : ' (empty)';

      return {
        content: [
          {
            type: 'text',
            text: `${verified ? 'CREATED & VERIFIED' : 'CREATED'}: File "${params.name}" in ${resolvedPath}${sizeInfo}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create file: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  // ==========================================
  // DELETE TOOLS
  // ==========================================

  @Tool({
    name: 'files_delete_file',
    description: 'Delete a FILE. Use files_list_files FIRST to see exact filename. Call ONLY ONCE!',
    parameters: z.object({
      name: z.string().describe('Exact name of the file to delete'),
      path: z.string().optional().describe('Directory containing the file. Empty = user home.'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async deleteFile(params: { name: string; path?: string; share?: string }) {
    return this.deleteInternal(params.name, params.path, params.share, 'FILE');
  }

  @Tool({
    name: 'files_delete_folder',
    description: 'Delete a FOLDER. Use files_list_folders FIRST to see exact folder name. Call ONLY ONCE!',
    parameters: z.object({
      name: z.string().describe('Exact name of the folder to delete'),
      path: z.string().optional().describe('Directory containing the folder. Empty = user home.'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async deleteFolder(params: { name: string; path?: string; share?: string }) {
    return this.deleteInternal(params.name, params.path, params.share, 'DIRECTORY');
  }

  private async deleteInternal(name: string, path?: string, share?: string, type: 'FILE' | 'DIRECTORY' = 'FILE') {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedPath = this.resolveFilePath(path);
      const fullPath = `${resolvedPath}${name}`.replace(/\/+/g, '/');
      const shareValue = share || 'Home';
      const typeLabel = type === 'DIRECTORY' ? 'Folder' : 'File';

      // ZUERST: Prüfen ob existiert (mit type!)
      let existsBefore = false;
      try {
        const itemsBefore = await this.callApi<FileItem[]>('/filesharing', {
          params: { path: resolvedPath, share: shareValue, type },
        });
        existsBefore = itemsBefore?.some((f) => f.filename === name) ?? false;
      } catch {
        // Wenn Prüfung fehlschlägt, trotzdem versuchen
        existsBefore = true;
      }

      if (!existsBefore) {
        return {
          content: [
            {
              type: 'text',
              text: `${typeLabel} "${name}" does not exist in ${resolvedPath}\n\nNothing to delete.`,
            },
          ],
        };
      }

      // DELETE ausführen
      await this.callApi('/filesharing', {
        method: 'DELETE',
        params: { target: 'fileServer', share: shareValue },
        data: { paths: [fullPath] },
      });

      // Verifizierung (mit type!)
      let stillExists = false;
      try {
        const itemsAfter = await this.callApi<FileItem[]>('/filesharing', {
          params: { path: resolvedPath, share: shareValue, type },
        });
        stillExists = itemsAfter?.some((f) => f.filename === name) ?? false;
      } catch {
        // Verification failed, assuming success
      }

      if (!stillExists) {
        return {
          content: [
            {
              type: 'text',
              text: `DELETED: ${typeLabel} "${name}" from ${resolvedPath}\n\nDeletion complete. Do NOT call again.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `DELETE sent for "${name}" but verification unclear.\n\nDo NOT retry automatically.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `FAILED to delete "${name}": ${(error as Error).message}\n\nDo NOT retry.`,
          },
        ],
        isError: true,
      };
    }
  }

  // ==========================================
  // RENAME TOOLS
  // ==========================================

  @Tool({
    name: 'files_rename_file',
    description: 'Rename a FILE. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      oldName: z.string().describe('Current name of the file'),
      newName: z.string().describe('New name for the file'),
      path: z.string().optional().describe('Directory containing the file. Empty = user home.'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async renameFile(params: { oldName: string; newName: string; path?: string; share?: string }) {
    return this.renameInternal(params.oldName, params.newName, params.path, params.share, 'FILE');
  }

  @Tool({
    name: 'files_rename_folder',
    description: 'Rename a FOLDER. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      oldName: z.string().describe('Current name of the folder'),
      newName: z.string().describe('New name for the folder'),
      path: z.string().optional().describe('Directory containing the folder. Empty = user home.'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async renameFolder(params: { oldName: string; newName: string; path?: string; share?: string }) {
    return this.renameInternal(params.oldName, params.newName, params.path, params.share, 'DIRECTORY');
  }

  private async renameInternal(
    oldName: string,
    newName: string,
    path?: string,
    share?: string,
    type: 'FILE' | 'DIRECTORY' = 'FILE',
  ) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedPath = this.resolveFilePath(path);
      const shareValue = share || 'Home';
      const typeLabel = type === 'DIRECTORY' ? 'Folder' : 'File';

      const oldPath = `${resolvedPath}${oldName}`.replace(/\/+/g, '/');
      const newPath = `${resolvedPath}${newName}`.replace(/\/+/g, '/');

      await this.callApi('/filesharing', {
        method: 'PATCH',
        params: { share: shareValue },
        data: [{ path: oldPath, newPath }],
      });

      return {
        content: [
          {
            type: 'text',
            text: `RENAMED: ${typeLabel} "${oldName}" → "${newName}" in ${resolvedPath}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to rename: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  // ==========================================
  // MOVE TOOLS
  // ==========================================

  @Tool({
    name: 'files_move_file',
    description: 'Move a FILE to a different location. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('Name of the file to move'),
      fromPath: z.string().optional().describe('Current directory. Empty = user home.'),
      toPath: z.string().describe('Destination directory'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async moveFile(params: { name: string; fromPath?: string; toPath: string; share?: string }) {
    return this.moveInternal(params.name, params.fromPath, params.toPath, params.share, 'FILE');
  }

  @Tool({
    name: 'files_move_folder',
    description: 'Move a FOLDER to a different location. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('Name of the folder to move'),
      fromPath: z.string().optional().describe('Current directory. Empty = user home.'),
      toPath: z.string().describe('Destination directory'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async moveFolder(params: { name: string; fromPath?: string; toPath: string; share?: string }) {
    return this.moveInternal(params.name, params.fromPath, params.toPath, params.share, 'DIRECTORY');
  }

  private async moveInternal(
    name: string,
    fromPath?: string,
    toPath?: string,
    share?: string,
    type: 'FILE' | 'DIRECTORY' = 'FILE',
  ) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedFromPath = this.resolveFilePath(fromPath);
      const resolvedToPath = this.resolveFilePath(toPath);
      const shareValue = share || 'Home';
      const typeLabel = type === 'DIRECTORY' ? 'Folder' : 'File';

      const oldFullPath = `${resolvedFromPath}${name}`.replace(/\/+/g, '/');
      const newFullPath = `${resolvedToPath}${name}`.replace(/\/+/g, '/');

      await this.callApi('/filesharing', {
        method: 'PATCH',
        params: { share: shareValue },
        data: [{ path: oldFullPath, newPath: newFullPath }],
      });

      return {
        content: [
          {
            type: 'text',
            text: `MOVED: ${typeLabel} "${name}"\nFrom: ${resolvedFromPath}\nTo: ${resolvedToPath}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to move: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  // ==========================================
  // COPY TOOLS
  // ==========================================

  @Tool({
    name: 'files_copy_file',
    description: 'Copy a FILE to a new location. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('Name of the file to copy'),
      fromPath: z.string().optional().describe('Source directory. Empty = user home.'),
      toPath: z.string().describe('Destination directory'),
      newName: z.string().optional().describe('New name for the copy (optional, defaults to same name)'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async copyFile(params: { name: string; fromPath?: string; toPath: string; newName?: string; share?: string }) {
    return this.copyInternal(params.name, params.fromPath, params.toPath, params.newName, params.share, 'FILE');
  }

  @Tool({
    name: 'files_copy_folder',
    description: 'Copy a FOLDER to a new location. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('Name of the folder to copy'),
      fromPath: z.string().optional().describe('Source directory. Empty = user home.'),
      toPath: z.string().describe('Destination directory'),
      newName: z.string().optional().describe('New name for the copy (optional, defaults to same name)'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async copyFolder(params: { name: string; fromPath?: string; toPath: string; newName?: string; share?: string }) {
    return this.copyInternal(params.name, params.fromPath, params.toPath, params.newName, params.share, 'DIRECTORY');
  }

  private async copyInternal(
    name: string,
    fromPath?: string,
    toPath?: string,
    newName?: string,
    share?: string,
    type: 'FILE' | 'DIRECTORY' = 'FILE',
  ) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedFromPath = this.resolveFilePath(fromPath);
      const resolvedToPath = this.resolveFilePath(toPath);
      const shareValue = share || 'Home';
      const typeLabel = type === 'DIRECTORY' ? 'Folder' : 'File';
      const targetName = newName || name;

      const sourcePath = `${resolvedFromPath}${name}`.replace(/\/+/g, '/');
      const destPath = `${resolvedToPath}${targetName}`.replace(/\/+/g, '/');

      await this.callApi('/filesharing/copy', {
        method: 'POST',
        params: { share: shareValue },
        data: [{ path: sourcePath, newPath: destPath }],
      });

      return {
        content: [
          {
            type: 'text',
            text: `COPIED: ${typeLabel} "${name}"${newName ? ` as "${newName}"` : ''}\nFrom: ${resolvedFromPath}\nTo: ${resolvedToPath}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to copy: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  // ==========================================
  // DUPLICATE TOOL
  // ==========================================

  @Tool({
    name: 'files_duplicate',
    description: 'Duplicate a file in the same directory. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('Name of the file to duplicate'),
      path: z.string().optional().describe('Directory containing the file. Empty = user home.'),
      newName: z.string().describe('Name for the duplicate'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async duplicateFile(params: { name: string; path?: string; newName: string; share?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedPath = this.resolveFilePath(params.path);
      const shareValue = params.share || 'Home';

      const sourcePath = `${resolvedPath}${params.name}`.replace(/\/+/g, '/');
      const destinationPath = `${resolvedPath}${params.newName}`.replace(/\/+/g, '/');

      await this.callApi('/filesharing/duplicate', {
        method: 'POST',
        params: { share: shareValue },
        data: { sourcePath, destinationPath },
      });

      return {
        content: [
          {
            type: 'text',
            text: `DUPLICATED: "${params.name}" → "${params.newName}" in ${resolvedPath}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to duplicate: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  // ==========================================
  // DOWNLOAD LINK TOOL
  // ==========================================

  @Tool({
    name: 'files_get_download_link',
    description: 'Get a download link for a file',
    parameters: z.object({
      name: z.string().describe('Name of the file'),
      path: z.string().optional().describe('Directory containing the file. Empty = user home.'),
      share: z.string().optional().default('Home').describe('WebDAV share name (default: Home)'),
    }),
  })
  async getDownloadLink(params: { name: string; path?: string; share?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const resolvedPath = this.resolveFilePath(params.path);
      const filePath = `${resolvedPath}${params.name}`.replace(/\/+/g, '/');

      const result = await this.callApi<{ url?: string; downloadUrl?: string }>('/filesharing/file-location', {
        params: {
          filePath,
          fileName: params.name,
          share: params.share || 'Home',
        },
      });

      const downloadUrl = result.url || result.downloadUrl;
      if (downloadUrl) {
        return {
          content: [{ type: 'text', text: `Download link for "${params.name}":\n${downloadUrl}` }],
        };
      }

      return {
        content: [{ type: 'text', text: `Download info: ${JSON.stringify(result)}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  // ==========================================
  // PUBLIC SHARE TOOLS
  // ==========================================

  @Tool({
    name: 'files_public_shares_list',
    description: 'List all public shares created by the current user',
    parameters: z.object({}),
  })
  async listPublicShares() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      interface PublicShare {
        publicShareId: string;
        filename: string;
        filePath: string;
        expires: string;
        scope?: string;
      }

      const result = await this.callApi<PublicShare[]>('/filesharing/public-shares');

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No public shares found.' }],
        };
      }

      const formatted = result
        .map((s) => `- ${s.filename} (ID: ${s.publicShareId})\n  Path: ${s.filePath}\n  Expires: ${s.expires}`)
        .join('\n\n');

      return {
        content: [{ type: 'text', text: `Found ${result.length} public share(s):\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'files_public_share_create',
    description: 'Create a public share link for a file or folder. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      filePath: z.string().describe('Path to the file or folder to share'),
      filename: z.string().describe('Name of the file or folder'),
      etag: z.string().describe('ETag of the file for versioning'),
      share: z.string().describe('The WebDAV share name'),
      expires: z.string().describe('Expiration date in ISO format'),
      password: z.string().optional().describe('Optional password protection'),
      scope: z.enum(['PUBLIC', 'RESTRICTED']).optional().describe('Share scope'),
      invitedAttendees: z.array(z.string()).optional().describe('List of invited user IDs'),
      invitedGroups: z.array(z.string()).optional().describe('List of invited group IDs'),
    }),
  })
  async createPublicShare(params: {
    filePath: string;
    filename: string;
    etag: string;
    share: string;
    expires: string;
    password?: string;
    scope?: 'PUBLIC' | 'RESTRICTED';
    invitedAttendees?: string[];
    invitedGroups?: string[];
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      interface PublicShareResult {
        publicShareId: string;
        url?: string;
        shareUrl?: string;
      }

      const result = await this.callApi<PublicShareResult>('/filesharing/public-shares', {
        method: 'POST',
        data: params,
      });

      const shareUrl = result.url || result.shareUrl || '';
      return {
        content: [
          {
            type: 'text',
            text: `CREATED: Public share for "${params.filename}"\nShare ID: ${result.publicShareId}\nExpires: ${params.expires}${shareUrl ? `\nURL: ${shareUrl}` : ''}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: 'text', text: `FAILED to create public share: ${(error as Error).message}\n\nDo NOT retry.` },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'files_public_share_delete',
    description: 'Delete public shares. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      shares: z
        .array(
          z.object({
            publicShareId: z.string().describe('ID of the public share'),
          }),
        )
        .describe('Array of public shares to delete'),
    }),
  })
  async deletePublicShares(params: { shares: { publicShareId: string }[] }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      await this.callApi('/filesharing/public-shares', {
        method: 'DELETE',
        data: params.shares,
      });

      const deletedIds = params.shares.map((s) => s.publicShareId).join(', ');
      return {
        content: [
          {
            type: 'text',
            text: `DELETED: ${params.shares.length} public share(s)\nIDs: ${deletedIds}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: 'text', text: `FAILED to delete public shares: ${(error as Error).message}\n\nDo NOT retry.` },
        ],
        isError: true,
      };
    }
  }
}

export default FilesharingTool;
