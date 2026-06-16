export interface ModelDefinition {
  id: string;
  name: string;
  filename: string;
  sizeBytes: number;
  url: string;
  bundled: boolean;
  multilingual: boolean;
}

export const MODELS: ModelDefinition[] = [
  {
    id: 'small',
    name: 'Small',
    filename: 'ggml-small.bin',
    sizeBytes: 466_000_000,
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
    bundled: true,
    multilingual: true,
  },
  {
    id: 'medium',
    name: 'Medium',
    filename: 'ggml-medium.bin',
    sizeBytes: 1_530_000_000,
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin',
    bundled: false,
    multilingual: true,
  },
  {
    id: 'large-v3',
    name: 'Large v3',
    filename: 'ggml-large-v3.bin',
    sizeBytes: 3_090_000_000,
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin',
    bundled: false,
    multilingual: true,
  },
];
