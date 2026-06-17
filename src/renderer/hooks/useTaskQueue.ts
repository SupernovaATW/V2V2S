import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/ipc';
import type { QueueState, QueueTask } from '../../shared/types';

export function useTaskQueue() {
  const [state, setState] = useState<QueueState>({ tasks: [], paused: false, maxConcurrency: 1 });

  useEffect(() => {
    if (!api) return;
    api.getQueueState().then(setState).catch(() => {});
    const unsub1 = api.onQueueStateChanged(setState);
    return () => { unsub1(); };
  }, []);

  const pause = useCallback(() => api.pauseQueue(), []);
  const resume = useCallback(() => api.resumeQueue(), []);
  const removeTask = useCallback((id: string) => api.removeQueueTask(id), []);
  const retryTask = useCallback((id: string) => api.retryQueueTask(id), []);
  const cancelTask = useCallback((id: string) => api.cancelTask(id), []);

  return { state, pause, resume, removeTask, retryTask, cancelTask };
}
