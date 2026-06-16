import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Check, ChevronDown } from 'lucide-react';
import { Button } from '../shared/Button';
import { useModelManager } from '../../hooks/useModelManager';
import { formatFileSize } from '../../lib/formatters';

interface ModelSelectorProps {
  selected: string;
  onSelect: (modelId: string) => void;
}

export function ModelSelector({ selected, onSelect }: ModelSelectorProps) {
  const { t } = useTranslation();
  const { models, downloading, downloadProgress, download } = useModelManager();

  const displayModels = models.length > 0
    ? models
    : [
        { id: 'small', name: 'Small', sizeBytes: 466_000_000, bundled: true, downloaded: true, multilingual: true, filename: 'ggml-small.bin', url: '' },
      ];

  const selectedModel = displayModels.find((m) => m.id === selected) || displayModels[0];

  return (
    <div className="flex items-center gap-3">
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] appearance-none cursor-pointer pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a09d96' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
        }}
      >
        {displayModels.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({formatFileSize(m.sizeBytes)}){m.bundled ? ` — ${t('model.modelBuiltin')}` : m.downloaded ? ` — ${t('model.modelDownloaded')}` : ` — ⬇ ${t('model.modelDownload')}`}
          </option>
        ))}
      </select>

      {/* Download button for selected model (if not downloaded) */}
      {selectedModel && !selectedModel.downloaded && !selectedModel.bundled && (
        downloading === selectedModel.id ? (
          <span className="text-xs text-[var(--text-secondary)]">
            {downloadProgress?.percent || 0}%
          </span>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => download(selectedModel.id)}>
            <Download size={12} /> {t('model.modelDownload')}
          </Button>
        )
      )}

      {selectedModel && selectedModel.downloaded && !selectedModel.bundled && (
        <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]">
          <Check size={12} /> {t('model.modelDownloaded')}
        </span>
      )}
    </div>
  );
}
