import { useState, useEffect, useMemo } from 'react';

export const THEME_COLOR_LIGHT = '#f8fafc'; // bg-slate-50 — idéntico al HeaderMobile y fondo en modo claro
export const THEME_COLOR_DARK  = '#0f172a'; // bg-slate-900 — idéntico al HeaderMobile y fondo en modo oscuro

export const applyThemeToDOM = (isDark) => {
  const root = window.document.documentElement;
  const themeColor = isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
  
  // 1. Alternar clase 'dark' para Tailwind y colorScheme nativo
  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  // 2. Sincronizar etiqueta meta color-scheme
  let colorSchemeMeta = document.getElementById('color-scheme-meta') || document.querySelector('meta[name="color-scheme"]');
  if (colorSchemeMeta) {
    colorSchemeMeta.setAttribute('content', isDark ? 'dark' : 'light');
  } else {
    colorSchemeMeta = document.createElement('meta');
    colorSchemeMeta.name = 'color-scheme';
    colorSchemeMeta.id = 'color-scheme-meta';
    colorSchemeMeta.content = isDark ? 'dark' : 'light';
    colorSchemeMeta.setAttribute('content', isDark ? 'dark' : 'light');
    document.head.appendChild(colorSchemeMeta);
  }

  // 3. Actualizar meta apple-mobile-web-app-status-bar-style para iOS Safari
  const appleMeta = document.getElementById('apple-status-bar-meta') || document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleMeta) {
    appleMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
  }

  // 4. Actualizar theme-color para la barra de estado del sistema (mismo color que el header)
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
  // Modo seleccionado por el usuario: 'light', 'dark' o 'system'
  // Por defecto al descargar/abrir de cero es 'light' (Modo Claro)
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('theme_mode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    // Soporte para valor legacy 'darkMode'
    const legacy = localStorage.getItem('darkMode');
    if (legacy !== null) {
      try {
        return JSON.parse(legacy) ? 'dark' : 'light';
      } catch (e) {}
    }
    return 'light'; // Predeterminado: Modo Claro
  });

  // Estado del sistema operativo
  const [systemIsDark, setSystemIsDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Escuchar cambios del sistema en tiempo real
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => setSystemIsDark(e.matches);

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  // Determinar si está activo el modo oscuro
  const darkMode = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemIsDark; // 'system'
  }, [themeMode, systemIsDark]);

  // Sincronizar entre pestañas/ventanas
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'theme_mode' && e.newValue) {
        if (e.newValue === 'light' || e.newValue === 'dark' || e.newValue === 'system') {
          setThemeMode(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Aplicar cambios al DOM y persistir
  useEffect(() => {
    applyThemeToDOM(darkMode);
    localStorage.setItem('theme_mode', themeMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode, themeMode]);

  const toggleDarkMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return [darkMode, toggleDarkMode, themeMode, setThemeMode];
};
