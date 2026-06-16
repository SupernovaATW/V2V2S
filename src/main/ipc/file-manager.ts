import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import { IPC } from '../../shared/ipc-channels';
import { listFiles, deleteFile, openFolder } from '../services/file-manager.service';

export function registerFileManagerHandlers(): void {
  ipcMain.handle(IPC.FILES_LIST, async (_event, dirPath: string, filter?: string) => {
    return listFiles(dirPath, filter);
  });

  ipcMain.handle(IPC.FILES_DELETE, async (_event, filePath: string) => {
    return { success: deleteFile(filePath) };
  });

  ipcMain.handle(IPC.FILES_OPEN_FOLDER, async (_event, filePath: string) => {
    openFolder(filePath);
    return { success: true };
  });

  ipcMain.handle(IPC.FILES_WRITE, async (_event, filePath: string, content: string) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle(IPC.FILES_READ, async (_event, filePath: string) => {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch {
      return null;
    }
  });

  ipcMain.handle(IPC.DIALOG_OPEN, async (event, options: any) => {
    const win = BrowserWindow.fromWebContents(event.sender) || BrowserWindow.getFocusedWindow();
    if (!win) return { cancelled: true, filePaths: [] };
    return dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: options?.filters || [
        { name: 'Media Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'wav', 'mp3', 'm4a', 'flac', 'ogg'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
  });

  ipcMain.handle(IPC.DIALOG_SAVE, async (event, options: any) => {
    const win = BrowserWindow.fromWebContents(event.sender) || BrowserWindow.getFocusedWindow();
    if (!win) return { cancelled: true, filePath: '' };
    return dialog.showSaveDialog(win, {
      filters: options?.filters || [
        { name: 'JSON', extensions: ['json'] },
        { name: 'SRT Subtitles', extensions: ['srt'] },
      ],
    });
  });

  ipcMain.handle(IPC.DIALOG_OPEN_DIR, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || BrowserWindow.getFocusedWindow();
    if (!win) return { cancelled: true, filePaths: [] };
    return dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });
  });
}
