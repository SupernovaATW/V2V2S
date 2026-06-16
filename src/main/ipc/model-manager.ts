import { ipcMain, BrowserWindow } from 'electron';
import { IPC } from '../../shared/ipc-channels';
import { MODELS } from '../../shared/model-definitions';
import { downloadModel, isModelDownloaded } from '../services/model-download.service';
import { taskQueue } from '../services/task-queue.service';
import type { QueueTask } from '../../shared/types';

export function registerModelManagerHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IPC.MODELS_LIST, async () => {
    return MODELS.map((m) => ({
      ...m,
      downloaded: isModelDownloaded(m.id),
    }));
  });

  // Register download-model queue executor
  taskQueue.registerExecutor('download-model', async (task: QueueTask) => {
    if (!task.modelId) return;
    const win = getMainWindow();

    await downloadModel(
      task.modelId,
      (progress) => {
        task.percent = progress.percent;
        if (win && !win.isDestroyed()) {
          win.webContents.send(IPC.QUEUE_TASK_PROGRESS, {
            taskId: task.id,
            percent: progress.percent,
            status: 'running',
            message: `${progress.percent}%`,
          });
        }
      },
    );
  });

  // Queue-based download: renderer adds a task, executor handles it
  ipcMain.handle(IPC.MODELS_DOWNLOAD, async (_event, modelId: string) => {
    const def = MODELS.find((m) => m.id === modelId);
    if (!def) return { success: false, error: 'Unknown model' };

    const task: QueueTask = {
      id: `dl-model-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'download-model',
      label: `${def.name} (${(def.sizeBytes / 1_048_576).toFixed(0)} MB)`,
      status: 'queued',
      percent: 0,
      createdAt: Date.now(),
      modelId,
    };

    taskQueue.addTask(task);
    return { success: true, taskId: task.id };
  });

  ipcMain.handle(IPC.MODELS_CANCEL_DOWNLOAD, async () => {
    return { success: true };
  });
}
