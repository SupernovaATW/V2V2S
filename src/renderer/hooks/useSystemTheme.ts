import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/ipc';

export function useSystemTheme(): { theme: 'light' | 'dark'; toggle: () => void } {
  const getSystem = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [theme, setTheme] = useState<'light' | 'dark'>(getSystem);

  // Follow system theme changes
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const sys = getSystem();
      setTheme(sys);
      api.updateTitleBar(sys);
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Apply CSS class and update overlay (does NOT lock theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    api.updateTitleBar(theme);
  }, [theme]);

  // Manual toggle: locks theme on Electron side
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      api.setTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
