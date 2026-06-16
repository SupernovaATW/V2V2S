import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pause, Play, X, RotateCcw, ListChecks, ArrowRight, Music, Mic, Clapperboard, Download } from 'lucide-react';
import { Button } from '../shared/Button';
import { ProgressBar } from '../shared/ProgressBar';
import { StatusBadge } from '../shared/StatusBadge';
import { EmptyState } from '../shared/EmptyState';
import { useTaskQueue } from '../../hooks/useTaskQueue';

const typeIcons: Record<string, React.ReactNode> = {
  extract: <Music size={14} />,
  transcribe: <Mic size={14} />,
  'video-to-sub': <Clapperboard size={14} />,
  'download-model': <Download size={14} />,
};

export function QueuePanel() {
  const { t } = useTranslation();
  const { state, pause, resume, removeTask, retryTask } = useTaskQueue();

  const hasActive = state.tasks.some((t) => t.status === 'running');
  const taskTypeLabel = (type: string) => {
    if (type === 'extract') return t('queue.taskExtract');
    if (type === 'transcribe') return t('queue.taskTranscribe');
    if (type === 'video-to-sub') return t('queue.taskVideoToSub');
    if (type === 'download-model') return t('queue.taskDownloadModel');
    return type;
  };

  return (
    <div className="h-full flex flex-col p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-[22px] font-medium text-[var(--text-primary)]">{t('queue.title')}</h2>
          {state.tasks.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-secondary)]">
              {state.tasks.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActive && (
            state.paused ? (
              <Button variant="secondary" size="sm" onClick={resume}>
                <Play size={14} /> {t('queue.resume')}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={pause}>
                <Pause size={14} /> {t('queue.pause')}
              </Button>
            )
          )}
        </div>
      </div>

      {state.tasks.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-2">
          {state.tasks.map((task) => (
            <div
              key={task.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 animate-slide-up"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                      {typeIcons[task.type]}
                      {taskTypeLabel(task.type)}
                    </span>
                    <p className="text-sm truncate text-[var(--text-primary)]">{task.label}</p>
                  </div>

                  {/* Show substeps for video-to-sub */}
                  {task.type === 'video-to-sub' && task.childTasks && task.childTasks.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 ml-2 text-xs text-[var(--text-secondary)]">
                      {task.childTasks.map((child, i) => (
                        <React.Fragment key={child.id}>
                          {i > 0 && <ArrowRight size={10} />}
                          <span className={`px-1.5 py-0.5 rounded ${
                            child.status === 'completed' ? 'bg-[rgba(93,184,114,0.15)] text-[var(--success)]' :
                            child.status === 'running' ? 'bg-[rgba(204,120,92,0.15)] text-[var(--accent)]' :
                            'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                          }`}>
                            {child.type === 'extract' ? t('queue.stepExtract') : t('queue.stepTranscribe')}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {task.status === 'running' && (
                    <ProgressBar percent={task.percent} className="mt-2" />
                  )}
                  {task.error && (
                    <p className="text-xs text-[var(--error)] mt-1 truncate">{task.error}</p>
                  )}
                </div>

                <StatusBadge status={task.status} />

                <div className="flex items-center gap-0.5">
                  {task.status === 'failed' && (
                    <Button variant="ghost" size="sm" onClick={() => retryTask(task.id)}>
                      <RotateCcw size={14} />
                    </Button>
                  )}
                  {(task.status === 'queued' || task.status === 'failed' || task.status === 'completed') && (
                    <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon={<ListChecks size={40} />} title={t('queue.empty')} />
        </div>
      )}
    </div>
  );
}
