import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipc-channels';

const electronAPI = {
  // Audio Extraction
  extractAudio: (args: { filePaths: string[]; outputDir?: string; autoTranscribe?: boolean; transcribeModelId?: string; transcribeLanguage?: string }) =>
    ipcRenderer.invoke(IPC.AUDIO_EXTRACT_START, args),

  // Transcription
  transcribe: (args: { audioPath: string; modelId: string; language?: string; outputDir?: string }) =>
    ipcRenderer.invoke(IPC.TRANSCRIBE_START, args),

  // Video to Subtitles (one-step)
  videoToSub: (args: { filePaths: string[]; modelId: string; language?: string; outputDir?: string }) =>
    ipcRenderer.invoke(IPC.VIDEO_TO_SUB_START, args),

  // Model Management
  getModels: () => ipcRenderer.invoke(IPC.MODELS_LIST),
  downloadModel: (modelId: string) => ipcRenderer.invoke(IPC.MODELS_DOWNLOAD, modelId),
  cancelDownload: (modelId: string) => ipcRenderer.invoke(IPC.MODELS_CANCEL_DOWNLOAD, modelId),

  // Task Queue
  getQueueState: () => ipcRenderer.invoke(IPC.QUEUE_GET_STATE),
  addQueueTask: (task: any) => ipcRenderer.invoke(IPC.QUEUE_ADD_TASK, task),
  removeQueueTask: (taskId: string) => ipcRenderer.invoke(IPC.QUEUE_REMOVE_TASK, taskId),
  pauseQueue: () => ipcRenderer.invoke(IPC.QUEUE_PAUSE),
  resumeQueue: () => ipcRenderer.invoke(IPC.QUEUE_RESUME),
  retryQueueTask: (taskId: string) => ipcRenderer.invoke(IPC.QUEUE_RETRY_TASK, taskId),

  // File Management
  listFiles: (dirPath: string, filter?: string) => ipcRenderer.invoke(IPC.FILES_LIST, dirPath, filter),
  deleteFile: (filePath: string) => ipcRenderer.invoke(IPC.FILES_DELETE, filePath),
  openFolder: (filePath: string) => ipcRenderer.invoke(IPC.FILES_OPEN_FOLDER, filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke(IPC.FILES_WRITE, filePath, content),
  readFile: (filePath: string) => ipcRenderer.invoke(IPC.FILES_READ, filePath),

  // Dialogs
  openFileDialog: (options?: any) => ipcRenderer.invoke(IPC.DIALOG_OPEN, options),
  saveFileDialog: (options?: any) => ipcRenderer.invoke(IPC.DIALOG_SAVE, options),
  openDirDialog: () => ipcRenderer.invoke(IPC.DIALOG_OPEN_DIR),

  // App
  getTheme: () => ipcRenderer.invoke(IPC.APP_GET_THEME),
  setTheme: (theme: string) => ipcRenderer.invoke('app:set-theme', theme),
  updateTitleBar: (theme: string) => ipcRenderer.invoke('app:update-titlebar', theme),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Event listeners
  onQueueStateChanged: (cb: (state: any) => void) => {
    const handler = (_event: any, state: any) => cb(state);
    ipcRenderer.on(IPC.QUEUE_STATE_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC.QUEUE_STATE_CHANGED, handler);
  },
  onQueueTaskProgress: (cb: (progress: any) => void) => {
    const handler = (_event: any, progress: any) => cb(progress);
    ipcRenderer.on(IPC.QUEUE_TASK_PROGRESS, handler);
    return () => ipcRenderer.removeListener(IPC.QUEUE_TASK_PROGRESS, handler);
  },
  onThemeChanged: (cb: (theme: string) => void) => {
    const handler = (_event: any, theme: string) => cb(theme);
    ipcRenderer.on(IPC.APP_THEME_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC.APP_THEME_CHANGED, handler);
  },
  onModelDownloadProgress: (cb: (progress: any) => void) => {
    const handler = (_event: any, progress: any) => cb(progress);
    ipcRenderer.on(IPC.MODELS_DOWNLOAD_PROGRESS, handler);
    return () => ipcRenderer.removeListener(IPC.MODELS_DOWNLOAD_PROGRESS, handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
