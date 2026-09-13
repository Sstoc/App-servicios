import React from 'react';

export const Sidebar = React.memo(({ view, setView, pendingCount, calculateMonthTotal, formatMoney, darkMode, toggleDarkMode, themeMode = 'light', setThemeMode, signOut, user, showBalance, syncStatus, pushEnabled, toggleNotifications }) => {
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
    <aside className="hidden md:flex w-72 glass border-r border-slate-200/50 dark:border-white/10 flex-col justify-between p-6 z-20 shadow-weightless">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="relative">
            <img src="/logo-home.png" alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg border border-white/10" />
            <div className="absolute -inset-1 bg-blue-500/10 rounded-xl blur-sm -z-10 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Home</h1>
            <div className="flex items-center pt-0.5">{getSyncIcon()}</div>
          </div>
        </div>

        <nav className="space-y-2">
          <button 
            onClick={() => setView('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'dashboard' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 translate-x-1' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <i className="fa-solid fa-chart-pie w-5 text-center"></i> 
            <span className="flex-1 text-left">General</span>
          </button>
          
          <button 
            onClick={() => setView('pending')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'pending' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 translate-x-1' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <i className="fa-solid fa-clock w-5 text-center"></i> 
            <span className="flex-1 text-left">Pendientes</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-red-200 dark:shadow-none">
                {pendingCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setView('history')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'history' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 translate-x-1' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <i className="fa-solid fa-receipt w-5 text-center"></i> 
            <span className="flex-1 text-left">Historial</span>
          </button>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <div className="px-1 py-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Tema de la app</p>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                <button 
                  type="button"
                  onClick={() => setThemeMode ? setThemeMode('light') : toggleDarkMode()} 
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${themeMode === 'light' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  title="Modo Claro"
                >
                  <i className="fa-solid fa-sun text-yellow-500 text-xs"></i>
                  <span>Claro</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setThemeMode ? setThemeMode('dark') : toggleDarkMode()} 
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${themeMode === 'dark' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  title="Modo Oscuro"
                >
                  <i className="fa-solid fa-moon text-blue-400 text-xs"></i>
                  <span>Oscuro</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setThemeMode ? setThemeMode('system') : toggleDarkMode()} 
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${themeMode === 'system' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  title="Predeterminado del sistema"
                >
                  <i className="fa-solid fa-circle-half-stroke text-slate-400 text-xs"></i>
                  <span>Auto</span>
                </button>
              </div>
            </div>

            <button 
              onClick={toggleNotifications} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
            >
              <i className={`fa-solid w-5 text-center text-lg ${pushEnabled ? 'fa-bell text-blue-500' : 'fa-bell-slash text-slate-400'}`}></i>
              <span className="flex-1 text-left">Notificaciones</span>
              {pushEnabled && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
            </button>

            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
            >
              <i className="fa-solid fa-download w-5 text-center text-lg text-blue-500"></i>
              <span className="flex-1 text-left">Instalar App</span>
            </button>

            {user && (
              <button 
                onClick={signOut} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
              >
                <i className="fa-solid fa-right-from-bracket w-5 text-center"></i> 
                <span>Salir</span>
              </button>
            )}
          </div>
        </nav>
      </div>
      
      <div className="bg-slate-900 rounded-[2.5rem] p-7 text-white relative overflow-hidden group shadow-weightless mx-1">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-30 group-hover:scale-125 transition-transform duration-700"></div>
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">Estimado Mensual</p>
        <p className="text-3xl font-bold">{showBalance ? formatMoney(calculateMonthTotal()) : '$ ***'}</p>
        <div className="mt-3 text-[10px] text-slate-500 font-bold flex items-center gap-2">
          <i className="fa-solid fa-circle-info text-blue-500"></i>
          Basado en tus facturas activas
        </div>
      </div>
    </aside>
  );
});
