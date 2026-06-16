import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/ipc';
import { MODELS, type ModelDefinition } from '../../shared/model-definitions';

export interface ModelStatus extends ModelDefinition {
  downloaded: boolean;
}

function getFallbackModels(): ModelStatus[] {
  return MODELS.map((m) => ({
    ...m,
    downloaded: m.bundled,
  }));
}

export function useModelManager() {
  const [models, setModels] = useState<ModelStatus[]>(getFallbackModels);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{
    percent: number;
    downloadedBytes: number;
    totalBytes: number;
    speedBytesPerSec: number;
  } | null>(null);

  useEffect(() => {
    if (!api) return;
    api.getModels().then(setModels).catch(() => {});
  }, []);

  useEffect(() => {
    if (!api) return;
    const unsub = api.onModelDownloadProgress((p: any) => {
      setDownloadProgress(p);
      if (p.percent >= 100) {
        setDownloading(null);
        setDownloadProgress(null);
        api.getModels().then(setModels).catch(() => {});
      }
    });
    return () => { unsub(); };
  }, []);

  const download = useCallback(async (modelId: string) => {
    if (!api) return;
    setDownloading(modelId);
    await api.downloadModel(modelId);
  }, []);

  return { models, downloading, downloadProgress, download };
}
