import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/ipc';
import type { QueueState, QueueTask } from '../../shared/types';

export function useTaskQueue() {
  const [state, setState] = useState<QueueState>({ tasks: [], paused: false, maxConcurrency: 1 });

  useEffect(() => {
    if (!api) return;
    // Initial load
    api.getQueueState().then(setState).catch(() => {});
    // Listen for changes
    const unsub = api.onQueueStateChanged(setState);
    // Poll every 1s as safety net
    const interval = setInterval(() => {
      api.getQueueState().then(setState).catch(() => {});
    }, 1000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  const pause = useCallback(() => api.pauseQueue(), []);
  const resume = useCallback(() => api.resumeQueue(), []);
  const removeTask = useCallback((id: string) => api.removeQueueTask(id), []);
  const retryTask = useCallback((id: string) => api.retryQueueTask(id), []);
  const cancelTask = useCallback((id: string) => api.cancelTask(id), []);

  return { state, pause, resume, removeTask, retryTask, cancelTask };
}
