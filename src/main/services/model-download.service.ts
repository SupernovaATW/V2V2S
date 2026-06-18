import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { getBundledModelPath, getUserModelsDir } from '../utils/paths';
import { MODELS, type ModelDefinition } from '../../shared/model-definitions';

export interface DownloadProgress {
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
}

export function getModelDef(modelId: string): ModelDefinition | undefined {
  return MODELS.find((m) => m.id === modelId);
}

export function isModelDownloaded(modelId: string): boolean {
  const def = getModelDef(modelId);
  if (!def) return false;
  if (def.bundled && fs.existsSync(getBundledModelPath())) return true;
  const modelPath = path.join(getUserModelsDir(), def.filename);
  return fs.existsSync(modelPath);
}

export function getDownloadedModels(): string[] {
  return MODELS.filter((m) => {
    if (m.bundled && fs.existsSync(getBundledModelPath())) return true;
    return fs.existsSync(path.join(getUserModelsDir(), m.filename));
  }).map((m) => m.id);
}

function makeRequest(
  url: string,
  headers: Record<string, string>,
  maxRedirects: number,
): Promise<{ stream: http.IncomingMessage; url: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const fetcher = parsedUrl.protocol === 'https:' ? https : http;

    const req = fetcher.get(url, { headers }, (res) => {
      // Follow redirects
      const redirectCodes = [301, 302, 303, 307, 308];
      if (redirectCodes.includes(res.statusCode || 0) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        makeRequest(redirectUrl, headers, maxRedirects - 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (res.statusCode !== 200 && res.statusCode !== 206) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      resolve({ stream: res, url });
    });

    req.on('error', reject);
  });
}

export function downloadModel(
  modelId: string,
  onProgress: (progress: DownloadProgress) => void,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const def = getModelDef(modelId);
    if (!def) {
      reject(new Error(`Unknown model: ${modelId}`));
      return;
    }

    const destDir = getUserModelsDir();
    const destPath = path.join(destDir, def.filename);
    const partPath = destPath + '.part';

    let downloadedBytes = 0;
    const totalBytes = def.sizeBytes;
    const startByte = fs.existsSync(partPath) ? fs.statSync(partPath).size : 0;
    downloadedBytes = startByte;

    const headers: Record<string, string> = {};
    if (startByte > 0) {
      headers['Range'] = `bytes=${startByte}-`;
    }

    try {
      const { stream: res } = await makeRequest(def.url, headers, 5);

      const actualTotal = startByte + parseInt(res.headers['content-length'] || '0');
      const writeStream = fs.createWriteStream(partPath, { flags: startByte > 0 ? 'a' : 'w' });
      let lastTime = Date.now();
      let lastBytes = downloadedBytes;

      res.on('data', (chunk: Buffer) => {
        downloadedBytes += chunk.length;
        writeStream.write(chunk);

        const now = Date.now();
        if (now - lastTime >= 500) {
          const speed = ((downloadedBytes - lastBytes) / (now - lastTime)) * 1000;
          lastTime = now;
          lastBytes = downloadedBytes;
          onProgress({
            percent: Math.round((downloadedBytes / actualTotal) * 100),
            downloadedBytes,
            totalBytes: actualTotal,
            speedBytesPerSec: speed,
          });
        }
      });

      res.on('end', () => {
        writeStream.end();
        fs.renameSync(partPath, destPath);
        onProgress({ percent: 100, downloadedBytes: actualTotal, totalBytes: actualTotal, speedBytesPerSec: 0 });
        resolve(destPath);
      });

      res.on('error', (err) => {
        writeStream.close();
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
