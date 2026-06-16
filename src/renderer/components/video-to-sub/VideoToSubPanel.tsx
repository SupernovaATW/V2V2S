import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Plus, Play, Trash2, FileVideo, Copy, Save, ChevronRight, FileJson, FileText } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { StatusBadge } from '../shared/StatusBadge';
import { EmptyState } from '../shared/EmptyState';
import { ModelSelector } from '../transcription/ModelSelector';
import { api } from '../../lib/ipc';
import type { TranscriptionOutput } from '../../../shared/types';

interface VideoFile {
  path: string;
  name: string;
}

interface FileResult {
  json?: TranscriptionOutput;
  srt?: string;
}

export function VideoToSubPanel() {
  const { t, i18n } = useTranslation();
  const defaultLang = i18n.language.startsWith('zh') ? 'zh' : 'en';
  const [files, setFiles] = useState<VideoFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState('small');
  const [language, setLanguage] = useState(defaultLang);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Record<string, FileResult>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'json' | 'srt'>('json');
  const [outputJson, setOutputJson] = useState(true);
  const [outputSrt, setOutputSrt] = useState(true);

  const addFiles = useCallback((paths: string[]) => {
    const newFiles = paths
      .filter((p) => !files.find((f) => f.path === p))
      .map((p) => {
        const parts = p.replace(/\\/g, '/').split('/');
        return { path: p, name: parts[parts.length - 1] };
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

  const handleStartAll = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    await api.videoToSub({
      filePaths: files.map((f) => f.path),
      modelId: selectedModel,
      language,
    });
  }, [files, selectedModel, language]);

  const handleClear = useCallback(() => {
    setFiles([]);
    setResults({});
    setActiveFile(null);
  }, []);

  const activeResult = activeFile ? results[activeFile] : null;
  const showJson = !!(activeResult?.json && outputJson);
  const showSrt = !!(activeResult?.srt && outputSrt);

  // If active tab doesn't match available outputs, auto-switch
  React.useEffect(() => {
    if (activeTab === 'json' && !showJson && showSrt) setActiveTab('srt');
    if (activeTab === 'srt' && !showSrt && showJson) setActiveTab('json');
  }, [activeTab, showJson, showSrt]);

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      <div className="flex-1 overflow-y-auto p-8">
        <h2 className="text-[22px] font-medium text-[var(--text-primary)] mb-1">{t('videoToSub.title')}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{t('videoToSub.desc')}</p>

        {/* Output format toggles */}
        <div className="mb-6 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
          <p className="text-xs font-medium text-[var(--text-primary)] mb-3">{t('videoToSub.outputFormats')}</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={outputJson}
                onChange={(e) => setOutputJson(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <FileJson size={16} className="text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-primary)]">JSON</span>
              <span className="text-xs text-[var(--text-secondary)]">{t('audioToSub.labelJson')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={outputSrt}
                onChange={(e) => setOutputSrt(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <FileText size={16} className="text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-primary)]">SRT</span>
              <span className="text-xs text-[var(--text-secondary)]">{t('audioToSub.labelSrt')}</span>
            </label>
          </div>
        </div>

        {/* Model & Language */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-2">{t('videoToSub.model')}</p>
            <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-2">{t('videoToSub.language')}</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="auto">{t('videoToSub.autoDetect')}</option>
              <option value="zh">中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-4 text-xs text-[var(--text-secondary)]">
          <span className="px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border)]">{t('queue.stepExtract')}</span>
          <ChevronRight size={12} />
          <span className="px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border)]">{t('queue.stepTranscribe')}</span>
          <ChevronRight size={12} />
          <span className="px-2 py-1 rounded bg-[var(--accent)] text-white font-medium">{t('queue.resultSubtitle')}</span>
        </div>

        {/* Drop zone */}
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
          <p className="text-sm text-[var(--text-secondary)]">{t('videoToSub.dropzone')}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2 opacity-60">{t('videoToSub.steps')}</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            {files.map((file) => (
              <Card
                key={file.path}
                className={`flex items-center gap-3 py-3 px-4 cursor-pointer ${activeFile === file.path ? 'outline outline-2 outline-[var(--accent)]' : ''}`}
                onClick={() => setActiveFile(file.path)}
              >
                <FileVideo size={18} className="text-[var(--warning)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-[var(--text-primary)]">{file.name}</p>
                </div>
                {results[file.path] && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[rgba(93,184,114,0.15)] text-[var(--success)]">
                    ✓
                  </span>
                )}
              </Card>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <div className="py-16 flex items-center justify-center">
            <EmptyState icon={<FileVideo size={40} />} title={t('videoToSub.noFiles')} />
          </div>
        )}
      </div>

      {/* Result viewer */}
      {activeResult && (showJson || showSrt) && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-1">
              {showJson && (
                <button
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'json' ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                  onClick={() => setActiveTab('json')}
                >
                  {t('videoToSub.tabJSON')}
                </button>
              )}
              {showSrt && (
                <button
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'srt' ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                  onClick={() => setActiveTab('srt')}
                >
                  {t('videoToSub.tabSRT')}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {showJson && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => {
                    if (activeResult.json) navigator.clipboard.writeText(JSON.stringify(activeResult.json, null, 2));
                  }}>
                    <Copy size={14} /> {t('videoToSub.copyJson')}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={async () => {
                    if (activeResult.json) {
                      const res = await api.saveFileDialog({ filters: [{ name: 'JSON', extensions: ['json'] }] });
                      if (!res.cancelled && res.filePath) {
                        await api.writeFile(res.filePath, JSON.stringify(activeResult.json, null, 2));
                      }
                    }
                  }}>
                    <Save size={14} /> {t('videoToSub.saveJson')}
                  </Button>
                </>
              )}
              {showSrt && (
                <Button variant="secondary" size="sm" onClick={async () => {
                  if (activeResult.srt) {
                    const res = await api.saveFileDialog({ filters: [{ name: 'SRT Subtitles', extensions: ['srt'] }] });
                    if (!res.cancelled && res.filePath) {
                      await api.writeFile(res.filePath, activeResult.srt);
                    }
                  }
                }}>
                  <Save size={14} /> {t('videoToSub.saveSrt')}
                </Button>
              )}
            </div>
          </div>
          <div className="p-6 max-h-64 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {activeTab === 'json' && showJson ? JSON.stringify(activeResult.json, null, 2) : ''}
            {activeTab === 'srt' && showSrt ? activeResult.srt || '' : ''}
            {!showJson && !showSrt ? <span className="text-[var(--text-secondary)]">{t('audioToSub.noResult')}</span> : null}
          </div>
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex items-center gap-3 px-8 py-4 border-t border-[var(--border)]">
          <Button variant="primary" onClick={handleStartAll} disabled={isProcessing || (!outputJson && !outputSrt)}>
            <Play size={16} /> {t('videoToSub.startAll')}
          </Button>
          <Button variant="secondary" onClick={handleBrowse}>
            <Plus size={16} /> {t('videoToSub.addToQueue')}
          </Button>
          <Button variant="ghost" onClick={handleClear}>
            <Trash2 size={16} /> {t('extract.clear')}
          </Button>
        </div>
      )}
    </div>
  );
}
