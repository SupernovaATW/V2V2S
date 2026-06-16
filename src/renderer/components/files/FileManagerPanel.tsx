import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Search, Trash2, ExternalLink, FileAudio, FileVideo, FileText } from 'lucide-react';
import { Button } from '../shared/Button';
import { EmptyState } from '../shared/EmptyState';
import { api } from '../../lib/ipc';
import { formatFileSize, formatDate } from '../../lib/formatters';
import type { FileEntry } from '../../../shared/types';

type FileFilter = 'all' | 'audio' | 'video' | 'subtitle';

const typeIcons: Record<string, React.ReactNode> = {
  audio: <FileAudio size={16} className="text-[var(--accent)] shrink-0" />,
  video: <FileVideo size={16} className="text-[var(--warning)] shrink-0" />,
  subtitle: <FileText size={16} className="text-[var(--success)] shrink-0" />,
  other: <FileText size={16} className="text-[var(--text-secondary)] shrink-0" />,
};

export function FileManagerPanel() {
  const { t } = useTranslation();
  const [dirPath, setDirPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [filter, setFilter] = useState<FileFilter>('all');
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);
  const [previewContent, setPreviewContent] = useState('');

  // Load files from current dir
  const refreshFiles = useCallback(async (dir: string, f: FileFilter) => {
    const entries = await api.listFiles(dir, f);
    setFiles(entries);
  }, []);

  // Pick a directory
  const pickDir = useCallback(async () => {
    const res = await api.openDirDialog();
    if (!res.cancelled && res.filePaths && res.filePaths.length > 0) {
      setDirPath(res.filePaths[0]);
      await refreshFiles(res.filePaths[0], filter);
    }
  }, [filter, refreshFiles]);

  // When filter changes, reload
  useEffect(() => {
    if (dirPath) refreshFiles(dirPath, filter);
  }, [filter, dirPath, refreshFiles]);

  const filtered = search
    ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;

  const handleDelete = useCallback(async (filePath: string) => {
    await api.deleteFile(filePath);
    if (dirPath) refreshFiles(dirPath, filter);
  }, [dirPath, filter, refreshFiles]);

  const handleOpenInExplorer = useCallback((filePath: string) => {
    api.openFolder(filePath);
  }, []);

  const handleClickFile = useCallback(async (file: FileEntry) => {
    setPreviewFile(file);
    if (file.type === 'subtitle') {
      try {
        const content = await api.readFile(file.path);
        setPreviewContent(content || '');
      } catch {
        setPreviewContent('');
      }
    } else {
      setPreviewContent('');
    }
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewFile(null);
    setPreviewContent('');
  }, []);

  // Initial state: no dir selected yet
  if (dirPath === null) {
    return (
      <div className="h-full flex items-center justify-center p-8 animate-fade-in">
        <div className="text-center">
          <FolderOpen className="mx-auto mb-4 text-[var(--text-secondary)] opacity-50" size={48} />
          <h2 className="text-[22px] font-medium text-[var(--text-primary)] mb-2">{t('files.title')}</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{t('files.empty')}</p>
          <Button variant="primary" onClick={pickDir}>
            <FolderOpen size={16} /> {t('files.openFolder')}
          </Button>
        </div>
      </div>
    );
  }

  const filters: { key: FileFilter; label: string }[] = [
    { key: 'all', label: t('files.all') },
    { key: 'audio', label: t('files.audio') },
    { key: 'video', label: t('files.video') },
    { key: 'subtitle', label: t('files.subtitle') },
  ];

  return (
    <div className="h-full flex p-8 gap-6 animate-fade-in">
      {/* Left: file list */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-medium text-[var(--text-primary)] shrink-0">{t('files.title')}</h2>
          <Button variant="secondary" size="sm" onClick={pickDir} title={dirPath}>
            <FolderOpen size={14} />
            <span className="max-w-[160px] truncate">{dirPath.split(/[/\\]/).pop() || dirPath}</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-3">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                filter === f.key
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-hover)]'
              }`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder={t('files.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* File list */}
        {filtered.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-0.5">
            {filtered.map((file) => (
              <div
                key={file.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] group transition-colors cursor-pointer ${
                  previewFile?.path === file.path ? 'bg-[var(--bg-hover)]' : ''
                }`}
                onClick={() => handleClickFile(file)}
              >
                {typeIcons[file.type]}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-[var(--text-primary)]">{file.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {formatFileSize(file.size)} · {formatDate(file.modifiedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenInExplorer(file.path); }}>
                    <ExternalLink size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(file.path); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={<FolderOpen size={40} />} title={t('files.empty')} />
          </div>
        )}
      </div>

      {/* Right: preview panel */}
      {previewFile && (
        <div className="w-[360px] shrink-0 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex flex-col animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{previewFile.name}</h3>
            <Button variant="ghost" size="sm" onClick={handleClosePreview}>✕</Button>
          </div>

          <div className="text-xs text-[var(--text-secondary)] space-y-1 mb-3">
            <p>{t('files.size')}: {formatFileSize(previewFile.size)}</p>
            <p>{t('files.date')}: {formatDate(previewFile.modifiedAt)}</p>
            <p className="truncate">{previewFile.path}</p>
          </div>

          {previewFile.type === 'subtitle' && previewContent ? (
            <div className="flex-1 bg-[var(--bg-primary)] rounded-lg p-3 overflow-y-auto font-mono text-xs whitespace-pre-wrap">
              {previewContent.slice(0, 10000)}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
              {typeIcons[previewFile.type]}
              <p>{previewFile.name}</p>
              <Button variant="secondary" size="sm" onClick={() => handleOpenInExplorer(previewFile.path)}>
                <ExternalLink size={12} /> {t('files.openFolder')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
