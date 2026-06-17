import { ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import { IPC } from '../../shared/ipc-channels';
import { extractAudio } from '../services/ffmpeg.service';
import { taskQueue } from '../services/task-queue.service';
import type { ExtractAudioArgs, QueueTask } from '../../shared/types';

export function registerAudioExtractionHandlers(getMainWindow: () => BrowserWindow | null): void {
  taskQueue.registerExecutor('extract', async (task: QueueTask) => {
    if (!task.inputPath) return;
    const win = getMainWindow();
    const outputDir = path.dirname(task.inputPath);
    const baseName = path.basename(task.inputPath, path.extname(task.inputPath));
    const outputPath = path.join(outputDir, `${baseName}.wav`);

    await extractAudio(task.inputPath, outputPath, (progress) => {
      task.percent = progress.percent;
      if (win && !win.isDestroyed()) {
        win.webContents.send(IPC.QUEUE_TASK_PROGRESS, {
          taskId: task.id,
          percent: progress.percent,
          status: 'running',
        });
      }
    }, task);
    task.outputPath = outputPath;
  });

  ipcMain.handle(IPC.AUDIO_EXTRACT_START, async (_event, args: ExtractAudioArgs) => {
    const allTasks: QueueTask[] = [];

    for (const filePath of args.filePaths) {
      const baseName = path.basename(filePath, path.extname(filePath));

      const extractTask: QueueTask = {
        id: `extract-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'extract',
        label: path.basename(filePath),
        status: 'queued',
        percent: 0,
        createdAt: Date.now(),
        inputPath: filePath,
      };
      allTasks.push(extractTask);

      // Add auto-transcribe task NOW, not inside the executor
      if (args.autoTranscribe) {
        const transcribeTask: QueueTask = {
          id: `transcribe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'transcribe',
          label: `${baseName} → 转录`,
          status: 'queued',
          percent: 0,
          createdAt: Date.now(),
          audioPath: path.join(path.dirname(filePath), `${baseName}.wav`),
          modelId: args.transcribeModelId || 'small',
          language: args.transcribeLanguage || 'auto',
        };
        allTasks.push(transcribeTask);
      }
    }

    taskQueue.addTasks(allTasks);
    return { success: true, taskCount: allTasks.length };
  });
}
