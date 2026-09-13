import React, { useState } from 'react';

export const HeaderMobile = React.memo(({ toggleBalance, showBalance, darkMode, toggleDarkMode, signOut, user, pushEnabled, requestPushPermission, syncStatus }) => {
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
          <span className="flex items-center text-blue-500 dark:text-blue-400 animate-pulse" title="Sincronizando con Supabase...">
            <i className="fa-solid fa-cloud text-[10px]"></i>
          </span>
        );
      case 'synced':
        return (
          <span className="flex items-center text-slate-500 dark:text-slate-400 transition-opacity duration-500" title="Sincronizado con Supabase">
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
          <span className="flex items-center text-slate-400 dark:text-slate-600" title="Listo">
            <i className="fa-solid fa-cloud text-[10px]"></i>
          </span>
        );
    }
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40">
      {/* Barra sólida: mismo color que el fondo del app → sin backdrop-blur → sin lag en Android */}
      <div 
        className="bg-slate-50 dark:bg-slate-900 px-4 pb-3 flex justify-between items-center transition-colors"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/logo-home.png" alt="Logo" className="w-8 h-8 object-contain rounded-lg shadow-md border border-white/5" />
            <div className="absolute -inset-1 bg-blue-500/10 rounded-lg blur-[3px] -z-10"></div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Home</h1>
            <div className="flex items-center pt-0.5">{getSyncIcon()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBalance}
            className="text-slate-700 dark:text-slate-200 w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition bg-white dark:bg-slate-800 shadow-sm border border-slate-300/80 dark:border-white/10 hover:text-slate-900 dark:hover:text-white"
          >
            <i className={showBalance ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}></i>
          </button>

          <div className="relative">
            <button
              id="mobile-settings-btn"
              onClick={(e) => { e.stopPropagation(); setOpenSettings(!openSettings); }}
              className="text-slate-700 dark:text-slate-200 w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition bg-white dark:bg-slate-800 shadow-sm border border-slate-300/80 dark:border-white/10 hover:text-slate-900 dark:hover:text-white"
            >
              <i className="fa-solid fa-gear"></i>
            </button>

            {openSettings && (
              <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-700 overflow-hidden py-3 z-50 origin-top-right popup-animate">
                <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 mb-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ajustes</p>
                  <p className="text-base font-bold text-slate-800 dark:text-white truncate mt-1">{user?.email}</p>
                </div>
                <button onClick={() => { toggleDarkMode(); setOpenSettings(false); }} className="w-full flex items-center gap-4 px-6 py-5 text-base font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <i className={`fa-solid w-6 text-center text-xl ${darkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-blue-400'}`}></i>
                  <span className="flex-1 text-left">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>
                <button onClick={() => { requestPushPermission(); setOpenSettings(false); }} className="w-full flex items-center gap-4 px-6 py-5 text-base font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <i className={`fa-solid w-6 text-center text-xl ${pushEnabled ? 'fa-bell text-blue-500' : 'fa-bell-slash text-slate-400'}`}></i>
                  <span className="flex-1 text-left">Notificaciones</span>
                </button>
                <button onClick={() => { window.dispatchEvent(new CustomEvent('trigger-pwa-install')); setOpenSettings(false); }} className="w-full flex items-center gap-4 px-6 py-5 text-base font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <i className="fa-solid fa-download w-6 text-center text-xl text-blue-500"></i>
                  <span className="flex-1 text-left">Instalar App</span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-2 mx-5"></div>
                {user && (
                  <button onClick={() => { signOut(); setOpenSettings(false); }} className="w-full flex items-center gap-4 px-6 py-5 text-base font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <i className="fa-solid fa-right-from-bracket w-6 text-center text-xl"></i>
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
