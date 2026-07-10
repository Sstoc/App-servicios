import React, { useState } from 'react';
import { Button } from '../ui';

export const HeaderMobile = React.memo(({ view, getPageTitle, toggleBalance, showBalance, darkMode, toggleDarkMode, openModal, signOut, user, pushEnabled, requestPushPermission, syncStatus }) => {
  const [openSettings, setOpenSettings] = useState(false);

  React.useEffect(() => {
    const handleClose = () => { if (openSettings) setOpenSettings(false); };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [openSettings]);

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <span className="flex items-center text-indigo-500 dark:text-indigo-400 animate-pulse" title="Sincronizando con Supabase...">
            <i className="fa-solid fa-cloud text-[10px]"></i>
          </span>
        );
      case 'synced':
        return (
          <span className="flex items-center text-slate-400/40 dark:text-slate-500/40 transition-opacity duration-500" title="Sincronizado con Supabase">
            <i className="fa-solid fa-cloud text-[10px]"></i>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center text-rose-500/80 dark:text-rose-400/80" title="Sin conexión - Guardado local">
            <i className="fa-solid fa-cloud-bolt text-[10px]"></i>
          </span>
        );
      default:
        return (
          <span className="flex items-center text-slate-300/30 dark:text-slate-700/30" title="Listo">
            <i className="fa-solid fa-cloud text-[10px]"></i>
          </span>
        );
    }
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40">
      {/* Barra sólida: mismo color que el fondo del app → sin backdrop-blur → sin lag en Android */}
      <div className="bg-slate-50 dark:bg-slate-900 px-4 pt-4 pb-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/logo-home.png" alt="Logo" className="w-8 h-8 object-contain rounded-lg shadow-md border border-white/5" />
            <div className="absolute -inset-1 bg-indigo-500/10 rounded-lg blur-[3px] -z-10"></div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Home</h1>
            <div className="flex items-center pt-0.5">{getSyncIcon()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBalance}
            className="text-slate-500 dark:text-slate-400 w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition bg-slate-200/60 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/5"
          >
            <i className={showBalance ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}></i>
          </button>

          <div className="relative">
            <button
              id="mobile-settings-btn"
              onClick={(e) => { e.stopPropagation(); setOpenSettings(!openSettings); }}
              className="text-slate-500 dark:text-slate-400 w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition bg-slate-200/60 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/5"
            >
              <i className="fa-solid fa-gear"></i>
            </button>

            {openSettings && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden py-3 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-700/50 mb-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajustes</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.email}</p>
                </div>
                <button onClick={() => { toggleDarkMode(); setOpenSettings(false); }} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <i className={`fa-solid w-6 text-center text-lg ${darkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-indigo-400'}`}></i>
                  <span className="flex-1 text-left">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>
                <button onClick={() => { requestPushPermission(); setOpenSettings(false); }} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <i className={`fa-solid w-6 text-center text-lg ${pushEnabled ? 'fa-bell text-indigo-500' : 'fa-bell-slash text-slate-400'}`}></i>
                  <span className="flex-1 text-left">Notificaciones</span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-2 mx-5"></div>
                {user && (
                  <button onClick={() => { signOut(); setOpenSettings(false); }} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <i className="fa-solid fa-right-from-bracket w-6 text-center text-lg"></i>
                    <span className="flex-1 text-left">Cerrar Sesión</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gradiente hacia abajo: funde el header con el contenido sin blur */}
      <div className="h-6 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent pointer-events-none" />
    </header>
  );
});
