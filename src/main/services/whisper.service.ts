import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getWhisperCliPath, getModelPath } from '../utils/paths';
import { taskQueue } from './task-queue.service';
import type { TranscriptionOutput } from '../../shared/types';

export async function transcribe(
  audioPath: string,
  modelId: string,
  outputDir: string,
  language: string,
  onProgress: (percent: number) => void,
  task?: any,
): Promise<{ json: TranscriptionOutput; srt: string }> {
  return new Promise((resolve, reject) => {
    const whisperCli = getWhisperCliPath();
    const modelPath = getModelPath(modelId);

    if (!fs.existsSync(whisperCli)) {
      reject(new Error(`Whisper executable not found: ${whisperCli}`));
      return;
    }

    if (!fs.existsSync(modelPath)) {
      reject(new Error(`Model not found: ${modelPath}. Please download it first.`));
      return;
    }

    const baseName = path.basename(audioPath, path.extname(audioPath));
    const outputBase = path.join(outputDir, baseName);

    const args = [
      '-m', modelPath,
      '-f', audioPath,
      '-oj',
      '-osrt',
      '-of', outputBase,
      '-pp',
    ];

    if (language && language !== 'auto') {
      args.push('-l', language);
    }

    // Initial prompt for better output quality
    if (language === 'zh') {
      args.push('--prompt', '以下是简体中文的转录文本。');
    } else if (language === 'en') {
      args.push('--prompt', 'This is an English transcription.');
    }

    const whisperDir = path.dirname(whisperCli);
    const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path') || 'PATH';
    const env = {
      ...process.env,
      [pathKey]: `${whisperDir}${path.delimiter}${process.env[pathKey] || ''}`,
    };

    let stdoutTail = '';
    let stderrTail = '';
    const appendTail = (current: string, chunk: string) => (current + chunk).slice(-6000);

    const proc = spawn(whisperCli, args, { cwd: whisperDir, env });
    if (task) taskQueue.setProc(task, proc);

    const parseProgress = (data: string) => {
      if (task?.cancelRequested) { proc.kill('SIGKILL'); reject(new Error('Cancelled')); return; }
      // whisper.cpp progress: "progress = NN%" or "[INFO ] progress = NN%"
      const match = data.match(/progress\s*[=:]\s*(\d+)\s*%/);
      if (match) {
        onProgress(parseInt(match[1]));
      }
    };

    proc.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      stdoutTail = appendTail(stdoutTail, text);
      parseProgress(text);
    });
    proc.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      stderrTail = appendTail(stderrTail, text);
      parseProgress(text);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const jsonPath = `${outputBase}.json`;
          const srtPath = `${outputBase}.srt`;

          if (!fs.existsSync(jsonPath)) {
            reject(new Error('JSON output file not found'));
            return;
          }

          const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
          const json: TranscriptionOutput = JSON.parse(jsonContent);

          let srt = '';
          if (fs.existsSync(srtPath)) {
            srt = fs.readFileSync(srtPath, 'utf-8');
          }

          resolve({ json, srt });
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(formatWhisperExitError(code, stderrTail, stdoutTail)));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

function formatWhisperExitError(code: number | null, stderr: string, stdout: string): string {
  const detail = [stderr.trim(), stdout.trim()].filter(Boolean).join('\n').trim();
  const exitLabel = code === null ? 'unknown' : `${code}${code > 0 ? ` (0x${code.toString(16).toUpperCase()})` : ''}`;

  let message = `Whisper exited with code ${exitLabel}`;
  if (code === 3221226505) {
    message +=
      '\nWhisper crashed on this Windows computer. This is usually caused by an incompatible whisper.cpp build, missing Microsoft Visual C++ runtime, or an older CPU that cannot run the bundled binary.';
  } else if (code === 3221225501) {
    message +=
      '\nWhisper hit an illegal CPU instruction. Use a whisper.cpp build compiled for an older CPU, or run it on a CPU with the required instruction support.';
  }

  return detail ? `${message}\n\nWhisper output:\n${detail}` : message;
}
