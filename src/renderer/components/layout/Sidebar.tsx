import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Mic, Clapperboard, ListChecks, Sun, Moon, Languages, Download, ChevronDown, Check } from 'lucide-react';
import { useModelManager } from '../../hooks/useModelManager';
import { formatFileSize } from '../../lib/formatters';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const btnClass = "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]";

export function Sidebar({ activePage, onPageChange, theme, onToggleTheme, selectedModel, onModelChange }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const { models, download } = useModelManager();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayModels = models.length > 0
    ? models
    : [{ id: 'small', name: 'Small', sizeBytes: 466_000_000, bundled: true, downloaded: true, multilingual: true, filename: 'ggml-small.bin', url: '' }];

  const selected = displayModels.find((m) => m.id === selectedModel);
  const canDownload = selected && !selected.downloaded && !selected.bundled;

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const navItems = [
    { id: 'extract', icon: Music, label: t('nav.extract') },
    { id: 'audioToSub', icon: Mic, label: t('nav.audioToSub') },
    { id: 'videoToSub', icon: Clapperboard, label: t('nav.videoToSub') },
    { id: 'queue', icon: ListChecks, label: t('nav.queue') },
  ];

  const toggleLanguage = () => {
    const next = i18n.language === 'zh-CN' ? 'en' : 'zh-CN';
    i18n.changeLanguage(next);
  };

  return (
    <aside className="w-[240px] h-full flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border)] select-none">
      <div className="px-5 pt-6 pb-6">
        <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{t('app.name')}</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('app.subtitle')}</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`${btnClass} ${
                isActive
                  ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                  : ''
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-[var(--border)] space-y-1.5">
        {/* Custom Model Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className={`${btnClass} justify-between w-full`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="flex items-center gap-2">
              <Download size={14} className="opacity-70" />
              Model
            </span>
            <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 bottom-full mb-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in">
              {displayModels.map((m) => {
                const isSel = selectedModel === m.id;
                const downloaded = m.downloaded || m.bundled;
                return (
                  <button
                    key={m.id}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      isSel
                        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                    onClick={() => {
                      onModelChange(m.id);
                      setDropdownOpen(false);
                    }}
                  >
                    <span>{m.name}</span>
                    <span className="text-[var(--text-secondary)] text-[10px] ml-2">{formatFileSize(m.sizeBytes)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Download button */}
        {canDownload && (
          <button
            className={`${btnClass} !text-[var(--accent)] hover:!text-[var(--accent-hover)]`}
            onClick={() => download(selectedModel)}
          >
            <Download size={14} />
            {t('model.modelDownload')}
          </button>
        )}

        {/* Language toggle */}
        <button onClick={toggleLanguage} className={btnClass}>
          <Languages size={14} />
          {i18n.language === 'zh-CN' ? 'English' : '中文'}
        </button>

        {/* Theme toggle */}
        <button onClick={onToggleTheme} className={btnClass}>
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>
    </aside>
  );
}
