import type { QueueTask, QueueState, TaskType } from '../../shared/types';

type QueueListener = (state: QueueState) => void;
type TaskExecutor = (task: QueueTask) => Promise<void>;

export class TaskQueueService {
  private tasks: QueueTask[] = [];
  private paused = false;
  private maxConcurrency = 1;
  private activeCount = 0;
  private listeners: Set<QueueListener> = new Set();
  private taskExecutors: Map<TaskType, TaskExecutor> = new Map();

  registerExecutor(type: TaskType, executor: TaskExecutor): void {
    this.taskExecutors.set(type, executor);
  }

  setMaxConcurrency(n: number): void {
    this.maxConcurrency = Math.max(1, n);
  }

  addTask(task: QueueTask): void {
    this.tasks.push(task);
    this.emit();
    this.processNext();
  }

  addTasks(tasks: QueueTask[]): void {
    this.tasks.push(...tasks);
    this.emit();
    this.processNext();
  }

  removeTask(taskId: string): boolean {
    const idx = this.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return false;
    const task = this.tasks[idx];
    if (task.status === 'running') return false;
    task.status = 'cancelled';
    this.tasks.splice(idx, 1);
    this.emit();
    return true;
  }

  pause(): void {
    this.paused = true;
    this.emit();
  }

  resume(): void {
    this.paused = false;
    this.emit();
    this.processNext();
  }

  retryTask(taskId: string): boolean {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'failed') return false;
    task.status = 'queued';
    task.percent = 0;
    task.error = undefined;
    this.emit();
    this.processNext();
    return true;
  }

  getState(): QueueState {
    return {
      tasks: [...this.tasks],
      paused: this.paused,
      maxConcurrency: this.maxConcurrency,
    };
  }

  onStateChange(listener: QueueListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyChange(): void {
    this.emit();
  }

  private emit(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      try { listener(state); } catch { /* ignore */ }
    }
  }

  private async processNext(): Promise<void> {
    if (this.paused) return;
    if (this.activeCount >= this.maxConcurrency) return;

    const task = this.tasks.find((t) => t.status === 'queued');
    if (!task) return;

    task.status = 'running';
    this.activeCount++;
    this.emit();

    try {
      const executor = this.taskExecutors.get(task.type);
      if (executor) {
        await executor(task);
      }
      task.status = 'completed';
      task.percent = 100;
    } catch (err: any) {
      console.error('[TaskQueue] Failed:', task.type, task.label, err?.message || err);
      task.status = 'failed';
      task.error = err?.message || String(err);
    } finally {
      this.activeCount--;
      this.emit();
      this.processNext();
    }
  }
}

export const taskQueue = new TaskQueueService();
