import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalDrillInVariants, backdropFadeVariants } from '../../utils/fluentMotion';

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

  const isVisible = showPrompt && !isStandalone;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
          <motion.div
            variants={backdropFadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          <motion.div
            variants={modalDrillInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-md bg-white dark:bg-[#111A2D] rounded-3xl p-6 shadow-2xl border border-[#E2E8F0] dark:border-[#253149] relative overflow-hidden z-10"
          >
            {/* Glow decorativo */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src="/logo-home.png"
                    alt="Home"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-contain shadow-lg border border-[#E2E8F0] dark:border-[#253149]"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0F172A] dark:text-[#F1F5F9] text-lg leading-tight">
                    Instalar Home
                  </h3>
                  <p className="text-xs font-semibold text-[#2563EB] dark:text-[#3478F6]">
                    Gestión de Servicios & Alertas
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full bg-[#EEF2F7] dark:bg-[#1B263B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] flex items-center justify-center transition active:scale-90"
                title="Cerrar"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-medium mb-5 leading-relaxed">
              Instalá la aplicación en tu pantalla de inicio para abrirla al instante y recibir <strong className="text-[#0F172A] dark:text-[#F1F5F9]">notificaciones de vencimiento</strong> automáticamente.
            </p>

            {isIOS ? (
              /* Instrucciones para iPhone / iPad */
              <div className="bg-[#EEF2F7]/50 dark:bg-[#1B263B]/50 rounded-2xl p-4 border border-[#E2E8F0] dark:border-[#253149] space-y-2.5 mb-4">
                <p className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  Cómo instalar en tu iPhone:
                </p>
                <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-[#2563EB] dark:text-[#3478F6] font-black flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Tocá el botón <strong>Compartir</strong> <i className="fa-solid fa-arrow-up-from-bracket text-[#2563EB] dark:text-[#3478F6] ml-1"></i> en Safari.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-[#2563EB] dark:text-[#3478F6] font-black flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Buscá y seleccioná <strong>"Agregar a pantalla de inicio"</strong>.</span>
                </div>
              </div>
            ) : (
              /* Botón de instalación nativa Android / Chrome / PC */
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 bg-[#2563EB] hover:bg-blue-700 dark:bg-[#3478F6] dark:hover:bg-[#2563EB] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 text-base transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Instalar Aplicación</span>
                </motion.button>

                {showAndroidGuide && (
                  <div className="bg-blue-50/80 dark:bg-blue-500/10 rounded-2xl p-3.5 border border-blue-200/60 dark:border-blue-500/20 text-xs text-[#64748B] dark:text-[#94A3B8] animate-fade-in space-y-1.5">
                    <p className="font-bold text-blue-900 dark:text-[#F1F5F9]">
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
              className="w-full mt-2 py-2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-colors text-center"
            >
              Quizás más tarde
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
