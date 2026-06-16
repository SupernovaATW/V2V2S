import { spawn, execFile } from 'child_process';
import path from 'path';
import { getFfmpegPath, getFfprobePath } from '../utils/paths';

export interface FFmpegProgress {
  percent: number;
  time: string;
  speed: string;
}

export function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = getFfprobePath();
    execFile(ffprobe, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ], (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(parseFloat(stdout.trim()));
    });
  });
}

export function extractAudio(
  inputPath: string,
  outputPath: string,
  onProgress: (progress: FFmpegProgress) => void,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const ffmpeg = getFfmpegPath();

    const args = [
      '-i', inputPath,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-y',
      outputPath,
    ];

    const proc = spawn(ffmpeg, args);
    let duration = 0;

    try {
      duration = await getVideoDuration(inputPath);
    } catch {
      // Can't get duration, progress will be indeterminate
    }

    proc.stderr.on('data', (data: Buffer) => {
      const output = data.toString();
      const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (timeMatch && duration > 0) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseFloat(timeMatch[3]);
        const currentTime = hours * 3600 + minutes * 60 + seconds;
        const percent = Math.min(Math.round((currentTime / duration) * 100), 99);

        const speedMatch = output.match(/speed=\s*(\S+)x/);
        const speed = speedMatch ? speedMatch[1] : '?';

        onProgress({
          percent,
          time: `${hours}:${String(minutes).padStart(2, '0')}:${String(Math.floor(seconds)).padStart(2, '0')}`,
          speed,
        });
      }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        onProgress({ percent: 100, time: '', speed: '' });
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}
