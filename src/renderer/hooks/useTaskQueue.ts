import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/ipc';
import type { QueueState, QueueTask } from '../../shared/types';

export function useTaskQueue() {
  const [state, setState] = useState<QueueState>({ tasks: [], paused: false, maxConcurrency: 1 });

  useEffect(() => {
    if (!api) return;
    const load = async () => {
      const s = await api.getQueueState();
      setState(s);
    };
    load();

    // Full state sync
    const unsub = api.onQueueStateChanged((s) => { setState(s); });

    // Live progress updates for individual tasks
    const unsubProg = api.onQueueTaskProgress((p: any) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === p.taskId ? { ...t, percent: p.percent, status: p.status } : t
        ),
      }));
    });

    return () => { unsub(); unsubProg(); };
  }, []);

  const pause = useCallback(() => api.pauseQueue(), []);
  const resume = useCallback(() => api.resumeQueue(), []);
  const removeTask = useCallback((id: string) => api.removeQueueTask(id), []);
  const retryTask = useCallback((id: string) => api.retryQueueTask(id), []);
  const cancelTask = useCallback((id: string) => api.cancelTask(id), []);

  return { state, pause, resume, removeTask, retryTask, cancelTask };
}
