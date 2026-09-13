import { useState, useEffect } from 'react';

const applyThemeToDOM = (isDark) => {
  const root = window.document.documentElement;
  const color = isDark ? '#0f172a' : '#f8fafc';
  
  // 1. Alternar clase 'dark' para Tailwind y colorScheme nativo del navegador / SO
  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  // 2. Actualizar meta theme-color para Android (Chrome / WebAPK)
  // En Chromium Android WebAPK, re-insertar el elemento en el DOM fuerza la llamada IPC
  // nativa a StatusBarColorController de Android para repintar la barra de estado y cambiar iconos a negro/blanco
  let metaTheme = document.getElementById('theme-color-meta') || document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.id = 'theme-color-meta';
    metaTheme.name = 'theme-color';
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute('content', color);
  metaTheme.remove();
  document.head.appendChild(metaTheme);

  // 3. Actualizar meta apple-mobile-web-app-status-bar-style para iOS Safari y WebViews
  let appleMeta = document.getElementById('apple-status-bar-meta') || document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleMeta) {
    appleMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
  }
};

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    applyThemeToDOM(darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return [darkMode, toggleDarkMode];
};
