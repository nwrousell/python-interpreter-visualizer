import { useState, useEffect } from 'preact/hooks';

// Hook for dark mode with system preference detection
export function useDarkMode() {
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem('theme');
    if (saved) return saved;
    return 'auto'; // default to auto (follow system)
  });

  useEffect(() => {
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  // Determine actual theme (light or dark) based on setting
  const actualTheme = (() => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  })();

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // Force re-render by setting theme to itself
      setTheme('auto');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return [theme, setTheme, actualTheme];
}
