import { nativeTheme } from 'electron';

export function getSystemTheme(): 'light' | 'dark' {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}

export function onThemeChange(callback: (theme: 'light' | 'dark') => void): void {
  nativeTheme.on('updated', () => {
    callback(nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  });
}
