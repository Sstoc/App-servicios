import React, { useState, useEffect } from 'react';

export const InstallPromptModal = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar si ya está corriendo como app instalada (PWA standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    if (standalone) return; // Si ya está instalada, nunca mostrar nada

    // Detección de iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Capturar el evento nativo de instalación en Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Si el usuario no lo descartó en las últimas 24hs, mostrar automáticamente
      const dismissed = localStorage.getItem('home_pwa_dismissed');
      if (!dismissed || Date.now() - Number(dismissed) > 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // En iOS, como Safari no tiene beforeinstallprompt, lo mostramos tras 2 segundos si no fue descartado
    if (isAppleDevice && !standalone) {
      const dismissed = localStorage.getItem('home_pwa_dismissed');
      if (!dismissed || Date.now() - Number(dismissed) > 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => setShowPrompt(true), 2500);
        return () => clearTimeout(timer);
      }
    }

    // Ocultar si se completa la instalación
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    const handleCustomTrigger = () => setShowPrompt(true);
    window.addEventListener('trigger-pwa-install', handleCustomTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('trigger-pwa-install', handleCustomTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Si no hay evento nativo disponible (ej: Firefox o navegador restringido), alertar cómo hacerlo
      alert("Para instalar la app: abrí el menú de tu navegador (los 3 puntitos arriba a la derecha) y seleccioná 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('home_pwa_dismissed', String(Date.now()));
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-white/10 popup-animate relative overflow-hidden">
        {/* Glow decorativo de fondo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src="/logo-home.png"
                alt="Home"
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-contain shadow-lg border border-slate-100 dark:border-white/10"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
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
          Instalá la aplicación en tu pantalla de inicio para abrirla como una app nativa, acceder más rápido y recibir <strong className="text-slate-900 dark:text-white">notificaciones de vencimiento</strong> automáticamente.
        </p>

        {isIOS ? (
          /* Instrucciones específicas para iPhone / iPad */
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
          <div className="space-y-2">
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 text-base transition-all"
            >
              <i className="fa-solid fa-download"></i>
              <span>Instalar Aplicación</span>
            </button>
          </div>
        )}

        <button
          onClick={handleDismiss}
          className="w-full mt-2.5 py-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-center"
        >
          Quizás más tarde
        </button>
      </div>
    </div>
  );
};
