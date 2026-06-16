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
      if (win) {
        win.webContents.send(IPC.QUEUE_TASK_PROGRESS, {
          taskId: task.id,
          percent: progress.percent,
          status: 'running',
        });
      }
    });

    task.outputPath = outputPath;

    // Chain: auto-create transcribe task if requested
    if (task.autoTranscribe && task.transcribeModelId) {
      const subTask: QueueTask = {
        id: `auto-transcribe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'transcribe',
        label: baseName,
        status: 'queued',
        percent: 0,
        createdAt: Date.now(),
        audioPath: outputPath,
        modelId: task.transcribeModelId,
        language: task.transcribeLanguage,
      };
      taskQueue.addTask(subTask);
    }
  });

  ipcMain.handle(IPC.AUDIO_EXTRACT_START, async (_event, args: ExtractAudioArgs) => {
    const outputDir = args.outputDir || (args.filePaths.length > 0 ? path.dirname(args.filePaths[0]) : '');

    const tasks: QueueTask[] = args.filePaths.map((filePath) => ({
      id: `extract-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'extract' as const,
      label: path.basename(filePath),
      status: 'queued' as const,
      percent: 0,
      createdAt: Date.now(),
      inputPath: filePath,
      autoTranscribe: args.autoTranscribe,
      transcribeModelId: args.transcribeModelId || 'small',
      transcribeLanguage: args.transcribeLanguage || 'auto',
    }));

    taskQueue.addTasks(tasks);
    return { success: true, taskCount: tasks.length };
  });
}
