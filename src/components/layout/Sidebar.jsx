import React from 'react';
import { motion } from 'framer-motion';
import { fluentPillSpring } from '../../utils/fluentMotion';

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
    <aside className="hidden md:flex w-72 glass border-r border-[#E2E8F0] dark:border-[#253149] flex-col justify-between p-6 z-20">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="relative">
            <img src="/logo-home.png" alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg border border-white/10" />
            <div className="absolute -inset-1 bg-blue-500/10 rounded-xl blur-sm -z-10 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-[#0F172A] dark:text-[#F1F5F9] leading-none">Home</h1>
            <div className="flex items-center pt-0.5">{getSyncIcon()}</div>
          </div>
        </div>

        <nav className="space-y-2">
          <motion.button 
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('dashboard')} 
            className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors duration-200 ${view === 'dashboard' ? 'text-[#2563EB] dark:text-[#3478F6]' : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1B263B]'}`}
          >
            {view === 'dashboard' && (
              <motion.div
                layoutId="activeSidebarNav"
                transition={fluentPillSpring}
                className="absolute inset-0 bg-blue-50/80 dark:bg-[#1B263B] rounded-xl pointer-events-none"
              />
            )}
            <i className="fa-solid fa-chart-pie w-5 text-center relative z-10"></i> 
            <span className="flex-1 text-left relative z-10">General</span>
          </motion.button>
          
          <motion.button 
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('pending')} 
            className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors duration-200 ${view === 'pending' ? 'text-[#2563EB] dark:text-[#3478F6]' : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1B263B]'}`}
          >
            {view === 'pending' && (
              <motion.div
                layoutId="activeSidebarNav"
                transition={fluentPillSpring}
                className="absolute inset-0 bg-blue-50/80 dark:bg-[#1B263B] rounded-xl pointer-events-none"
              />
            )}
            <i className="fa-solid fa-clock w-5 text-center relative z-10"></i> 
            <span className="flex-1 text-left relative z-10">Pendientes</span>
            {pendingCount > 0 && (
              <span className="relative z-10 bg-[#DC2626] dark:bg-[#F04452] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md shadow-red-500/20">
                {pendingCount}
              </span>
            )}
          </motion.button>
          
          <motion.button 
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('history')} 
            className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors duration-200 ${view === 'history' ? 'text-[#2563EB] dark:text-[#3478F6]' : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1B263B]'}`}
          >
            {view === 'history' && (
              <motion.div
                layoutId="activeSidebarNav"
                transition={fluentPillSpring}
                className="absolute inset-0 bg-blue-50/80 dark:bg-[#1B263B] rounded-xl pointer-events-none"
              />
            )}
            <i className="fa-solid fa-receipt w-5 text-center relative z-10"></i> 
            <span className="flex-1 text-left relative z-10">Historial</span>
          </motion.button>

          <div className="pt-3 mt-3 border-t border-[#E2E8F0] dark:border-[#253149] space-y-2">
            <div className="px-1 py-1">
              <p className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2 px-1">Tema de la app</p>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#EEF2F7] dark:bg-[#1B263B] rounded-2xl border border-[#E2E8F0] dark:border-[#253149]">
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setThemeMode ? setThemeMode('light') : toggleDarkMode()} 
                  className={`relative flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-colors ${themeMode === 'light' ? 'text-[#0F172A] dark:text-[#F1F5F9]' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'}`}
                  title="Modo Claro"
                >
                  {themeMode === 'light' && (
                    <motion.div
                      layoutId="activeSidebarTheme"
                      transition={fluentPillSpring}
                      className="absolute inset-0 bg-white dark:bg-[#111A2D] rounded-xl shadow-sm pointer-events-none"
                    />
                  )}
                  <i className="fa-solid fa-sun text-amber-500 text-xs relative z-10"></i>
                  <span className="relative z-10">Claro</span>
                </motion.button>
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setThemeMode ? setThemeMode('dark') : toggleDarkMode()} 
                  className={`relative flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-colors ${themeMode === 'dark' ? 'text-[#0F172A] dark:text-[#F1F5F9]' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'}`}
                  title="Modo Oscuro"
                >
                  {themeMode === 'dark' && (
                    <motion.div
                      layoutId="activeSidebarTheme"
                      transition={fluentPillSpring}
                      className="absolute inset-0 bg-white dark:bg-[#111A2D] rounded-xl shadow-sm pointer-events-none"
                    />
                  )}
                  <i className="fa-solid fa-moon text-[#3478F6] text-xs relative z-10"></i>
                  <span className="relative z-10">Oscuro</span>
                </motion.button>
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setThemeMode ? setThemeMode('system') : toggleDarkMode()} 
                  className={`relative flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-colors ${themeMode === 'system' ? 'text-[#0F172A] dark:text-[#F1F5F9]' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'}`}
                  title="Predeterminado del sistema"
                >
                  {themeMode === 'system' && (
                    <motion.div
                      layoutId="activeSidebarTheme"
                      transition={fluentPillSpring}
                      className="absolute inset-0 bg-white dark:bg-[#111A2D] rounded-xl shadow-sm pointer-events-none"
                    />
                  )}
                  <i className="fa-solid fa-circle-half-stroke text-[#64748B] dark:text-[#94A3B8] text-xs relative z-10"></i>
                  <span className="relative z-10">Auto</span>
                </motion.button>
              </div>
            </div>

            <motion.button 
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={toggleNotifications} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1B263B] transition-colors duration-200"
            >
              <i className={`fa-solid w-5 text-center text-lg ${pushEnabled ? 'fa-bell text-[#2563EB] dark:text-[#3478F6]' : 'fa-bell-slash text-slate-400'}`}></i>
              <span className="flex-1 text-left">Notificaciones</span>
              {pushEnabled && <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3478F6]"></span>}
            </motion.button>

            <motion.button 
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#EEF2F7] dark:hover:bg-[#1B263B] transition-colors duration-200"
            >
              <i className="fa-solid fa-download w-5 text-center text-lg text-[#2563EB] dark:text-[#3478F6]"></i>
              <span className="flex-1 text-left">Instalar App</span>
            </motion.button>

            {user && (
              <motion.button 
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={signOut} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[#DC2626] dark:text-[#F04452] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200"
              >
                <i className="fa-solid fa-right-from-bracket w-5 text-center"></i> 
                <span>Salir</span>
              </motion.button>
            )}
          </div>
        </nav>
      </div>
      
      <div className="bg-[#111A2D] border border-[#253149] rounded-[2.5rem] p-7 text-[#F1F5F9] relative overflow-hidden group shadow-xl mx-1">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#3478F6] rounded-full blur-3xl opacity-25 group-hover:scale-125 transition-transform duration-700"></div>
        <p className="text-[10px] text-[#94A3B8] font-bold uppercase mb-1 tracking-widest">Estimado Mensual</p>
        <p className="text-3xl font-extrabold tracking-tight">{showBalance ? formatMoney(calculateMonthTotal()) : '$ ***'}</p>
        <div className="mt-3 text-[10px] text-[#94A3B8] font-bold flex items-center gap-2">
          <i className="fa-solid fa-circle-info text-[#3478F6]"></i>
          Basado en tus facturas activas
        </div>
      </div>
    </aside>
  );
});
