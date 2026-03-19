import React from 'react';

export const Sidebar = React.memo(({ view, setView, pendingCount, calculateMonthTotal, formatMoney, darkMode, toggleDarkMode, signOut, user, showBalance }) => {
  return (
    <aside className="hidden md:flex w-72 glass border-r border-slate-200/50 dark:border-white/10 flex-col justify-between p-6 z-20 shadow-weightless">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="relative">
            <img src="/logo-home.png" alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg border border-white/10" />
            <div className="absolute -inset-1 bg-indigo-500/10 rounded-xl blur-sm -z-10 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Home</h1>
          </div>
        </div>

        <nav className="space-y-2">
          <button 
            onClick={() => setView('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 translate-x-1' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <i className="fa-solid fa-chart-pie w-5 text-center"></i> 
            <span className="flex-1 text-left">General</span>
          </button>
          
          <button 
            onClick={() => setView('pending')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'pending' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 translate-x-1' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${view === 'history' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 translate-x-1' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <i className="fa-solid fa-receipt w-5 text-center"></i> 
            <span className="flex-1 text-left">Historial</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <button 
              onClick={toggleDarkMode} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
            >
              {darkMode ? (
                <>
                  <i className="fa-solid fa-sun w-5 text-center text-yellow-500"></i>
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-moon w-5 text-center"></i>
                  <span>Modo Oscuro</span>
                </>
              )}
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
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30 group-hover:scale-125 transition-transform duration-700"></div>
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">Estimado Mensual</p>
        <p className="text-3xl font-bold">{showBalance ? formatMoney(calculateMonthTotal()) : '$ ***'}</p>
        <div className="mt-3 text-[10px] text-slate-500 font-bold flex items-center gap-2">
          <i className="fa-solid fa-circle-info text-indigo-500"></i>
          Basado en tus facturas activas
        </div>
      </div>
    </aside>
  );
});
