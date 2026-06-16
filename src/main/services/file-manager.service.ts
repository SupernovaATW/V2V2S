import fs from 'fs';
import path from 'path';
import { shell } from 'electron';
import type { FileEntry } from '../../shared/types';

const AUDIO_EXTS = new Set(['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.wma']);
const VIDEO_EXTS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm']);
const SUB_EXTS = new Set(['.json', '.srt', '.vtt', '.ass', '.ssa']);

function getFileType(ext: string): FileEntry['type'] {
  if (AUDIO_EXTS.has(ext)) return 'audio';
  if (VIDEO_EXTS.has(ext)) return 'video';
  if (SUB_EXTS.has(ext)) return 'subtitle';
  return 'other';
}

export function listFiles(
  dirPath: string,
  filter?: string,
): FileEntry[] {
  if (!fs.existsSync(dirPath)) return [];

  const entries: FileEntry[] = [];

  try {
    const files = fs.readdirSync(dirPath);

    for (const name of files) {
      const fullPath = path.join(dirPath, name);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          const ext = path.extname(name).toLowerCase();
          const type = getFileType(ext);

          if (filter && filter !== 'all' && type !== filter) continue;

          entries.push({
            name,
            path: fullPath,
            size: stat.size,
            ext,
            modifiedAt: stat.mtimeMs,
            type,
          });
        }
      } catch {
        // Skip files we can't stat
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return entries.sort((a, b) => b.modifiedAt - a.modifiedAt);
}

export function searchFiles(
  dirPath: string,
  query: string,
): FileEntry[] {
  const all = listFiles(dirPath);
  if (!query) return all;
  const lower = query.toLowerCase();
  return all.filter((f) => f.name.toLowerCase().includes(lower));
}

export function deleteFile(filePath: string): boolean {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
}

export function openFolder(filePath: string): void {
  shell.showItemInFolder(filePath);
}
