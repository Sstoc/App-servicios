import { useState, useEffect } from 'react';

const THEME_COLOR_LIGHT = '#f8fafc'; // bg-slate-50 — exacto del HeaderMobile en claro
const THEME_COLOR_DARK  = '#0f172a'; // bg-slate-900 — exacto del HeaderMobile en oscuro

const applyThemeToDOM = (isDark) => {
  const root = window.document.documentElement;
  
  // 1. Alternar clase 'dark' para Tailwind y colorScheme nativo del navegador / SO
  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  // 2. Actualizar meta apple-mobile-web-app-status-bar-style para iOS Safari
  const appleMeta = document.getElementById('apple-status-bar-meta') || document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleMeta) {
    appleMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
  }

  // 3. Actualizar theme-color para la barra de notificaciones en Android/Chrome y PWA
  const themeColor = isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (metas.length > 0) {
    metas.forEach(meta => {
      meta.setAttribute('content', themeColor);
      meta.content = themeColor;
    });
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.id = 'theme-color-meta';
    meta.content = themeColor;
    meta.setAttribute('content', themeColor);
    document.head.appendChild(meta);
  }
};

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Escuchar cambios de tema del sistema operativo solo si el usuario no eligió manualmente
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  useEffect(() => {
    applyThemeToDOM(darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return [darkMode, toggleDarkMode];
};
