import React, { useState } from 'react';
import { Card, Badge } from '../ui';
import { formatMoney, getIcon } from '../../lib/utils';

const CATEGORY_LABELS = {
  casa: 'Casa',
  auto: 'Auto',
  otro: 'Otro',
};

export const HistoryView = ({ bills, handleEdit, showBalance }) => {
  const [openHistoryGroups, setOpenHistoryGroups] = useState({});
  const [expandedBill, setExpandedBill] = useState(null);

  const toggleHistoryGroup = (key) => {
    setOpenHistoryGroups(prev => ({ ...prev, [key]: !prev[key] }));
    setExpandedBill(null); // Cierra detalle al colapsar grupo
  };

  const toggleBillDetail = (billId) => {
    setExpandedBill(prev => (prev === billId ? null : billId));
  };

  const historyGroups = React.useMemo(() => {
    const groups = {};
    bills.forEach(bill => {
      const d = new Date(bill.dueDate + 'T12:00:00');
      const key = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      if (!groups[key]) {
        groups[key] = { key, title: key, bills: [], total: 0, isFullyPaid: true, date: d };
      }
      groups[key].bills.push(bill);
      groups[key].total += Number(bill.amount);
      if (!bill.paid) groups[key].isFullyPaid = false;
    });
    // Ordenamos cronológicamente descendente (más reciente primero)
    return Object.values(groups).sort((a, b) => b.date - a.date);
  }, [bills]);

  return (
    <div className="space-y-4 animate-in slide-in-from-right duration-300 pb-20">
      {historyGroups.map(group => (
        <Card key={group.key} className="p-0 overflow-hidden !translate-y-0 border-none shadow-md !rounded-3xl">

          {/* Cabecera del grupo (mes) */}
          <div
            onClick={() => toggleHistoryGroup(group.key)}
            className={`w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${openHistoryGroups[group.key] ? 'rounded-t-3xl' : 'rounded-3xl'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${group.isFullyPaid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <i className={`fa-solid ${group.isFullyPaid ? 'fa-check' : 'fa-hourglass-start'}`}></i>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 capitalize text-lg tracking-tight">{group.title}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{group.bills.length} movimientos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-lg whitespace-nowrap">
                {showBalance ? formatMoney(group.total) : '****'}
              </span>
              <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center transition-transform duration-300 ${openHistoryGroups[group.key] ? 'rotate-180 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600' : 'text-slate-400'}`}>
                <i className="fa-solid fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>

          {/* Lista de servicios del grupo */}
          {openHistoryGroups[group.key] && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 space-y-2 animate-in slide-in-from-top-4 duration-300 rounded-b-3xl">
              {group.bills.map(bill => {
                const isExpanded = expandedBill === bill.id;
                const dueDateFormatted = new Date(bill.dueDate + 'T12:00:00').toLocaleDateString('es-AR', {
                  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                });
                const installmentPct = bill.isInstallments && bill.totalInstallments > 0
                  ? Math.round((bill.currentInstallment / bill.totalInstallments) * 100)
                  : 0;

                return (
                  <div
                    key={bill.id}
                    className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-200 dark:border-indigo-500/30 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-500/5' : 'border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'}`}
                  >
                    {/* Fila principal — clickeable */}
                    <div
                      className="flex justify-between items-center p-4 cursor-pointer gap-3 select-none"
                      onClick={() => toggleBillDetail(bill.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center shadow-inner transition-colors duration-300 ${isExpanded ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}>
                          {getIcon(bill.category)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-700 dark:text-slate-200 text-xs tracking-tight truncate block">
                            {bill.name}
                          </span>
                          {bill.isInstallments && (
                            <span className="text-[9px] font-black text-purple-500 dark:text-purple-400 uppercase tracking-widest">
                              Cuota {bill.currentInstallment}/{bill.totalInstallments}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={bill.paid ? 'green' : 'red'}>{bill.paid ? 'PAGO' : 'IMPAGO'}</Badge>
                        <span className="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap text-sm">
                          {showBalance ? formatMoney(bill.amount) : '****'}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${isExpanded ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rotate-180' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                          <i className="fa-solid fa-chevron-down text-[9px]"></i>
                        </div>
                      </div>
                    </div>

                    {/* Panel de detalles expandible */}
                    {isExpanded && (
                      <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="h-px bg-slate-100 dark:bg-slate-700 mb-4" />

                        <div className="grid grid-cols-2 gap-3 mb-3">

                          {/* Nombre completo */}
                          <div className="col-span-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="fa-solid fa-tag text-indigo-500 text-[11px]"></i>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Nombre Completo</p>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 break-words leading-tight">{bill.name}</p>
                            </div>
                          </div>

                          {/* Fecha de vencimiento */}
                          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="fa-regular fa-calendar text-indigo-500 text-[11px]"></i>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Vencía el</p>
                              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 capitalize leading-tight">{dueDateFormatted}</p>
                            </div>
                          </div>

                          {/* Fecha de pago real */}
                          <div className={`rounded-xl p-3 flex items-start gap-2.5 ${bill.paid && bill.paidAt ? 'bg-green-50 dark:bg-green-500/5' : 'bg-slate-50 dark:bg-slate-900/60'}`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${bill.paid && bill.paidAt ? 'bg-green-100 dark:bg-green-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              <i className={`fa-solid fa-circle-check text-[11px] ${bill.paid && bill.paidAt ? 'text-green-500' : 'text-slate-400'}`}></i>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Fecha de pago</p>
                              {bill.paid && bill.paidAt ? (
                                <p className="text-[11px] font-bold text-green-700 dark:text-green-400 capitalize leading-tight">
                                  {new Date(bill.paidAt).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                  <span className="block text-[10px] font-bold text-green-600/70 dark:text-green-400/60">
                                    {new Date(bill.paidAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                                  </span>
                                </p>
                              ) : bill.paid ? (
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Fecha no registrada</p>
                              ) : (
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Sin pagar</p>
                              )}
                            </div>
                          </div>

                          {/* Categoría */}
                          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                              {getIcon(bill.category)}
                            </div>
                            <div>
                              <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Categoría</p>
                              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{CATEGORY_LABELS[bill.category] || bill.category}</p>
                            </div>
                          </div>

                          {/* Tipo de monto */}
                          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${bill.isFixed ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              <i className={`fa-solid ${bill.isFixed ? 'fa-lock text-amber-500' : 'fa-arrows-up-down text-slate-400'} text-[11px]`}></i>
                            </div>
                            <div>
                              <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Tipo</p>
                              <p className={`text-[11px] font-bold ${bill.isFixed ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                {bill.isFixed ? 'Monto fijo' : 'Variable'}
                              </p>
                            </div>
                          </div>

                          {/* Estado de pago */}
                          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${bill.paid ? 'bg-green-100 dark:bg-green-500/10' : 'bg-red-100 dark:bg-red-500/10'}`}>
                              <i className={`fa-solid ${bill.paid ? 'fa-check text-green-500' : 'fa-xmark text-red-500'} text-[11px]`}></i>
                            </div>
                            <div>
                              <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Estado</p>
                              <p className={`text-[11px] font-bold ${bill.paid ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                {bill.paid ? 'Pagado' : 'Sin pagar'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Barra de progreso de cuotas */}
                        {bill.isInstallments && bill.totalInstallments > 0 && (
                          <div className="bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/20 rounded-xl p-3 mb-3">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[8px] uppercase font-black text-purple-500 dark:text-purple-400 tracking-widest">Progreso de cuotas</p>
                              <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">{installmentPct}%</span>
                            </div>
                            <div className="w-full bg-purple-100 dark:bg-purple-500/10 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                                style={{ width: `${installmentPct}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-purple-500/70 dark:text-purple-400/60 font-bold mt-1.5">
                              Cuota {bill.currentInstallment} de {bill.totalInstallments}
                            </p>
                          </div>
                        )}

                        {/* Botón editar */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(bill); }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-100 dark:border-indigo-500/20 active:scale-[0.98]"
                        >
                          <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                          Editar servicio
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ))}

      {historyGroups.length === 0 && (
        <div className="text-center py-20 opacity-60">
          <p className="font-bold text-slate-500">No hay historial disponible.</p>
        </div>
      )}
    </div>
  );
};
