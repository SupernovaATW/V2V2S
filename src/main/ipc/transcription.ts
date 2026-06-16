import { ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import { IPC } from '../../shared/ipc-channels';
import { extractAudio } from '../services/ffmpeg.service';
import { transcribe } from '../services/whisper.service';
import { taskQueue } from '../services/task-queue.service';
import type { TranscribeArgs, QueueTask, VideoToSubArgs } from '../../shared/types';

export function registerTranscriptionHandlers(getMainWindow: () => BrowserWindow | null): void {
  const win = getMainWindow;

  // Transcribe executor
  taskQueue.registerExecutor('transcribe', async (task: QueueTask) => {
    if (!task.audioPath || !task.modelId) return;
    const outputDir = path.dirname(task.audioPath);

    await transcribe(
      task.audioPath,
      task.modelId,
      outputDir,
      task.language || 'auto',
      (percent) => {
        task.percent = percent;
        if (win()) {
          win()!.webContents.send(IPC.QUEUE_TASK_PROGRESS, {
            taskId: task.id,
            percent,
            status: 'running',
          });
        }
      },
    );

    // Read the output files
    const baseName = path.basename(task.audioPath, path.extname(task.audioPath));
    const jsonPath = path.join(outputDir, `${baseName}.json`);
    const srtPath = path.join(outputDir, `${baseName}.srt`);

    try {
      const fs = await import('fs');
      if (fs.existsSync(jsonPath)) {
        task.jsonResult = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      }
      if (fs.existsSync(srtPath)) {
        task.srtResult = fs.readFileSync(srtPath, 'utf-8');
      }
    } catch { /* ignore file read errors */ }
  });

  // Video-to-sub executor: chain extract + transcribe
  taskQueue.registerExecutor('video-to-sub', async (task: QueueTask) => {
    if (!task.inputPath || !task.modelId) return;
    const outputDir = path.dirname(task.inputPath);
    const baseName = path.basename(task.inputPath, path.extname(task.inputPath));
    const wavPath = path.join(outputDir, `${baseName}.wav`);

    // Create child tasks for progress display
    const childExtract: QueueTask = {
      id: `${task.id}-extract`,
      type: 'extract',
      label: `${baseName} - ${path.basename(outputDir)}`,
      status: 'queued',
      percent: 0,
      createdAt: Date.now(),
      inputPath: task.inputPath,
    };

    const childTranscribe: QueueTask = {
      id: `${task.id}-transcribe`,
      type: 'transcribe',
      label: `${baseName}`,
      status: 'queued',
      percent: 0,
      createdAt: Date.now(),
      audioPath: wavPath,
      modelId: task.modelId,
      language: task.language,
    };

    task.childTasks = [childExtract, childTranscribe];

    // Step 1: Extract audio
    childExtract.status = 'running';
    taskQueue.notifyChange();

    await extractAudio(task.inputPath, wavPath, (progress) => {
      childExtract.percent = progress.percent;
      task.percent = Math.round(progress.percent * 0.4); // extract is 40% of total
      if (win()) {
        win()!.webContents.send(IPC.QUEUE_TASK_PROGRESS, {
          taskId: task.id,
          percent: task.percent,
          status: 'running',
        });
      }
    });

    childExtract.status = 'completed';
    childExtract.percent = 100;

    // Step 2: Transcribe
    childTranscribe.status = 'running';
    taskQueue['emit']?.();

    await transcribe(
      wavPath,
      task.modelId,
      outputDir,
      task.language || 'auto',
      (percent) => {
        childTranscribe.percent = percent;
        task.percent = 40 + Math.round(percent * 0.6); // transcribe is 60% of total
        if (win()) {
          win()!.webContents.send(IPC.QUEUE_TASK_PROGRESS, {
            taskId: task.id,
            percent: task.percent,
            status: 'running',
          });
        }
      },
    );

    childTranscribe.status = 'completed';
    childTranscribe.percent = 100;

    // Read results
    const jsonPath = path.join(outputDir, `${baseName}.json`);
    const srtPath = path.join(outputDir, `${baseName}.srt`);

    try {
      const fs = await import('fs');
      if (fs.existsSync(jsonPath)) {
        task.jsonResult = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      }
      if (fs.existsSync(srtPath)) {
        task.srtResult = fs.readFileSync(srtPath, 'utf-8');
      }
    } catch { /* ignore */ }
  });

  // IPC handler for direct transcribe
  ipcMain.handle(IPC.TRANSCRIBE_START, async (_event, args: TranscribeArgs) => {
    const task: QueueTask = {
      id: `transcribe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'transcribe',
      label: path.basename(args.audioPath),
      status: 'queued',
      percent: 0,
      createdAt: Date.now(),
      audioPath: args.audioPath,
      modelId: args.modelId,
      language: args.language,
    };

    taskQueue.addTask(task);
    return { success: true, taskId: task.id };
  });

  // IPC handler for video-to-sub
  ipcMain.handle(IPC.VIDEO_TO_SUB_START, async (_event, args: VideoToSubArgs) => {
    const tasks: QueueTask[] = args.filePaths.map((filePath) => ({
      id: `video-sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'video-to-sub' as const,
      label: path.basename(filePath),
      status: 'queued' as const,
      percent: 0,
      createdAt: Date.now(),
      inputPath: filePath,
      modelId: args.modelId,
      language: args.language,
    }));

    taskQueue.addTasks(tasks);
    return { success: true, taskCount: tasks.length };
  });
}
