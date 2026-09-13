import React, { useState, useEffect } from 'react';

export const InstallPromptModal = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(() => window.__pwaDeferredPrompt || null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  useEffect(() => {
    // 1. Verificar si ya está corriendo como app instalada (PWA standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    if (standalone) return; // Si ya está instalada, no mostramos nada

    // 2. Detección de iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 3. Revisar si ya capturamos el evento antes de que React cargara
    if (window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    // 4. Capturar eventos nativos y custom
    const handleCaptured = () => {
      if (window.__pwaDeferredPrompt) {
        setDeferredPrompt(window.__pwaDeferredPrompt);
      }
    };

    const isDismissed = () => {
      try {
        return sessionStorage.getItem('home_pwa_dismissed') === 'true';
      } catch {
        return false;
      }
    };

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.__pwaDeferredPrompt = e;
      setDeferredPrompt(e);
      if (!isDismissed()) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-captured', handleCaptured);

    // 5. Temporizador de apertura automática para dispositivos no instalados
    const timer = setTimeout(() => {
      if (!isDismissed()) {
        setShowPrompt(true);
      }
    }, 1200);

    // 6. Ocultar si se completa la instalación
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
      setIsStandalone(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 7. Disparar desde menú de ajustes
    const handleCustomTrigger = () => {
      setShowAndroidGuide(false);
      setShowPrompt(true);
    };
    window.addEventListener('trigger-pwa-install', handleCustomTrigger);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-captured', handleCaptured);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('trigger-pwa-install', handleCustomTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.__pwaDeferredPrompt;

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
          setIsStandalone(true);
        }
      } catch (err) {
        console.error('Error al solicitar instalación PWA:', err);
      }
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
    } else {
      // Si por alguna política interna de Chrome el evento no fue provisto aún:
      setShowAndroidGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('home_pwa_dismissed', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-white/10 popup-animate relative overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src="/logo-home.png"
                alt="Home"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-contain shadow-lg border border-slate-100 dark:border-white/10"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight">
                Instalar Home
              </h3>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Gestión de Servicios & Alertas
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition active:scale-90"
            title="Cerrar"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-5 leading-relaxed">
          Instalá la aplicación en tu pantalla de inicio para abrirla al instante y recibir <strong className="text-slate-900 dark:text-white">notificaciones de vencimiento</strong> automáticamente.
        </p>

        {isIOS ? (
          /* Instrucciones para iPhone / iPad */
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-white/5 space-y-2.5 mb-4">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Cómo instalar en tu iPhone:
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-[11px] shrink-0">1</span>
              <span>Tocá el botón <strong>Compartir</strong> <i className="fa-solid fa-arrow-up-from-bracket text-blue-500 ml-1"></i> en Safari.</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-[11px] shrink-0">2</span>
              <span>Buscá y seleccioná <strong>"Agregar a pantalla de inicio"</strong>.</span>
            </div>
          </div>
        ) : (
          /* Botón de instalación nativa Android / Chrome / PC */
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 text-base transition-all cursor-pointer"
            >
              <i className="fa-solid fa-download"></i>
              <span>Instalar Aplicación</span>
            </button>

            {showAndroidGuide && (
              <div className="bg-blue-50/80 dark:bg-blue-500/10 rounded-2xl p-3.5 border border-blue-200/60 dark:border-blue-500/20 text-xs text-slate-600 dark:text-slate-300 animate-fade-in space-y-1.5">
                <p className="font-bold text-blue-900 dark:text-blue-200">
                  Si tu navegador no abrió el diálogo:
                </p>
                <p>
                  Tocá los <strong>3 puntitos (⋮)</strong> arriba a la derecha en Chrome y seleccioná <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleDismiss}
          className="w-full mt-2 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-center"
        >
          Quizás más tarde
        </button>
      </div>
    </div>
  );
};
