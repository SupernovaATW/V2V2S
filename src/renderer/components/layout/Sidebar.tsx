import React from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Mic, Clapperboard, ListChecks, Sun, Moon, Languages } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Sidebar({ activePage, onPageChange, theme, onToggleTheme }: SidebarProps) {
  const { t, i18n } = useTranslation();

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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--border)] space-y-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Languages size={14} />
          {i18n.language === 'zh-CN' ? 'English' : '中文'}
        </button>
        <button
          className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>
    </aside>
  );
}
