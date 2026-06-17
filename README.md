[中文版本](./README.zh-CN.md)

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
