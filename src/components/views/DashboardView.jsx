import React, { useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../ui';
import { formatMoney, formatMoneyProtected, getIcon, getCategoryLabel, isOverdue } from '../../lib/utils';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { staggerContainerVariants, staggerItemVariants, fluentPillSpring } from '../../utils/fluentMotion';

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
    if (editing) {
      return (
        <div className="mb-3 sm:mb-6">
          <div className="w-full py-2 sm:py-2.5 px-3.5 rounded-xl border border-dashed border-[#2563EB]/40 dark:border-[#3478F6]/40 bg-blue-50/40 dark:bg-[#3478F6]/5 transition-all flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-[#0F172A] dark:text-[#F1F5F9]">
              <i className="fa-solid fa-bullseye text-sm text-[#2563EB] dark:text-[#3478F6]"></i>
              <span>Presupuesto:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                autoFocus
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setEditing(false);
                }}
                placeholder="Ej: 50000"
                min="0"
                className="w-24 sm:w-28 px-2 py-1 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#1B263B] text-[#0F172A] dark:text-[#F1F5F9] outline-none focus:border-[#2563EB] dark:focus:border-[#3478F6]"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-2.5 py-1 rounded-lg bg-[#2563EB] dark:bg-[#3478F6] text-white text-[11px] font-bold hover:bg-blue-700 transition"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-1.5 py-1 text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] text-xs"
                title="Cancelar"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-3 sm:mb-6">
        <button
          type="button"
          onClick={() => { setInputVal(''); setEditing(true); }}
          className="w-full py-2 sm:py-2.5 px-3.5 rounded-xl border border-dashed border-[#E2E8F0] dark:border-[#253149] text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#3478F6] hover:border-blue-300 dark:hover:border-[#3478F6]/30 transition-all flex items-center justify-between text-xs font-semibold group"
        >
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bullseye text-sm group-hover:scale-110 transition-transform text-[#2563EB]/70 dark:text-[#3478F6]/70"></i>
            <span>Establecer presupuesto mensual</span>
          </div>
          <i className="fa-solid fa-plus text-[10px] opacity-60"></i>
        </button>
      </div>
    );
  }

  // Con presupuesto configurado
  return (
    <Card className={`mb-3 sm:mb-6 !p-3.5 sm:!p-5 !rounded-2xl transition-all duration-500 ${hasExceeded ? 'border-red-200 dark:border-[#F04452]/40 bg-red-50/50 dark:bg-[#F04452]/5' : 'border-[#E2E8F0] dark:border-[#253149]'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${hasExceeded ? 'text-[#DC2626] dark:text-[#F04452]' : 'text-[#2563EB] dark:text-[#3478F6]'}`}>
            {hasExceeded ? '⚠ Presupuesto superado' : 'Presupuesto del mes'}
          </p>
          <p className="text-lg sm:text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9] mt-0.5">
            {showBalance ? (
              <span>
                <span className={hasExceeded ? 'text-[#DC2626] dark:text-[#F04452]' : ''}>{formatMoney(monthTotal)}</span>
                <span className="text-slate-300 dark:text-[#253149] text-sm sm:text-base font-bold"> / </span>
                <span className="text-[#64748B] dark:text-[#94A3B8] text-sm sm:text-base font-bold">{formatMoney(budget)}</span>
              </span>
            ) : '••• / •••'}
          </p>
        </div>
        <button
          onClick={() => { setInputVal(String(budget)); setEditing(v => !v); }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#EEF2F7] dark:bg-[#1B263B] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#3478F6] transition-all"
          title="Editar presupuesto"
        >
          <i className="fa-solid fa-pen text-[10px] sm:text-xs"></i>
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-[#EEF2F7] dark:bg-[#1B263B] h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${hasExceeded ? 'bg-gradient-to-r from-red-500 to-[#F04452] animate-pulse' : pct > 80 ? 'bg-gradient-to-r from-amber-400 to-[#F59E0B]' : 'bg-gradient-to-r from-[#2563EB] to-[#3478F6]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-2 font-medium">
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
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#1B263B] text-[#0F172A] dark:text-[#F1F5F9] outline-none focus:border-[#2563EB] dark:focus:border-[#3478F6]"
          />
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-[#2563EB] dark:bg-[#3478F6] text-white text-xs font-bold hover:bg-blue-700 transition">Guardar</button>
          <button onClick={handleRemove} className="px-3 py-2 rounded-xl bg-[#EEF2F7] dark:bg-[#1B263B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#F04452] text-xs font-bold transition">
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
    
    // Solo animar la tarjeta que realmente cambió su estado de pago
    // No modifica la opacidad (gestionada limpiamente por CSS/Tailwind) para que todos los pendientes se vean siempre al 100%
    bills.forEach(bill => {
      const wasPaid = billStates.current[bill.id];
      if (wasPaid !== undefined && wasPaid !== bill.paid) {
        const target = container.current.querySelector(`.bill-card-item[data-id="${bill.id}"]`);
        if (target) {
          gsap.fromTo(target, 
            { y: bill.paid ? -10 : 10 }, 
            { y: 0, duration: 0.35, ease: "back.out(1.5)", clearProps: "transform" }
          );
        }
      }
      billStates.current[bill.id] = bill.paid;
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
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${calculatePendingTotal() === 0 ? 'text-white opacity-80' : 'text-[#B45309] dark:text-[#F59E0B]'}`}>
              {calculatePendingTotal() === 0 ? '¡Felicidades!' : 'Pendiente Total'}
            </p>
            <p className={`text-2xl sm:text-3xl font-black tracking-tight ${calculatePendingTotal() === 0 ? 'text-white' : 'text-[#0F172A] dark:text-[#F1F5F9]'}`}>
              {calculatePendingTotal() === 0 ? '¡Todo al día!' : formatMoneyProtected(calculatePendingTotal(), showBalance)}
            </p>
            <p className={`text-xs sm:text-sm mt-1 font-medium ${calculatePendingTotal() === 0 ? 'text-white/80' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
              {calculatePendingTotal() === 0 ? 'Sin deudas este mes' : `${pendingCount} ${pendingCount === 1 ? 'factura sin pagar' : 'facturas sin pagar'}`}
            </p>
          </div>
          <div className={`absolute right-0 bottom-0 w-20 sm:w-24 h-20 sm:h-24 rounded-tl-full -mr-3 -mb-3 transition-all ${calculatePendingTotal() === 0 ? 'bg-white/20' : 'bg-amber-500/5 dark:bg-amber-500/10 pointer-events-none'}`}></div>
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
              <p className="text-xs font-bold uppercase tracking-wider text-[#15803D] dark:text-[#16A765]">Pagado (Mes)</p>
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">{Math.round(currentMonthProgress())}%</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
              {formatMoneyProtected(calculatePaidThisMonth(), showBalance)}
            </p>
            <div className="w-full bg-[#EEF2F7] dark:bg-[#1B263B] h-2 mt-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-[#15803D] to-[#16A765] transition-all duration-1000 ${currentMonthProgress() >= 100 ? 'animate-pulse' : ''}`} 
                style={{ width: `${Math.min(100, currentMonthProgress())}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Card 3: Próximo Vencimiento / Alerta Vencida */}
        <Card className={`col-span-2 md:col-span-1 !p-3.5 sm:!p-5 !rounded-2xl relative overflow-hidden transition-all duration-300 ${
          hasOverdueAlert && targetUrgentBill
            ? 'border-red-200 dark:border-[#F04452]/40 bg-red-50/40 dark:bg-[#F04452]/5' 
            : 'border-[#E2E8F0] dark:border-[#253149]'
        }`}>
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none ${
            hasOverdueAlert && targetUrgentBill ? 'bg-red-500 opacity-15' : 'bg-blue-500 opacity-10'
          }`}></div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Header de la tarjeta */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {hasOverdueAlert && targetUrgentBill && (
                  <span className="w-2 h-2 rounded-full bg-[#DC2626] dark:bg-[#F04452] animate-pulse shrink-0"></span>
                )}
                <p className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate ${
                  hasOverdueAlert && targetUrgentBill ? 'text-[#DC2626] dark:text-[#F04452] font-black' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}>
                  {hasOverdueAlert && targetUrgentBill
                    ? `Tenés ${overdueCount} ${overdueCount === 1 ? 'factura vencida' : 'facturas vencidas'}`
                    : 'Próximo Vencimiento'}
                </p>
              </div>
              <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                hasOverdueAlert && targetUrgentBill
                  ? 'bg-red-50 text-[#DC2626] dark:bg-[#F04452]/20 dark:text-[#F04452]'
                  : 'bg-blue-50 text-[#2563EB] dark:bg-[#3478F6]/15 dark:text-[#3478F6]'
              }`}>
                {targetUrgentBill ? getRelativeDateString(targetUrgentBill.dueDate) : 'Todo al día'}
              </span>
            </div>

            {/* Contenido principal: Título, Monto y Botón de pago rápido */}
            {targetUrgentBill ? (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-lg font-black truncate text-[#0F172A] dark:text-[#F1F5F9]" title={targetUrgentBill.name}>
                    {targetUrgentBill.name}
                  </p>
                  <p className="text-sm sm:text-base font-black text-[#0F172A] dark:text-[#F1F5F9] mt-0.5">
                    {targetUrgentBill.amount > 0 
                      ? (showBalance ? formatMoney(targetUrgentBill.amount) : '••••••')
                      : <span className="text-xs text-[#B45309] dark:text-[#F59E0B] font-bold">Sin monto</span>
                    }
                  </p>
                </div>
                <Button
                  variant={hasOverdueAlert ? 'danger' : 'secondary'}
                  className={`!px-3.5 !py-1.5 !text-xs font-bold !rounded-xl shrink-0 shadow-sm transition-transform active:scale-95 ${
                    hasOverdueAlert ? '!bg-[#DC2626] hover:!bg-red-700 dark:!bg-[#F04452] dark:hover:!bg-red-600 !text-white border-none shadow-red-500/25' : ''
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
                <p className="text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">Sin facturas pendientes</p>
                <span className="text-xs font-bold text-[#15803D] dark:text-[#16A765] bg-emerald-50 dark:bg-[#16A765]/15 px-2.5 py-0.5 rounded-lg">
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
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">Este Mes</h3>
          <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#EEF2F7] dark:bg-[#1B263B] px-2.5 py-0.5 rounded-full">
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
            <motion.button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 450, damping: 16 }}
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-white'
                  : 'bg-white dark:bg-[#111A2D] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#253149]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDashboardFilter"
                  transition={fluentPillSpring}
                  className="absolute inset-0 bg-[#2563EB] dark:bg-[#3478F6] rounded-full shadow-md shadow-blue-500/25 pointer-events-none"
                />
              )}
              {chip.alert && !isActive && (
                <span className="w-2 h-2 rounded-full bg-[#DC2626] dark:bg-[#F04452] animate-pulse relative z-10"></span>
              )}
              <span className="relative z-10">{chip.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black relative z-10 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EEF2F7] dark:bg-[#1B263B] text-[#64748B] dark:text-[#94A3B8]'
                }`}
              >
                {chip.count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Hint para mobile swipe */}
      <p className="md:hidden text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-3 flex items-center gap-1.5">
        <i className="fa-solid fa-hand-point-right text-[#2563EB] dark:text-[#3478F6]"></i>
        <span>Deslizá una tarjeta a la derecha para pagar rápido</span>
      </p>

      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20"
      >
        {monthBills.map(bill => (
          <motion.div
            layout="position"
            variants={staggerItemVariants}
            key={bill.id}
            data-id={bill.id}
            className={`bill-card-item transition-colors ${activeMenu === bill.id ? 'relative z-40' : 'relative z-0'}`}
          >
            <SwipeableBillCard bill={bill} onSwipePay={handleTogglePaid}>
              <Card 
                className={`group !overflow-visible !p-4 sm:!p-5 !rounded-2xl transition-all duration-300 ${bill.paid ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${bill.paid ? 'bg-[#15803D] dark:bg-[#16A765]' : isOverdue(bill.dueDate) ? 'bg-[#DC2626] dark:bg-[#F04452]' : bill.amount > 0 ? 'bg-[#B45309] dark:bg-[#F59E0B]' : 'bg-[#2563EB] dark:bg-[#3478F6]'}`}></div>
                </div>

                {/* Fila Superior: Icono + Nombre/Categoría + Importe + Menú */}
                <div className="flex justify-between items-center gap-2 mb-2 relative z-10 pl-0.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm bg-[#EEF2F7] dark:bg-[#1B263B] text-[#0F172A] dark:text-[#F1F5F9] border border-[#E2E8F0]/60 dark:border-[#253149]">
                      {getIcon(bill.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[#0F172A] dark:text-[#F1F5F9] text-[15px] sm:text-base leading-tight truncate" title={bill.name}>
                        {bill.name}
                        {bill.isInstallments && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 align-middle">
                            {bill.currentInstallment}/{bill.totalInstallments}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium leading-none mt-0.5 truncate">{getCategoryLabel(bill.category)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {bill.amount >= 0 && (
                      <span className="font-black text-lg sm:text-xl text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">
                        {showBalance ? formatMoney(bill.amount) : '****'}
                      </span>
                    )}
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === bill.id ? null : bill.id); }}
                        className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] w-8 h-8 flex items-center justify-center transition-colors rounded-full hover:bg-[#EEF2F7] dark:hover:bg-[#1B263B] active:scale-95"
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
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-[#1B263B]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#E2E8F0] dark:border-[#253149] z-[200] overflow-hidden py-1.5 popup-animate origin-top-right">
                            <button onClick={() => { handleEdit(bill); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#EEF2F7] dark:hover:bg-[#111A2D] transition">
                              <i className="fa-solid fa-pen-to-square text-[#64748B] dark:text-[#94A3B8]"></i>
                              <span>Editar</span>
                            </button>
                            <button onClick={() => { handleDeleteClick(bill); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#DC2626] dark:text-[#F04452] hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                              <i className="fa-solid fa-trash-can text-[#DC2626] dark:text-[#F04452]"></i>
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fila Inferior: Estado / Vencimiento + Botón Pagar */}
                <div className="flex justify-between items-center gap-2 pt-2.5 mt-0.5 border-t border-[#EEF2F7] dark:border-[#253149] pl-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {bill.amount > 0 ? (
                      <>
                        <Badge 
                          variant={bill.paid ? 'green' : isOverdue(bill.dueDate) ? 'red' : 'default'}
                          className="!text-[10px] !px-2.5 !py-0.5 font-bold shrink-0"
                        >
                          {bill.paid ? 'Pagado' : isOverdue(bill.dueDate) ? 'Vencido' : 'Pendiente'}
                        </Badge>
                        <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold truncate flex items-center gap-1.5">
                          <i className="fa-regular fa-calendar text-[11px] text-[#64748B] dark:text-[#94A3B8]"></i>
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
                        <span className="flex items-center gap-1 text-[#15803D] dark:text-[#16A765]"><i className="fa-solid fa-check text-[11px]"></i> Pagado</span>
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
          </motion.div>
        ))}
        {monthBills.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white/60 dark:bg-[#111A2D]/60 rounded-[2.5rem] border border-[#E2E8F0] dark:border-[#253149] p-8 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-[#3478F6]/15 rounded-2xl flex items-center justify-center text-2xl text-[#2563EB] dark:text-[#3478F6] mb-4 shadow-inner">
              <i className={filter === 'all' ? 'fa-solid fa-receipt' : 'fa-solid fa-filter'}></i>
            </div>
            <h4 className="text-lg font-black text-[#0F172A] dark:text-[#F1F5F9] mb-2">
              {bills.length === 0
                ? 'No hay servicios registrados'
                : `No hay servicios ${filter === 'pending' ? 'pendientes' : filter === 'overdue' ? 'vencidos' : filter === 'paid' ? 'pagados' : ''}`}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-xs mb-6 font-medium leading-relaxed">
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
                className="px-5 py-2.5 rounded-full bg-[#2563EB] dark:bg-[#3478F6] text-white text-xs font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all"
              >
                Ver todos
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
