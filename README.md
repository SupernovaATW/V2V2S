# V2V2S — Video to Audio to Subtitles

视频转音频 · 音频转字幕。一站式桌面工具，从视频中提取音频，并将音频识别为字幕。

## 功能

| 功能 | 说明 |
|------|------|
| 🎬 **视频转音频** | 从视频中提取音频轨道，保持原始采样率和声道，支持批量队列处理 |
| 🎵 **音频转字幕** | 将音频识别为字幕，同时输出 JSON（AI 格式，含毫秒时间戳）和 SRT（标准字幕） |
| 🎥 **视频转字幕** | 视频直接生成字幕，自动完成提取音频 → 语音识别，一步到位 |

## 特性

- 暗色/浅色主题跟随系统自动切换，支持手动切换
- 中英文双语界面
- Smart 模型内置 (~466MB)，Medium / Large v3 可选下载
- 所有任务统一管理，支持暂停/恢复/取消/重试
- 提取后可自动链式转录，省去手动步骤
- whisper.cpp 本地推理，无需联网

## 安装

从 [Releases](../../releases) 下载 `V2V2S Setup x.x.x.exe`，双击安装。

## 开发环境

### 前提条件

- Node.js ≥ 20
- npm ≥ 10

### 获取二进制依赖

运行前需要准备 FFmpeg 和 whisper.cpp Windows 可执行文件：

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

以及 Whisper 模型：

```
models/
└── ggml-small.bin      # 内置模型 (~466MB)
```

模型可从 [HuggingFace](https://huggingface.co/ggerganov/whisper.cpp) 下载。

### 开发

```bash
npm install
npm start
```

### 打包

```bash
npm run dist
```

打包产物在 `dist/` 目录。

## 技术栈

- **框架**: Electron + React + TypeScript
- **样式**: Tailwind CSS
- **国际化**: i18next
- **音频提取**: FFmpeg
- **语音识别**: whisper.cpp + ggml-small.bin

## License

MIT
