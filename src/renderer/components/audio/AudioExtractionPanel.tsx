import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Plus, Play, Trash2, FileVideo, ArrowRight, FileJson, FileText } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { StatusBadge } from '../shared/StatusBadge';
import { EmptyState } from '../shared/EmptyState';
import { api } from '../../lib/ipc';
import { formatDuration, formatFileSize } from '../../lib/formatters';

interface VideoFile {
  path: string;
  name: string;
  size: number;
  duration?: number;
}

interface ExtractionStatus {
  [path: string]: { status: 'queued' | 'running' | 'completed' | 'failed'; percent: number };
}

export function AudioExtractionPanel({ modelId: defaultModelId }: { modelId: string }) {
  const { t, i18n } = useTranslation();
  const defaultLang = i18n.language.startsWith('zh') ? 'zh' : 'en';
  const [files, setFiles] = useState<VideoFile[]>([]);
  const [statuses, setStatuses] = useState<ExtractionStatus>({});
  const [isDragging, setIsDragging] = useState(false);
  const [autoTranscribe, setAutoTranscribe] = useState(false);
  const [outputJson, setOutputJson] = useState(true);
  const [outputSrt, setOutputSrt] = useState(true);
  const [transcribeLang, setTranscribeLang] = useState(defaultLang);

  const addFiles = useCallback((paths: string[]) => {
    const newFiles = paths
      .filter((p) => !files.find((f) => f.path === p))
      .map((p) => {
        const parts = p.replace(/\\/g, '/').split('/');
        return { path: p, name: parts[parts.length - 1], size: 0 };
      });
    setFiles((prev) => [...prev, ...newFiles]);
  }, [files]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped: string[] = [];
    if (e.dataTransfer.files) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        dropped.push(e.dataTransfer.files[i].path);
      }
    }
    addFiles(dropped);
  }, [addFiles]);

  const handleBrowse = useCallback(async () => {
    const result = await api.openFileDialog({
      filters: [{ name: 'Video Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm'] }],
    });
    if (!result.cancelled && result.filePaths) {
      addFiles(result.filePaths);
    }
  }, [addFiles]);

  const handleExtractAll = useCallback(async () => {
    if (files.length === 0) return;
    const paths = files.map((f) => f.path);
    const newStatuses: ExtractionStatus = {};
    paths.forEach((p) => { newStatuses[p] = { status: 'queued', percent: 0 }; });
    setStatuses(newStatuses);

    await api.extractAudio({
      filePaths: paths,
      autoTranscribe,
      transcribeModelId: defaultModelId,
      transcribeLanguage: transcribeLang,
    });
  }, [files, autoTranscribe]);

  const handleClear = useCallback(() => {
    setFiles([]);
    setStatuses({});
  }, []);

  return (
    <div className="h-full overflow-y-auto p-8 animate-fade-in">
      <h2 className="text-[22px] font-medium text-[var(--text-primary)] mb-1">{t('extract.title')}</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">{t('extract.desc')}</p>

      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-[var(--accent)] bg-[rgba(204,120,92,0.08)]'
            : 'border-[var(--border)] hover:border-[var(--text-secondary)]'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={handleBrowse}
      >
        <Upload className="mx-auto mb-3 text-[var(--text-secondary)]" size={32} />
        <p className="text-sm text-[var(--text-secondary)]">{t('extract.dropzone')}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-2 opacity-60">{t('extract.outputFormat')}</p>
      </div>

      {/* Chain option */}
      <label className="flex items-center gap-3 mt-4 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
        <input
          type="checkbox"
          checked={autoTranscribe}
          onChange={(e) => setAutoTranscribe(e.target.checked)}
          className="w-4 h-4 accent-[var(--accent)]"
        />
        <div>
          <p className="text-sm text-[var(--text-primary)]">{t('extract.autoTranscribe')}</p>
          <p className="text-xs text-[var(--text-secondary)]">{t('extract.autoTranscribeHint')}</p>
        </div>
        <ArrowRight size={14} className="ml-auto text-[var(--text-secondary)]" />
      </label>

      {/* Format toggles — only show when chain is enabled */}
      {autoTranscribe && (
        <div className="mt-3 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl animate-slide-up space-y-3">
          <p className="text-xs font-medium text-[var(--text-primary)] mb-3">{t('audioToSub.outputFormats')}</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={outputJson} onChange={(e) => setOutputJson(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
              <FileJson size={16} className="text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-primary)]">JSON</span>
              <span className="text-xs text-[var(--text-secondary)]">{t('audioToSub.labelJson')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={outputSrt} onChange={(e) => setOutputSrt(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
              <FileText size={16} className="text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-primary)]">SRT</span>
              <span className="text-xs text-[var(--text-secondary)]">{t('audioToSub.labelSrt')}</span>
            </label>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <label className="text-xs text-[var(--text-secondary)]">{t('audioToSub.language')}</label>
            <select
              value={transcribeLang}
              onChange={(e) => setTranscribeLang(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)]"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="auto">{t('audioToSub.autoDetect')}</option>
            </select>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map((file) => {
            const s = statuses[file.path];
            return (
              <Card key={file.path} className="flex items-center gap-3 py-3 px-4">
                <FileVideo size={18} className="text-[var(--text-secondary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-[var(--text-primary)]">{file.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {file.size > 0 ? formatFileSize(file.size) : ''}
                  </p>
                </div>
                {s && (
                  <div className="flex items-center gap-3">
                    {s.status === 'running' && <ProgressBar percent={s.percent} className="w-24" />}
                    <StatusBadge status={s.status} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {files.length === 0 && (
        <div className="py-16 flex items-center justify-center">
          <EmptyState icon={<FileVideo size={40} />} title={t('extract.noFiles')} />
        </div>
      )}

      {files.length > 0 && (
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[var(--border)]">
          <Button variant="primary" onClick={handleExtractAll} disabled={autoTranscribe && !outputJson && !outputSrt}>
            <Play size={16} /> {autoTranscribe ? `${t('extract.extractAll')} + ${t('nav.audioToSub')}` : t('extract.extractAll')}
          </Button>
          <Button variant="secondary" onClick={handleBrowse}>
            <Plus size={16} /> {t('extract.addFiles')}
          </Button>
          <Button variant="ghost" onClick={handleClear}>
            <Trash2 size={16} /> {t('extract.clear')}
          </Button>
        </div>
      )}
    </div>
  );
}
