import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { VitePlugin } from '@electron-forge/plugin-vite';
import path from 'path';
import fs from 'fs';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'V2V2S',
    executableName: 'V2V2S',
    icon: path.join(__dirname, 'assets', 'logo.png'),
    extraResource: [
      path.join(__dirname, 'resources', 'ffmpeg', 'win32-x64'),
      path.join(__dirname, 'resources', 'whisper', 'win32-x64'),
      path.join(__dirname, 'models'),
    ],
    asar: true,
  },
  makers: [
    new MakerZIP({}, ['win32']),
    new MakerSquirrel({
      name: 'V2V2S',
      setupIcon: path.join(__dirname, 'assets', 'logo.png'),
    }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        { entry: 'src/main/index.ts', config: 'vite.main.config.ts', target: 'main' },
        { entry: 'src/preload/index.ts', config: 'vite.preload.config.ts', target: 'preload' },
      ],
      renderer: [
        { name: 'main_window', config: 'vite.renderer.config.ts' },
      ],
    }),
  ],
};

export default config;
