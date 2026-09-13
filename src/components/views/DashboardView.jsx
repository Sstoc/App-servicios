import React, { useRef, useMemo, useState } from 'react';
import { Card, Badge, Button } from '../ui';
import { formatMoney, formatMoneyProtected, getIcon, getCategoryLabel, isOverdue } from '../../lib/utils';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// ─── BudgetCard ──────────────────────────────────────────────────────────────
const BudgetCard = ({ budget, monthTotal, showBalance, onSetBudget }) => {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const hasExceeded = budget !== null && monthTotal > budget;
  const pct = budget ? Math.min(100, (monthTotal / budget) * 100) : 0;

  const handleSave = () => {
    onSetBudget(inputVal);
    setEditing(false);
  };

  const handleRemove = () => {
    onSetBudget(null);
    setEditing(false);
  };

  // Si no hay presupuesto, mostrar un CTA discreto y compacto
  if (budget === null) {
    return (
      <div className="mb-3 sm:mb-6">
        <button
          onClick={() => { setInputVal(''); setEditing(true); }}
          className="w-full py-2 sm:py-2.5 px-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all flex items-center justify-between text-xs font-semibold group"
        >
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bullseye text-sm group-hover:scale-110 transition-transform text-blue-500/70"></i>
            <span>Establecer presupuesto mensual</span>
          </div>
          {editing ? (
            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
              <input
                type="number"
                autoFocus
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Ej: 50000"
                min="0"
                className="w-24 sm:w-28 px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-blue-500"
              />
              <button onClick={handleSave} className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold">Guardar</button>
            </div>
          ) : (
            <i className="fa-solid fa-plus text-[10px] opacity-60"></i>
          )}
        </button>
      </div>
    );
  }

  // Con presupuesto configurado
  return (
    <Card className={`mb-3 sm:mb-6 !p-3.5 sm:!p-5 !rounded-2xl transition-all duration-500 ${hasExceeded ? 'border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5' : 'border-blue-100 dark:border-blue-500/20'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${hasExceeded ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
            {hasExceeded ? '⚠ Presupuesto superado' : 'Presupuesto del mes'}
          </p>
          <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white mt-0.5">
            {showBalance ? (
              <span>
                <span className={hasExceeded ? 'text-red-500' : ''}>{formatMoney(monthTotal)}</span>
                <span className="text-slate-300 dark:text-slate-600 text-sm sm:text-base font-bold"> / </span>
                <span className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-bold">{formatMoney(budget)}</span>
              </span>
            ) : '••• / •••'}
          </p>
        </div>
        <button
          onClick={() => { setInputVal(String(budget)); setEditing(v => !v); }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"
          title="Editar presupuesto"
        >
          <i className="fa-solid fa-pen text-[10px] sm:text-xs"></i>
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${hasExceeded ? 'bg-gradient-to-r from-red-400 to-red-600 animate-pulse' : pct > 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-slate-400 mt-2 font-medium">
        {hasExceeded
          ? `Excediste en ${formatMoney(monthTotal - budget)}`
          : `Disponible: ${showBalance ? formatMoney(budget - monthTotal) : '•••'}`}
      </p>

      {/* Formulario de edición inline */}
      {editing && (
        <div className="mt-3 flex gap-2 animate-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
          <input
            type="number"
            autoFocus
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Nuevo presupuesto"
            min="0"
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-blue-500"
          />
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">Guardar</button>
          <button onClick={handleRemove} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 text-xs font-bold transition">
            <i className="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      )}
    </Card>
  );
};

// ─── SwipeableBillCard (Mobile swipe gesture to pay/unpay) ───────────────────
const SwipeableBillCard = ({ bill, onSwipePay, children }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const isHorizontal = useRef(null);

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isHorizontal.current = null;
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStart.current.x;
    const diffY = currentY - touchStart.current.y;

    if (isHorizontal.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (!isHorizontal.current) return;

    // Solo permitir swipe a la derecha
    if (diffX > 0) {
      const clamped = diffX > 80 ? 80 + (diffX - 80) * 0.3 : diffX;
      setOffsetX(Math.min(clamped, 120));
      setIsSwiping(true);
    } else {
      setOffsetX(0);
      setIsSwiping(false);
    }
  };

  const handleTouchEnd = () => {
    if (offsetX >= 75) {
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(30);
        }
      } catch (err) {}
      onSwipePay(bill);
    }
    setOffsetX(0);
    setIsSwiping(false);
    isHorizontal.current = null;
  };

  const progress = Math.min(offsetX / 75, 1);

  return (
    <div className={`relative rounded-3xl touch-pan-y ${isSwiping || offsetX > 0 ? 'overflow-hidden' : 'overflow-visible'}`}>
      {/* Fondo de acción al deslizar */}
      <div
        className={`absolute inset-0 rounded-3xl flex items-center px-6 transition-opacity duration-150 ${
          bill.paid
            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
            : 'bg-gradient-to-r from-emerald-500 to-green-500'
        }`}
        style={{ opacity: progress > 0.05 ? 1 : 0 }}
      >
        <div
          className="flex items-center gap-2 text-white font-black text-sm transition-transform duration-150"
          style={{ transform: `scale(${0.8 + progress * 0.3})` }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <i className={`fa-solid ${bill.paid ? 'fa-rotate-left' : 'fa-check'}`}></i>
          </div>
          <span className="tracking-wide uppercase text-xs font-bold">
            {bill.paid ? 'Desmarcar' : 'Pagar'}
          </span>
        </div>
      </div>

      {/* Tarjeta frontal con animación suave al soltar */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          transform: offsetX > 0 ? `translateX(${offsetX}px)` : undefined,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="relative z-10"
      >
        {children}
      </div>
    </div>
  );
};

export const DashboardView = ({
  bills,
  showBalance,
  calculatePendingTotal,
  calculatePaidThisMonth,
  currentMonthProgress,
  getNextDueBill,
  urgentBill: propUrgentBill,
  isOverdueAlert: propIsOverdueAlert,
  overdueCount: propOverdueCount,
  handleEdit,
  handleDeleteClick,
  handleTogglePaid,
  activeMenu,
  setActiveMenu,
  budget,
  onSetBudget,
  monthTotal,
}) => {
  const container = useRef(null);
  const billStates = useRef({});
  
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'overdue' | 'paid'

  const pendingCount = useMemo(() => bills?.filter(b => !b.paid).length || 0, [bills]);
  const overdueCount = propOverdueCount !== undefined ? propOverdueCount : (bills?.filter(b => !b.paid && isOverdue(b.dueDate)).length || 0);
  const paidCount = useMemo(() => bills?.filter(b => b.paid).length || 0, [bills]);

  const targetUrgentBill = propUrgentBill !== undefined ? propUrgentBill : (getNextDueBill ? getNextDueBill() : null);
  const hasOverdueAlert = propIsOverdueAlert !== undefined ? propIsOverdueAlert : (overdueCount > 0);

  // Lógica de filtrado y ordenado cronológico natural
  const monthBills = useMemo(() => {
    let list = [...bills];

    // Aplicar filtro
    if (filter === 'pending') {
      list = list.filter(b => !b.paid);
    } else if (filter === 'overdue') {
      list = list.filter(b => !b.paid && isOverdue(b.dueDate));
    } else if (filter === 'paid') {
      list = list.filter(b => b.paid);
    }

    // Orden cronológico natural por vencimiento (impagos primero)
    return list.sort((a, b) => {
      if (a.paid !== b.paid) return a.paid ? 1 : -1;
      const timeA = a.dueDate ? new Date(a.dueDate + 'T12:00:00').getTime() : 0;
      const timeB = b.dueDate ? new Date(b.dueDate + 'T12:00:00').getTime() : 0;
      return timeA - timeB;
    });
  }, [bills, filter]);

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
    if (!dateStr) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr + 'T12:00:00');
    date.setHours(0, 0, 0, 0);
    
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    if (diffDays === -1) return 'Venció ayer';
    if (diffDays < -1) return `Venció hace ${Math.abs(diffDays)} días`;
    if (diffDays > 1 && diffDays <= 7) return `Vence en ${diffDays} días`;
    
    return `Vence el ${date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`;
  };

  return (
    <div ref={container}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Card 1: Pendiente Total */}
        <Card className={`!p-4 sm:!p-6 !rounded-2xl relative overflow-hidden transition-all duration-700 ${calculatePendingTotal() === 0 ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border-none shadow-[0_20px_50px_rgba(245,158,11,0.3)]' : ''}`}>
          <div className="relative z-10">
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${calculatePendingTotal() === 0 ? 'text-white opacity-80' : 'text-orange-500 dark:text-orange-400'}`}>
              {calculatePendingTotal() === 0 ? '¡Felicidades!' : 'Pendiente Total'}
            </p>
            <p className={`text-2xl sm:text-3xl font-black tracking-tight ${calculatePendingTotal() === 0 ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
              {calculatePendingTotal() === 0 ? '¡Todo al día!' : formatMoneyProtected(calculatePendingTotal(), showBalance)}
            </p>
            <p className={`text-xs sm:text-sm mt-1 font-medium ${calculatePendingTotal() === 0 ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
              {calculatePendingTotal() === 0 ? 'Sin deudas este mes' : `${pendingCount} facturas sin pagar`}
            </p>
          </div>
          <div className={`absolute right-0 bottom-0 w-20 sm:w-24 h-20 sm:h-24 rounded-tl-full -mr-3 -mb-3 transition-all ${calculatePendingTotal() === 0 ? 'bg-white/20' : 'bg-orange-50 dark:bg-orange-500/5 opacity-50'}`}></div>
          {calculatePendingTotal() === 0 && (
            <div className="absolute top-2 right-2 text-white/20 text-3xl sm:text-4xl rotate-12">
              <i className="fa-solid fa-star"></i>
            </div>
          )}
        </Card>

        {/* Card 2: Pagado (Mes) */}
        <Card className="!p-4 sm:!p-6 !rounded-2xl relative overflow-hidden">
          <div className="relative z-10 w-full">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-bold uppercase tracking-wider text-green-600">Pagado (Mes)</p>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{Math.round(currentMonthProgress())}%</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              {formatMoneyProtected(calculatePaidThisMonth(), showBalance)}
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 mt-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000 ${currentMonthProgress() >= 100 ? 'animate-pulse' : ''}`} 
                style={{ width: `${Math.min(100, currentMonthProgress())}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Card 3: Próximo Vencimiento / Alerta Vencida */}
        <Card className={`col-span-2 md:col-span-1 !p-3.5 sm:!p-5 !rounded-2xl relative overflow-hidden transition-all duration-300 ${
          hasOverdueAlert && targetUrgentBill
            ? 'border-red-200 dark:border-red-500/30 bg-red-50/40 dark:bg-red-500/5' 
            : 'border-blue-100 dark:border-blue-500/20'
        }`}>
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none ${
            hasOverdueAlert && targetUrgentBill ? 'bg-red-500 opacity-15' : 'bg-blue-500 opacity-10'
          }`}></div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Header de la tarjeta */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {hasOverdueAlert && targetUrgentBill && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                )}
                <p className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate ${
                  hasOverdueAlert && targetUrgentBill ? 'text-red-500 font-black' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {hasOverdueAlert && targetUrgentBill
                    ? `Tenés ${overdueCount} ${overdueCount === 1 ? 'factura vencida' : 'facturas vencidas'}`
                    : 'Próximo Vencimiento'}
                </p>
              </div>
              <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                hasOverdueAlert && targetUrgentBill
                  ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
              }`}>
                {targetUrgentBill ? getRelativeDateString(targetUrgentBill.dueDate) : 'Todo al día'}
              </span>
            </div>

            {/* Contenido principal: Título, Monto y Botón de pago rápido */}
            {targetUrgentBill ? (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-lg font-black truncate text-slate-800 dark:text-white" title={targetUrgentBill.name}>
                    {targetUrgentBill.name}
                  </p>
                  <p className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                    {targetUrgentBill.amount > 0 
                      ? (showBalance ? formatMoney(targetUrgentBill.amount) : '••••••')
                      : <span className="text-xs text-amber-500 font-bold">Sin monto</span>
                    }
                  </p>
                </div>
                <Button
                  variant={hasOverdueAlert ? 'danger' : 'secondary'}
                  className={`!px-3.5 !py-1.5 !text-xs font-bold !rounded-xl shrink-0 shadow-sm transition-transform active:scale-95 ${
                    hasOverdueAlert ? '!bg-red-600 hover:!bg-red-700 !text-white border-none shadow-red-500/25' : ''
                  }`}
                  onClick={() => handleTogglePaid(targetUrgentBill)}
                  title="Pagar factura urgente"
                >
                  <i className="fa-solid fa-bolt mr-1 text-[10px]"></i>
                  {targetUrgentBill.amount > 0 ? 'Pagar' : 'Definir'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 py-1">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Sin facturas pendientes</p>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-lg">
                  ¡Todo al día!
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tarjeta de presupuesto (solo si hay budget configurado o siempre como CTA) */}
      <BudgetCard
        budget={budget}
        monthTotal={monthTotal}
        showBalance={showBalance}
        onSetBudget={onSetBudget}
      />

      {/* Encabezado de sección */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Este Mes</h3>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            {monthBills.length}
          </span>
        </div>
      </div>

      {/* Chips de filtro */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {[
          { id: 'all', label: 'Todos', count: bills.length },
          { id: 'pending', label: 'Pendientes', count: pendingCount },
          { id: 'overdue', label: 'Vencidos', count: overdueCount, alert: overdueCount > 0 },
          { id: 'paid', label: 'Pagados', count: paidCount },
        ].map((chip) => {
          const isActive = filter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-300/80 dark:border-white/10'
              }`}
            >
              {chip.alert && !isActive && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
              <span>{chip.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hint para mobile swipe */}
      <p className="md:hidden text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
        <i className="fa-solid fa-hand-point-right text-blue-600 dark:text-blue-400"></i>
        <span>Deslizá una tarjeta a la derecha para pagar rápido</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
        {monthBills.map(bill => (
          <div key={bill.id} data-id={bill.id} className={`bill-card-item transition-all ${activeMenu === bill.id ? 'relative z-40' : 'relative z-0'}`}>
            <SwipeableBillCard bill={bill} onSwipePay={handleTogglePaid}>
              <Card 
                className={`group !overflow-visible !p-4 sm:!p-5 !rounded-2xl transition-all duration-300 ${bill.paid ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${bill.paid ? 'bg-green-500' : isOverdue(bill.dueDate) ? 'bg-red-500' : bill.amount > 0 ? 'bg-orange-400' : 'bg-blue-500'}`}></div>
                </div>

                {/* Fila Superior: Icono + Nombre/Categoría + Importe + Menú */}
                <div className="flex justify-between items-center gap-2 mb-2 relative z-10 pl-0.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-none mt-0.5 truncate">{getCategoryLabel(bill.category)}</p>
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
                        className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 w-8 h-8 flex items-center justify-center transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
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
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate flex items-center gap-1.5">
                          <i className="fa-regular fa-calendar text-[11px] text-slate-500 dark:text-slate-400"></i>
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
            </SwipeableBillCard>
          </div>
        ))}
        {monthBills.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white/45 dark:bg-slate-800/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400 mb-4 shadow-inner">
              <i className={filter === 'all' ? 'fa-solid fa-receipt' : 'fa-solid fa-filter'}></i>
            </div>
            <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
              {bills.length === 0
                ? 'No hay servicios registrados'
                : `No hay servicios ${filter === 'pending' ? 'pendientes' : filter === 'overdue' ? 'vencidos' : filter === 'paid' ? 'pagados' : ''}`}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6 font-medium leading-relaxed">
              {bills.length === 0
                ? 'Comenzá a organizar tus cuentas agregando tu primer servicio de luz, agua, internet, etc.'
                : 'Cambiá el filtro activo para ver el resto de tus facturas.'}
            </p>
            {bills.length === 0 ? (
              <Button onClick={() => handleEdit(null)} className="!rounded-full px-6 py-2.5 text-xs font-black shadow-md shadow-blue-500/20 active:scale-95 transition-transform">
                Agregar Servicio
              </Button>
            ) : (
              <button
                onClick={() => setFilter('all')}
                className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all"
              >
                Ver todos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
