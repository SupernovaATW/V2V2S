import type { ElectronAPI } from '../../preload/index';

function createNoopAPI(): ElectronAPI {
  const noop = () => Promise.resolve(null as any);
  const api: any = {
    extractAudio: noop, transcribe: noop, videoToSub: noop,
    getModels: () => Promise.resolve([]),
    downloadModel: noop, cancelDownload: noop,
    getQueueState: () => Promise.resolve({ tasks: [], paused: false, maxConcurrency: 1 }),
    addQueueTask: noop, removeQueueTask: noop,
    pauseQueue: noop, resumeQueue: noop, retryQueueTask: noop,
    listFiles: () => Promise.resolve([]),
    deleteFile: noop, openFolder: noop, writeFile: noop, readFile: noop,
    minimizeWindow: noop, maximizeWindow: noop, closeWindow: noop,
    openFileDialog: () => Promise.resolve({ cancelled: true, filePaths: [] }),
    saveFileDialog: () => Promise.resolve({ cancelled: true, filePath: '' }),
    openDirDialog: () => Promise.resolve({ cancelled: true, filePaths: [] }),
    getTheme: () => Promise.resolve('dark'),
    setTheme: noop,
    updateTitleBar: noop,
    onQueueStateChanged: () => () => {},
    onQueueTaskProgress: () => () => {},
    onThemeChanged: () => () => {},
    onModelDownloadProgress: () => () => {},
  };
  return api;
}

export const api: ElectronAPI = (window as any).electronAPI || createNoopAPI();
