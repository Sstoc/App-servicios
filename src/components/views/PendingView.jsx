import React from 'react';
import { Card, Badge, Button } from '../ui';
import { formatMoney, isOverdue, getCategoryLabel, getIcon } from '../../lib/utils';

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
    <div className="space-y-4 sm:space-y-6">
      {/* Resumen de Deuda Total Compacto */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/30 !p-4 sm:!p-6 !rounded-2xl text-red-600 dark:text-red-400 relative overflow-hidden group">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Deuda Total</p>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
            {showBalance ? formatMoney(totalDebt) : '****'}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Acumulado</p>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl !p-4 sm:!p-6 !rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg sm:text-xl shrink-0">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Por pagar</p>
              <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white leading-tight mt-1">{pendingBills.length} <span className="text-xs font-bold text-slate-400">ítems</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mb-24">
        {pendingBills.map(bill => (
          <div key={bill.id} data-id={bill.id} className={`bill-card-item transition-all ${activeMenu === bill.id ? 'relative z-40' : 'relative z-0'}`}>
            <Card 
              className={`group !overflow-visible !p-4 sm:!p-5 !rounded-2xl transition-all duration-300 ${bill.paid ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${bill.paid ? 'bg-green-500' : isOverdue(bill.dueDate) ? 'bg-red-500' : bill.amount > 0 ? 'bg-orange-400' : 'bg-blue-500'}`}></div>
              </div>

              {/* Fila Superior: Icono + Nombre/Categoría + Importe + Menú */}
              <div className="flex justify-between items-center gap-2 mb-2 relative z-10 pl-0.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                    {getIcon(bill.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] sm:text-base leading-tight truncate" title={bill.name}>
                      {bill.name}
                      {bill.isInstallments && (
                        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 align-middle">
                          {bill.currentInstallment}/{bill.totalInstallments}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-none mt-0.5 truncate">{getCategoryLabel(bill.category)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {bill.amount >= 0 && (
                    <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                      {showBalance ? formatMoney(bill.amount) : '****'}
                    </span>
                  )}
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === bill.id ? null : bill.id); }}
                      className="text-slate-400 dark:text-slate-500 hover:text-blue-500 w-8 h-8 flex items-center justify-center transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
                    >
                      <i className="fa-solid fa-ellipsis-vertical text-sm"></i>
                    </button>
                    {activeMenu === bill.id && (
                      <>
                        <div
                          className="fixed inset-0 z-[190]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(null);
                          }}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-white/10 z-[200] overflow-hidden py-1.5 popup-animate origin-top-right">
                          <button onClick={() => { handleEdit(bill); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                            <i className="fa-solid fa-pen-to-square text-slate-400"></i>
                            <span>Editar</span>
                          </button>
                          <button onClick={() => { handleDeleteClick(bill); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                            <i className="fa-solid fa-trash-can text-red-400"></i>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Fila Inferior: Estado / Vencimiento + Botón Pagar */}
              <div className="flex justify-between items-center gap-2 pt-2.5 mt-0.5 border-t border-slate-100 dark:border-white/5 pl-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  {bill.amount > 0 ? (
                    <>
                      <Badge 
                        variant={bill.paid ? 'green' : isOverdue(bill.dueDate) ? 'red' : 'default'}
                        className="!text-[10px] !px-2.5 !py-0.5 font-bold shrink-0"
                      >
                        {bill.paid ? 'Pagado' : isOverdue(bill.dueDate) ? 'Vencido' : 'Pendiente'}
                      </Badge>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate flex items-center gap-1.5">
                        <i className="fa-regular fa-calendar text-[11px] opacity-60"></i>
                        {new Date(bill.dueDate + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </span>
                    </>
                  ) : (
                    <Badge variant="blue" className="animate-pulse !text-[10px] !px-2.5 !py-0.5 font-bold">Falta monto</Badge>
                  )}
                </div>

                <div>
                  <Button 
                    variant={bill.paid ? 'ghost' : 'secondary'} 
                    className={`!px-4 !py-1.5 !text-xs font-bold !rounded-full transition-all duration-300 ${bill.paid ? 'opacity-50 hover:opacity-80' : 'shadow-sm'}`}
                    onClick={() => handleTogglePaid(bill)}
                  >
                    {bill.paid ? (
                      <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400"><i className="fa-solid fa-check text-[11px]"></i> Pagado</span>
                    ) : bill.amount === 0 ? (
                      'Definir'
                    ) : (
                      'Pagar'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>


      {pendingBills.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center border-4 border-blue-100 dark:border-blue-500/20">
              <i className="fa-solid fa-check text-5xl text-blue-600 dark:text-blue-400"></i>
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
