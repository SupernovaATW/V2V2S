import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { MODELS } from '../../shared/model-definitions';

export function getFfmpegPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'ffmpeg', 'ffmpeg.exe');
  }
  return path.join(app.getAppPath(), 'resources', 'ffmpeg', 'win32-x64', 'ffmpeg.exe');
}

export function getFfprobePath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'ffmpeg', 'ffprobe.exe');
  }
  return path.join(app.getAppPath(), 'resources', 'ffmpeg', 'win32-x64', 'ffprobe.exe');
}

export function getWhisperCliPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'whisper', 'whisper-cli.exe');
  }
  return path.join(app.getAppPath(), 'resources', 'whisper', 'win32-x64', 'whisper-cli.exe');
}

export function getBundledModelPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'models', 'ggml-small.bin');
  }
  return path.join(app.getAppPath(), 'models', 'ggml-small.bin');
}

export function getUserModelsDir(): string {
  const dir = path.join(app.getPath('userData'), 'models');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getModelPath(modelId: string): string {
  const def = MODELS.find((m) => m.id === modelId);
  if (!def) throw new Error(`Unknown model: ${modelId}`);

  if (def.bundled) {
    const bundled = getBundledModelPath();
    if (fs.existsSync(bundled)) return bundled;
  }

  return path.join(getUserModelsDir(), def.filename);
}
