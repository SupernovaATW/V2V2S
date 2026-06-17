import { ipcMain, BrowserWindow } from 'electron';
import { IPC } from '../../shared/ipc-channels';
import { taskQueue } from '../services/task-queue.service';

export function registerQueueHandlers(getMainWindow: () => BrowserWindow | null): void {
  taskQueue.onStateChange((state) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC.QUEUE_STATE_CHANGED, state);
    }
  });

  ipcMain.handle(IPC.QUEUE_GET_STATE, async () => {
    return taskQueue.getState();
  });

  ipcMain.handle(IPC.QUEUE_ADD_TASK, async (_event, task: any) => {
    taskQueue.addTask(task);
    return { success: true };
  });

  ipcMain.handle(IPC.QUEUE_REMOVE_TASK, async (_event, taskId: string) => {
    return { success: taskQueue.removeTask(taskId) };
  });

  ipcMain.handle(IPC.QUEUE_PAUSE, async () => {
    taskQueue.pause();
    return { success: true };
  });

  ipcMain.handle(IPC.QUEUE_RESUME, async () => {
    taskQueue.resume();
    return { success: true };
  });

  ipcMain.handle(IPC.QUEUE_RETRY_TASK, async (_event, taskId: string) => {
    return { success: taskQueue.retryTask(taskId) };
  });

  ipcMain.handle(IPC.QUEUE_CANCEL_TASK, async (_event, taskId: string) => {
    return { success: taskQueue.cancelTask(taskId) };
  });
}
