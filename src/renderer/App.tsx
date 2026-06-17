import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSystemTheme } from './hooks/useSystemTheme';
import logoUrl from './assets/logo.png';
import { Sidebar } from './components/layout/Sidebar';
import { AudioExtractionPanel } from './components/audio/AudioExtractionPanel';
import { TranscriptionPanel } from './components/transcription/TranscriptionPanel';
import { VideoToSubPanel } from './components/video-to-sub/VideoToSubPanel';
import { QueuePanel } from './components/queue/QueuePanel';

export default function App() {
  const { theme, toggle: toggleTheme } = useSystemTheme();
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState('extract');
  const [selectedModel, setSelectedModel] = useState('small');

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      <div className="h-10 bg-[var(--bg-sidebar)] flex items-center justify-center gap-2 titlebar-drag shrink-0">
        <img src={logoUrl} alt="V2V2S" className="h-5 w-5 object-contain" />
        <span className="text-xs font-medium text-[var(--text-secondary)]">V2V2S — {t('app.subtitle')}</span>
      </div>
      <div className="h-[1px] bg-[var(--border)] shrink-0" />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activePage={activePage}
          onPageChange={setActivePage}
          theme={theme}
          onToggleTheme={toggleTheme}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
        <main className="flex-1 overflow-hidden bg-[var(--bg-primary)]">
          <div className={activePage === 'extract' ? '' : 'hidden'}>
            <AudioExtractionPanel modelId={selectedModel} />
          </div>
          <div className={activePage === 'audioToSub' ? '' : 'hidden'}>
            <TranscriptionPanel modelId={selectedModel} />
          </div>
          <div className={activePage === 'videoToSub' ? '' : 'hidden'}>
            <VideoToSubPanel modelId={selectedModel} />
          </div>
          <div className={activePage === 'queue' ? '' : 'hidden'}>
            <QueuePanel />
          </div>
        </main>
      </div>
    </div>
  );
}
