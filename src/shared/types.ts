export interface ExtractAudioArgs {
  filePaths: string[];
  outputDir?: string;
  autoTranscribe?: boolean;
  transcribeModelId?: string;
  transcribeLanguage?: string;
}

export interface TranscribeArgs {
  audioPath: string;
  modelId: string;
  language?: string;
  outputDir?: string;
}

export interface VideoToSubArgs {
  filePaths: string[];
  modelId: string;
  language?: string;
  outputDir?: string;
}

export interface TaskProgress {
  taskId: string;
  percent: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  message?: string;
}

export interface ExtractResult {
  taskId: string;
  inputPath: string;
  outputPath: string;
  success: boolean;
  error?: string;
}

export interface TranscribeResult {
  taskId: string;
  audioPath: string;
  json?: TranscriptionOutput;
  srt?: string;
  success: boolean;
  error?: string;
}

export interface TranscriptionOutput {
  transcription: TranscriptionSegment[];
}

export interface TranscriptionSegment {
  timestamps: { from: string; to: string };
  offsets: { from: number; to: number };
  text: string;
}

export interface FileEntry {
  name: string;
  path: string;
  size: number;
  ext: string;
  modifiedAt: number;
  type: 'audio' | 'video' | 'subtitle' | 'other';
}

export type TaskType = 'extract' | 'transcribe' | 'video-to-sub' | 'download-model';

export interface QueueTask {
  id: string;
  type: TaskType;
  label: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  percent: number;
  error?: string;
  createdAt: number;
  // extract fields
  inputPath?: string;
  outputPath?: string;
  // transcribe fields
  audioPath?: string;
  modelId?: string;
  language?: string;
  // chain
  autoTranscribe?: boolean;
  transcribeModelId?: string;
  transcribeLanguage?: string;
  // result
  jsonResult?: TranscriptionOutput;
  srtResult?: string;
  // video-to-sub: internal sub-tasks
  childTasks?: QueueTask[];
  // cancel
  cancelRequested?: boolean;
}

export interface QueueState {
  tasks: QueueTask[];
  paused: boolean;
  maxConcurrency: number;
}

export type ThemeMode = 'light' | 'dark';
