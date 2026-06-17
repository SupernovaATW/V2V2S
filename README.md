[中文版本](#v2v2s----视频转音频--音频转字幕)

# V2V2S — Video to Audio to Subtitles

A one-stop desktop tool: extract audio from video, transcribe audio to subtitles.

## Features

| Function | Description |
|----------|-------------|
| 🎬 **Video to Audio** | Extract audio tracks from video files, preserving original quality. Batch processing with queue. |
| 🎵 **Audio to Subtitles** | Transcribe audio using whisper.cpp. Outputs both JSON (AI-friendly, with millisecond timestamps) and SRT (standard subtitles). |
| 🎥 **Video to Subtitles** | Direct video-to-subtitle conversion. Extracts audio then transcribes automatically, without leaving intermediate files. |

## Highlights

- 🌓 Dark/light theme follows system, with manual toggle
- 🌐 Bilingual UI: English / 简体中文
- 🧠 **Small** model built-in (~466 MB). Medium & Large v3 available for download
- 📋 Unified task queue: pause, cancel, retry. Progress bars for all operations
- 🔗 Auto-transcribe: extract audio and transcribe in one go
- 🖥️ whisper.cpp runs locally, no internet required for inference

## Install

Download `V2V2S Setup x.x.x.exe` from [Releases](../../releases) and run the installer.

## Dev

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Setup

Place FFmpeg and whisper.cpp Windows binaries under `resources/`:

```
resources/
├── ffmpeg/win32-x64/
│   ├── ffmpeg.exe
│   ├── ffprobe.exe
│   └── *.dll
└── whisper/win32-x64/
    ├── whisper-cli.exe
    └── *.dll
```

Place a whisper model in `models/`:

```
models/
└── ggml-small.bin    # bundled model (~466 MB)
```

Models can be downloaded from [HuggingFace](https://huggingface.co/ggerganov/whisper.cpp).

### Start

```bash
npm install
npm start
```

### Build

```bash
npm run dist
```

Output: `dist/V2V2S Setup 1.0.0.exe`

## Tech

- **Framework**: Electron + React + TypeScript
- **Styling**: Tailwind CSS
- **i18n**: i18next
- **Audio**: FFmpeg
- **ASR**: whisper.cpp + ggml-small.bin

## License

MIT

---

# V2V2S — 视频转音频 · 音频转字幕

一站式桌面工具：从视频提取音频，将音频识别为字幕。

## 功能

| 功能 | 说明 |
|------|------|
| 🎬 **视频转音频** | 从视频提取音频轨道，保持原始质量，支持批量队列 |
| 🎵 **音频转字幕** | whisper.cpp 本地识别，同时输出 JSON（AI 友好，毫秒级时间戳）和 SRT（标准字幕） |
| 🎥 **视频转字幕** | 视频直接转字幕，自动提取→识别，不留中间文件 |

## 亮点

- 🌓 深色/浅色主题跟随系统，可手动切换
- 🌐 中英双语界面
- 🧠 内置 **Small** 模型 (~466 MB)，Medium / Large v3 可选下载
- 📋 统一任务队列：暂停、取消、重试，所有操作带进度条
- 🔗 链式转录：提取音频后可自动转字幕
- 🖥️ whisper.cpp 本地推理，无需联网

## 安装

从 [Releases](../../releases) 下载 `V2V2S Setup x.x.x.exe`，双击安装。

## 技术栈

- **框架**: Electron + React + TypeScript
- **样式**: Tailwind CSS
- **国际化**: i18next
- **音频**: FFmpeg
- **语音识别**: whisper.cpp + ggml-small.bin

## License

MIT
