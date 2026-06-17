import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import fs from 'fs';
import { getSystemTheme, onThemeChange } from './utils/theme';
import { registerAudioExtractionHandlers } from './ipc/audio-extraction';
import { registerTranscriptionHandlers } from './ipc/transcription';
import { registerModelManagerHandlers } from './ipc/model-manager';
import { registerQueueHandlers } from './ipc/queue-manager';
import { registerFileManagerHandlers } from './ipc/file-manager';
import { IPC } from '../shared/ipc-channels';
import { ipcMain } from 'electron';

let mainWindow: BrowserWindow | null = null;

function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

function createWindow(): void {
  // Resolve preload path - try multiple locations
  let preloadPath = path.join(__dirname, '..', 'preload', 'index.js');
  if (!fs.existsSync(preloadPath)) {
    preloadPath = path.join(__dirname, 'preload', 'index.js');
  }
  if (!fs.existsSync(preloadPath)) {
    preloadPath = path.join(__dirname, '..', '..', '.vite', 'preload', 'index.js');
  }
  console.log('Preload path:', preloadPath, 'exists:', fs.existsSync(preloadPath));

  // Resolve icon path
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'logo.png')
    : path.join(app.getAppPath(), 'assets', 'logo.png');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: iconPath,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#181715' : '#faf9f5',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: nativeTheme.shouldUseDarkColors ? '#1f1e1b' : '#f0efe9',
      symbolColor: nativeTheme.shouldUseDarkColors ? '#faf9f5' : '#1a1815',
      height: 40,
    },
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the renderer
  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL === 'string') {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '..', 'renderer', 'main_window', 'index.html'),
    );
  }
}

// Handle theme changes
function setupTheme(): void {
  ipcMain.handle(IPC.APP_GET_THEME, () => {
    return getSystemTheme();
  });

  onThemeChange((theme) => {
    if (mainWindow) {
      mainWindow.webContents.send(IPC.APP_THEME_CHANGED, theme);
    }
  });

  // Only updates title bar overlay WITHOUT locking theme
  ipcMain.handle('app:update-titlebar', (_event, theme: string) => {
    if (mainWindow) {
      updateTitleBarOverlay(mainWindow, theme as 'light' | 'dark');
    }
  });

  // Manual toggle: locks the theme
  ipcMain.handle('app:set-theme', (_event, theme: string) => {
    if (mainWindow) {
      nativeTheme.themeSource = theme as 'light' | 'dark' | 'system';
      updateTitleBarOverlay(mainWindow, theme as 'light' | 'dark');
    }
  });
}

function updateTitleBarOverlay(win: BrowserWindow, theme: string): void {
  const isDark = theme === 'dark';
  win.setTitleBarOverlay({
    color: isDark ? '#1f1e1b' : '#f0efe9',
    symbolColor: isDark ? '#faf9f5' : '#1a1815',
    height: 40,
  });
}

function setupWindowControls(): void {
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('window:close', () => mainWindow?.close());
}

app.whenReady().then(() => {
  // Register all IPC handlers
  registerAudioExtractionHandlers(getMainWindow);
  registerTranscriptionHandlers(getMainWindow);
  registerModelManagerHandlers(getMainWindow);
  registerQueueHandlers(getMainWindow);
  registerFileManagerHandlers();
  setupTheme();
  setupWindowControls();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Declare the Vite dev server URL type
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
