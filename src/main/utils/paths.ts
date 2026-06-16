import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { MODELS } from '../../shared/model-definitions';

function getResourcesPath(): string {
  // In packaged mode, extraResources are copied directly into process.resourcesPath
  if (app.isPackaged) return process.resourcesPath;
  // In dev mode, resources/ is at the project root
  return path.join(app.getAppPath());
}

function resolveBundlePath(...segments: string[]): string {
  const base = getResourcesPath();
  if (app.isPackaged) {
    // extraResources are copied as subfolders of resourcesPath
    return path.join(base, ...segments);
  }
  // In dev mode, they're under the resources/ folder at project root
  return path.join(base, 'resources', ...segments);
}

export function getFfmpegPath(): string {
  const exePath = resolveBundlePath('ffmpeg', 'win32-x64', 'ffmpeg.exe');
  if (fs.existsSync(exePath)) return exePath;
  if (!app.isPackaged) return 'ffmpeg';
  throw new Error(`FFmpeg not found at: ${exePath}`);
}

export function getFfprobePath(): string {
  const exePath = resolveBundlePath('ffmpeg', 'win32-x64', 'ffprobe.exe');
  if (fs.existsSync(exePath)) return exePath;
  if (!app.isPackaged) return 'ffprobe';
  throw new Error(`FFprobe not found at: ${exePath}`);
}

export function getWhisperCliPath(): string {
  const exePath = resolveBundlePath('whisper', 'win32-x64', 'whisper-cli.exe');
  if (fs.existsSync(exePath)) return exePath;
  if (!app.isPackaged) return 'whisper-cli';
  throw new Error(`whisper-cli not found at: ${exePath}`);
}

export function getBundledModelPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'models', 'ggml-small.bin');
  }
  // In dev, models/ is at project root
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

  const userPath = path.join(getUserModelsDir(), def.filename);
  return userPath;
}
