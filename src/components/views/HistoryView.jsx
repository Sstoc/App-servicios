import React, { useState } from 'react';
import { Card, Badge, Button } from '../ui';
import { formatMoney, getIcon } from '../../lib/utils';

export const HistoryView = ({ bills, handleEdit }) => {
  const [openHistoryGroups, setOpenHistoryGroups] = useState({});

  const toggleHistoryGroup = (key) => {
    setOpenHistoryGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const historyGroups = React.useMemo(() => {
    const groups = {};
    
    // Solo procesamos facturas reales (no proyecciones)
    bills.forEach(bill => {
      const d = new Date(bill.dueDate + 'T12:00:00');
      const key = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      if (!groups[key]) {
        groups[key] = { 
          key, 
          title: key, 
          bills: [], 
          total: 0, 
          isFullyPaid: true, 
          date: d
        };
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
          <div 
            onClick={() => toggleHistoryGroup(group.key)}
            className={`w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group/header ${openHistoryGroups[group.key] ? 'rounded-t-3xl' : 'rounded-3xl'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${group.isFullyPaid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <i className={`fa-solid ${group.isFullyPaid ? 'fa-check' : 'fa-hourglass-start'}`}></i>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 capitalize text-lg tracking-tight">
                  {group.title}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                  {group.bills.length} movimientos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">{formatMoney(group.total)}</span>
              <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center transition-transform duration-300 ${openHistoryGroups[group.key] ? 'rotate-180 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600' : 'text-slate-400'}`}>
                <i className="fa-solid fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
          {openHistoryGroups[group.key] && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 space-y-2 animate-in slide-in-from-top-4 duration-300 rounded-b-3xl">
              {group.bills.map(bill => (
                <div key={bill.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-inner">
                      {getIcon(bill.category)}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-tight">
                      {bill.name}
                      {bill.isInstallments && (
                        <span className="ml-2 text-purple-500 dark:text-purple-400">
                          ({bill.currentInstallment}/{bill.totalInstallments})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={bill.paid ? 'green' : 'red'}>{bill.paid ? 'PAGO' : 'IMPAGO'}</Badge>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatMoney(bill.amount)}</span>
                  </div>
                </div>
              ))}
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
