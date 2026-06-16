export const IPC = {
  // Audio Extraction
  AUDIO_EXTRACT_START: 'audio:extract-start',
  AUDIO_EXTRACT_PROGRESS: 'audio:extract-progress',
  AUDIO_EXTRACT_COMPLETE: 'audio:extract-complete',

  // Transcription
  TRANSCRIBE_START: 'transcribe:start',
  TRANSCRIBE_PROGRESS: 'transcribe:progress',
  TRANSCRIBE_COMPLETE: 'transcribe:complete',

  // Video-to-Sub (extract + transcribe in one step)
  VIDEO_TO_SUB_START: 'video-to-sub:start',

  // Model Management
  MODELS_LIST: 'models:list',
  MODELS_DOWNLOAD: 'models:download',
  MODELS_DOWNLOAD_PROGRESS: 'models:download-progress',
  MODELS_CANCEL_DOWNLOAD: 'models:cancel-download',

  // Task Queue
  QUEUE_ADD_TASK: 'queue:add-task',
  QUEUE_REMOVE_TASK: 'queue:remove-task',
  QUEUE_PAUSE: 'queue:pause',
  QUEUE_RESUME: 'queue:resume',
  QUEUE_RETRY_TASK: 'queue:retry-task',
  QUEUE_GET_STATE: 'queue:get-state',
  QUEUE_TASK_PROGRESS: 'queue:task-progress',
  QUEUE_TASK_COMPLETED: 'queue:task-completed',
  QUEUE_TASK_FAILED: 'queue:task-failed',
  QUEUE_STATE_CHANGED: 'queue:state-changed',

  // File Management
  FILES_LIST: 'files:list',
  FILES_DELETE: 'files:delete',
  FILES_OPEN_FOLDER: 'files:open-folder',
  FILES_WRITE: 'files:write',
  FILES_READ: 'files:read',

  // Dialog
  DIALOG_OPEN: 'dialog:open',
  DIALOG_SAVE: 'dialog:save',
  DIALOG_OPEN_DIR: 'dialog:open-dir',

  // App
  APP_GET_THEME: 'app:get-theme',
  APP_THEME_CHANGED: 'app:theme-changed',
  APP_GET_PATH: 'app:get-path',
} as const;
