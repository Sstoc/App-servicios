import React from 'react';
import { Card, Badge, Button } from '../ui';
import { formatMoney, isOverdue } from '../../lib/utils';

const CATEGORY_LABELS = {
  casa: 'Casa',
  auto: 'Auto',
  otro: 'Otro',
};

export const PendingView = ({ 
  bills, 
  hasBillsThisMonth,
  handleEdit, 
  handleDeleteClick, 
  handleTogglePaid,
  activeMenu,
  setActiveMenu,
  showBalance
}) => {
  const pendingBills = React.useMemo(() => {
    return [...bills].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [bills]);

  const totalDebt = React.useMemo(() => {
    return pendingBills.reduce((sum, b) => sum + Number(b.amount), 0);
  }, [pendingBills]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {/* Resumen de Deuda Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-red-600 dark:text-red-400 relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Deuda Total Pendiente</p>
          <h3 className="text-4xl font-black tracking-tight mb-2">
            {showBalance ? formatMoney(totalDebt) : '****'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Incluye meses anteriores</p>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Servicios por pagar</p>
              <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">{pendingBills.length} <span className="text-xs font-bold text-slate-400">ítems</span></p>
            </div>
          </div>
        </div>
      </div>

      {pendingBills.map(bill => (
        <Card key={bill.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 !translate-y-0 relative !overflow-visible border border-slate-100 dark:border-white/5">
          {/* Barra lateral de estado sin depender de overflow-hidden */}
          <div 
            className={`absolute left-0 top-[15%] bottom-[15%] w-1.5 rounded-r-2xl ${isOverdue(bill.dueDate) ? 'bg-red-500/80 shadow-[1px_0_8px_rgba(239,68,68,0.3)]' : 'bg-indigo-500/80'}`}
          ></div>

          <div className="pl-5 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg tracking-tight">
                {bill.name}
                {bill.isInstallments && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 align-middle">
                    {bill.currentInstallment}/{bill.totalInstallments}
                  </span>
                )}
              </h4>
              {isOverdue(bill.dueDate) && (
                <Badge variant="red" className="!rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-0.5">Vencido</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <i className="fa-regular fa-calendar-check text-indigo-500"></i> 
                {new Date(bill.dueDate + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-tag text-slate-300 dark:text-slate-600"></i>
                <span>{CATEGORY_LABELS[bill.category] || bill.category}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-6 pl-5 md:pl-0 w-full md:w-auto border-t md:border-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
            <div className="text-right">
              <p className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">
                {showBalance ? formatMoney(bill.amount) : '****'}
              </p>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">Saldar Cuenta</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === bill.id ? null : bill.id); }}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-500 transition-all rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                >
                  <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
                </button>
                {activeMenu === bill.id && (
                  <div className="absolute right-0 bottom-full mb-3 w-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-white/10 z-[200] overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => { handleEdit(bill); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition flex items-center gap-2">
                       <i className="fa-solid fa-pen-to-square text-indigo-500 w-4"></i> Editar datos
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-1"></div>
                    <button onClick={() => { handleDeleteClick(bill); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition flex items-center gap-2">
                       <i className="fa-solid fa-trash-can w-4"></i> Borrar servicio
                    </button>
                  </div>
                )}
              </div>

              <button 
                className={`group relative flex items-center justify-center w-14 h-14 !rounded-full shadow-lg transition-all duration-300 border border-white/20 ${bill.amount > 0 ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40' : 'bg-amber-500 text-white shadow-amber-500/20 hover:shadow-amber-500/40'}`}
                onClick={(e) => { e.stopPropagation(); handleTogglePaid(bill); }}
                title={bill.amount > 0 ? "Confirmar Pago" : "Definir Monto"}
              >
                <i className={`fa-solid ${bill.amount > 0 ? 'fa-check' : 'fa-pen-to-square'} text-2xl group-hover:scale-110 transition-transform`}></i>
              </button>
            </div>
          </div>
        </Card>
      ))}


      {pendingBills.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center border-4 border-indigo-100 dark:border-indigo-500/20">
              <i className="fa-solid fa-check text-5xl text-indigo-600 dark:text-indigo-400"></i>
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900">
              <i className="fa-solid fa-star"></i>
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">¡Todo al día!</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-[280px] leading-relaxed"> No tenés servicios pendientes de pago por el momento. ¡Excelente gestión!</p>
          <div className="mt-8 px-6 py-2 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-500/20">
            Sincronizado y actualizado
          </div>
        </div>
      )}
    </div>
  );
};
