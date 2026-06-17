import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getWhisperCliPath, getUserModelsDir, getModelPath } from '../utils/paths';
import type { TranscriptionOutput } from '../../shared/types';

export async function transcribe(
  audioPath: string,
  modelId: string,
  outputDir: string,
  language: string,
  onProgress: (percent: number) => void,
  task?: { cancelRequested?: boolean },
): Promise<{ json: TranscriptionOutput; srt: string }> {
  return new Promise((resolve, reject) => {
    const whisperCli = getWhisperCliPath();
    const modelPath = getModelPath(modelId);

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

    const proc = spawn(whisperCli, args);
    if (task) (task as any).__proc = proc;

    const parseProgress = (data: string) => {
      if (task?.cancelRequested) { proc.kill('SIGKILL'); reject(new Error('Cancelled')); return; }
      // whisper.cpp progress: "progress = NN%" or "[INFO ] progress = NN%"
      const match = data.match(/progress\s*[=:]\s*(\d+)\s*%/);
      if (match) {
        onProgress(parseInt(match[1]));
      }
    };

    proc.stdout.on('data', (data: Buffer) => parseProgress(data.toString()));
    proc.stderr.on('data', (data: Buffer) => parseProgress(data.toString()));

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
        reject(new Error(`Whisper exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}
