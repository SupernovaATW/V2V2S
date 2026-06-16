import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Copy, Save, FileAudio, Play, Plus, FileJson, FileText } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { EmptyState } from '../shared/EmptyState';
import { ModelSelector } from './ModelSelector';
import { api } from '../../lib/ipc';

export function TranscriptionPanel() {
  const { t, i18n } = useTranslation();
  const defaultLang = i18n.language.startsWith('zh') ? 'zh' : 'en';
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState('small');
  const [language, setLanguage] = useState(defaultLang);
  const [result, setResult] = useState<{ json: any; srt: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'json' | 'srt'>('json');
  const [transcribing, setTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputJson, setOutputJson] = useState(true);
  const [outputSrt, setOutputSrt] = useState(true);

  const handleBrowseAudio = useCallback(async () => {
    const res = await api.openFileDialog({
      filters: [{ name: 'Audio Files', extensions: ['wav', 'mp3', 'm4a', 'flac', 'ogg', 'aac'] }],
    });
    if (!res.cancelled && res.filePaths && res.filePaths.length > 0) {
      setAudioPath(res.filePaths[0]);
      const parts = res.filePaths[0].replace(/\\/g, '/').split('/');
      setAudioName(parts[parts.length - 1]);
      setResult(null);
    }
  }, []);

  const handleTranscribe = useCallback(async () => {
    if (!audioPath) return;
    setTranscribing(true);
    setProgress(0);
    setResult(null);

    await api.transcribe({ audioPath, modelId: selectedModel, language });

    const unsubProg = api.onQueueTaskProgress((p: any) => setProgress(p.percent));
    const unsubState = api.onQueueStateChanged((state: any) => {
      const done = state.tasks.filter((t: any) => t.status === 'completed' || t.status === 'failed');
      if (done.length === state.tasks.length && state.tasks.length > 0) {
        setTranscribing(false);
        unsubProg();
        unsubState();
      }
    });
  }, [audioPath, selectedModel, language]);

  const handleAddToQueue = useCallback(async () => {
    if (!audioPath) return;
    await api.addQueueTask({
      type: 'transcribe',
      audioPath,
      modelId: selectedModel,
      language,
      label: audioName,
    });
  }, [audioPath, selectedModel, language, audioName]);

  const handleCopyJson = useCallback(() => {
    if (result?.json) navigator.clipboard.writeText(JSON.stringify(result.json, null, 2));
  }, [result]);

  const handleSaveJson = useCallback(async () => {
    if (!result?.json) return;
    const res = await api.saveFileDialog({ filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (!res.cancelled && res.filePath) {
      await api.writeFile(res.filePath, JSON.stringify(result.json, null, 2));
    }
  }, [result]);

  const handleSaveSrt = useCallback(async () => {
    if (!result?.srt) return;
    const res = await api.saveFileDialog({ filters: [{ name: 'SRT Subtitles', extensions: ['srt'] }] });
    if (!res.cancelled && res.filePath) {
      await api.writeFile(res.filePath, result.srt);
    }
  }, [result]);

  return (
    <div className="h-full flex flex-col p-8 animate-fade-in">
      <h2 className="text-[22px] font-medium text-[var(--text-primary)] mb-1">{t('audioToSub.title')}</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">{t('audioToSub.desc')}</p>

      {/* Output format toggles */}
      <div className="mb-6 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
        <p className="text-xs font-medium text-[var(--text-primary)] mb-3">{t('audioToSub.outputFormats')}</p>
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

      {/* Model selection */}
      <div className="mb-6">
        <p className="text-sm text-[var(--text-secondary)] mb-3">{t('audioToSub.selectModel')}</p>
        <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
      </div>

      {/* Audio source */}
      <div className="mb-6">
        <p className="text-sm text-[var(--text-secondary)] mb-3">{t('audioToSub.selectAudio')}</p>
        {audioPath ? (
          <Card className="flex items-center gap-3 py-3 px-4">
            <FileAudio size={18} className="text-[var(--accent)] shrink-0" />
            <p className="flex-1 text-sm truncate text-[var(--text-primary)]">{audioName}</p>
            <Button variant="ghost" size="sm" onClick={handleBrowseAudio}>{t('audioToSub.browseAudio')}</Button>
          </Card>
        ) : (
          <div
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--text-secondary)] transition-colors"
            onClick={handleBrowseAudio}
          >
            <FileAudio className="mx-auto mb-2 text-[var(--text-secondary)]" size={28} />
            <p className="text-sm text-[var(--text-secondary)]">{t('audioToSub.browseAudio')}</p>
          </div>
        )}
      </div>

      {/* Language */}
      <div className="mb-6">
        <label className="text-sm text-[var(--text-secondary)] mr-3">{t('audioToSub.language')}</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]"
        >
          <option value="auto">{t('audioToSub.autoDetect')}</option>
          <option value="zh">中文</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="primary" onClick={handleTranscribe} disabled={!audioPath || transcribing || (!outputJson && !outputSrt)}>
          <Play size={16} /> {t('audioToSub.startTranscribe')}
        </Button>
        <Button variant="secondary" onClick={handleAddToQueue} disabled={!audioPath}>
          <Plus size={16} /> {t('audioToSub.addToQueue')}
        </Button>
      </div>

      {/* Progress */}
      {transcribing && (
        <div className="mb-6">
          <ProgressBar percent={progress} />
          <p className="text-xs text-[var(--text-secondary)] mt-1">{progress}%</p>
        </div>
      )}

      {/* Result */}
      {result ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-1 mb-3">
            {outputJson && (
              <button
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'json' ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                onClick={() => setActiveTab('json')}
              >
                {t('audioToSub.tabJSON')}
              </button>
            )}
            {outputSrt && (
              <button
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'srt' ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                onClick={() => setActiveTab('srt')}
              >
                {t('audioToSub.tabSRT')}
              </button>
            )}
          </div>

          <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {activeTab === 'json' ? JSON.stringify(result.json, null, 2) : result.srt}
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border)]">
            {outputJson && (
              <>
                <Button variant="secondary" size="sm" onClick={handleCopyJson}>
                  <Copy size={14} /> {t('audioToSub.copyJson')}
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSaveJson}>
                  <Save size={14} /> {t('audioToSub.saveJson')}
                </Button>
              </>
            )}
            {outputSrt && (
              <Button variant="secondary" size="sm" onClick={handleSaveSrt}>
                <Save size={14} /> {t('audioToSub.saveSrt')}
              </Button>
            )}
          </div>
        </div>
      ) : (
        !transcribing && (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={<Mic size={40} />} title={t('audioToSub.noResult')} />
          </div>
        )
      )}
    </div>
  );
}
