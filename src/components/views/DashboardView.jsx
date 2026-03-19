import React, { useRef, useMemo } from 'react';
import { Card, Badge, Button } from '../ui';
import { formatMoney, formatMoneyProtected, getIcon, isOverdue } from '../../lib/utils';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const DashboardView = ({ 
  bills, 
  showBalance, 
  calculatePendingTotal, 
  calculatePaidThisMonth, 
  currentMonthProgress, 
  getNextDueBill, 
  handleEdit, 
  handleDeleteClick, 
  handleTogglePaid,
  activeMenu,
  setActiveMenu
}) => {
  const container = useRef(null);
  const billStates = useRef({});
  
  // Lógica de ordenado
  const monthBills = useMemo(() => {
    return [...bills].sort((a, b) => {
      if (a.paid !== b.paid) return a.paid ? 1 : -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [bills]);

  const pendingCount = useMemo(() => bills?.filter(b => !b.paid).length || 0, [bills]);

  useGSAP(() => {
    if (!container.current) return;
    
    // Animación de reordenamiento
    const cards = gsap.utils.toArray(".bill-card-item");
    gsap.from(cards, {
      y: (i, target) => {
        const id = target.dataset.id;
        const wasPaid = billStates.current[id];
        const isPaid = bills.find(b => b.id === id)?.paid;
        // Si cambió el estado de pago, animamos un pequeño salto
        return wasPaid !== undefined && wasPaid !== isPaid ? (isPaid ? -15 : 15) : 0;
      },
      opacity: (i, target) => {
        const id = target.dataset.id;
        return billStates.current[id] !== bills.find(b => b.id === id)?.paid ? 0.7 : 1;
      },
      duration: 0.5,
      stagger: 0.02,
      ease: "power2.out",
    });
    
    // Actualizar historial de estados
    bills.forEach(b => {
      billStates.current[b.id] = b.paid;
    });
  }, { dependencies: [bills.map(b => b.paid).join(',')], scope: container });

  const getRelativeDateString = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr + 'T12:00:00');
    date.setHours(0, 0, 0, 0);
    
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    if (diffDays === -1) return 'Venció ayer';
    
    return `Vence el ${date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`;
  };

  return (
    <div ref={container}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className={`relative overflow-hidden transition-all duration-700 ${calculatePendingTotal() === 0 ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border-none shadow-[0_20px_50px_rgba(245,158,11,0.3)]' : ''}`}>
          <div className="relative z-10">
            <p className={`text-xs font-bold uppercase mb-1 ${calculatePendingTotal() === 0 ? 'text-white opacity-80' : 'text-red-500'}`}>
              {calculatePendingTotal() === 0 ? '¡Felicidades!' : 'Pendiente Total'}
            </p>
            <p className={`text-3xl font-bold ${calculatePendingTotal() === 0 ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
              {calculatePendingTotal() === 0 ? '¡Todo al día!' : formatMoneyProtected(calculatePendingTotal(), showBalance)}
            </p>
            <p className={`text-sm mt-1 font-medium ${calculatePendingTotal() === 0 ? 'text-white/80' : 'text-slate-400'}`}>
              {calculatePendingTotal() === 0 ? 'Sin deudas este mes' : `${pendingCount} facturas sin pagar`}
            </p>
          </div>
          <div className={`absolute right-0 bottom-0 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-all ${calculatePendingTotal() === 0 ? 'bg-white/20' : 'bg-red-50 dark:bg-red-500/5 opacity-50'}`}></div>
          {calculatePendingTotal() === 0 && (
            <div className="absolute top-2 right-2 text-white/20 text-4xl rotate-12">
              <i className="fa-solid fa-star"></i>
            </div>
          )}
        </Card>

        <Card className="relative overflow-hidden">
          <div className="relative z-10 w-full">
            <div className="flex justify-between mb-1">
              <p className="text-xs font-bold uppercase text-green-600">Pagado (Mes)</p>
              <span className="text-xs font-bold text-slate-400">{Math.round(currentMonthProgress())}%</span>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {formatMoneyProtected(calculatePaidThisMonth(), showBalance)}
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 mt-3 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000 ${currentMonthProgress() >= 100 ? 'animate-pulse' : ''}`} 
                style={{ width: `${Math.min(100, currentMonthProgress())}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-indigo-100 dark:border-indigo-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[50px] opacity-10"></div>
          <div className="relative z-10">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Próximo Vencimiento</p>
            <p className="text-xl font-bold mt-2 truncate text-slate-800 dark:text-white">
              {getNextDueBill() ? getNextDueBill().name : 'Nada pendiente'}
            </p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
              {getNextDueBill() ? getRelativeDateString(getNextDueBill().dueDate) : 'Todo al día'}
            </p>
          </div>
        </Card>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">Este Mes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
        {monthBills.map(bill => (
          <div key={bill.id} data-id={bill.id} className="bill-card-item">
            <Card 
              className={`group overflow-hidden transition-all duration-500 ${bill.paid ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all ${bill.paid ? 'bg-green-500' : isOverdue(bill.dueDate) ? 'bg-red-500' : bill.amount > 0 ? 'bg-orange-400' : 'bg-indigo-500'}`}></div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                    {getIcon(bill.category)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                      {bill.name}
                      {bill.isInstallments && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 align-middle">
                          {bill.currentInstallment}/{bill.totalInstallments}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{bill.category}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === bill.id ? null : bill.id); }}
                    className="text-slate-400 dark:text-slate-500 hover:text-indigo-500 p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  {activeMenu === bill.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden py-1 animate-in zoom-in-95 duration-200">
                      <button onClick={() => { handleEdit(bill); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">Editar</button>
                      <button onClick={() => { handleDeleteClick(bill); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">Eliminar</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  {bill.amount > 0 ? (
                    <>
                      <Badge variant={bill.paid ? 'green' : isOverdue(bill.dueDate) ? 'red' : 'default'}>
                        {bill.paid ? 'Pagado' : isOverdue(bill.dueDate) ? 'Vencido' : 'Pendiente'}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {new Date(bill.dueDate + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </p>
                    </>
                  ) : (
                    <Badge variant="indigo" className="animate-pulse">Falta monto</Badge>
                  )}
                </div>
                <div className="text-right">
                  {bill.amount >= 0 && (
                    <p className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-2">{formatMoney(bill.amount)}</p>
                  )}
                  <Button 
                    variant={bill.paid ? 'ghost' : 'secondary'} 
                    className={`px-5 py-1.5 text-xs !rounded-full transition-all duration-300 ${bill.paid ? 'opacity-50' : ''}`}
                    onClick={() => handleTogglePaid(bill)}
                  >
                    {bill.paid ? 'Pagado' : bill.amount === 0 ? 'Definir' : 'Pagar'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
