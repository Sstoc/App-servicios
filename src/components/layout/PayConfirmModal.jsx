import React, { useState, useLayoutEffect } from 'react';
import { formatMoney, getDiffDays } from '../../lib/utils';
import { Card, Button } from '../ui';

/**
 * PayConfirmModal
 * Modal centrado con animaciones fluidas (animate-modal-in / animate-modal-out).
 * Sirve tanto para:
 *   - Confirmar el pago de un servicio pendiente
 *   - Confirmar volver a poner un servicio pagado como impago (evita desmarques accidentales)
 * Props:
 *   bill      – el servicio a confirmar (o null para cerrar)
 *   onConfirm – callback al confirmar la acción
 *   onClose   – callback al cancelar
 */
export const PayConfirmModal = ({ bill, onConfirm, onClose }) => {
  const [show, setShow] = useState(false);
  const [currentBill, setCurrentBill] = useState(bill);

  useLayoutEffect(() => {
    if (bill) {
      setCurrentBill(bill);
      setShow(true);
    }
  }, [bill]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleConfirm = () => {
    setShow(false);
    setTimeout(() => {
      onConfirm();
    }, 300);
  };

  if (!bill && !show) return null;

  const isPaid = !!currentBill?.paid;
  const diff = getDiffDays(currentBill?.dueDate);
  const isOverdue = diff < 0;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop con fade idéntico a BillModal */}
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Card con animate-modal-in y animate-modal-out */}
      <Card
        className={`w-full max-w-sm p-8 text-center relative z-50 border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl transition-all duration-300 !rounded-[2.5rem] ${
          show ? 'animate-modal-in' : 'animate-modal-out'
        }`}
      >
        {/* Icono grande adaptado a la acción */}
        <div
          className={`w-20 h-20 bg-white/50 dark:bg-white/10 rounded-3xl mx-auto flex items-center justify-center mb-6 text-3xl shadow-xl border ${
            isPaid
              ? 'text-amber-500 shadow-amber-500/10 border-amber-500/20'
              : isOverdue
              ? 'text-amber-500 shadow-amber-500/10 border-amber-500/20'
              : 'text-green-500 shadow-green-500/10 border-green-500/20'
          }`}
        >
          <i
            className={`fa-solid ${
              isPaid
                ? 'fa-rotate-left'
                : isOverdue
                ? 'fa-triangle-exclamation'
                : 'fa-check'
            }`}
          ></i>
        </div>

        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
          {isPaid ? '¿Marcar como impago?' : '¿Confirmar pago?'}
        </h3>

        <p className="text-blue-600 dark:text-blue-400 font-black text-lg mb-1 uppercase tracking-tight">
          {currentBill?.name}
        </p>

        <p className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
          {formatMoney(currentBill?.amount)}
        </p>

        {isPaid ? (
          <p className="text-sm font-medium mb-8 leading-relaxed text-slate-500 dark:text-slate-400">
            El servicio volverá a figurar como <span className="text-amber-500 font-bold">pendiente</span> y se descontará del total pagado este mes.
          </p>
        ) : (
          <p
            className={`text-sm font-medium mb-8 leading-relaxed ${
              isOverdue ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {isOverdue
              ? `Venció hace ${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'día' : 'días'}`
              : diff === 0
              ? 'Vence hoy'
              : `Vence en ${diff} ${diff === 1 ? 'día' : 'días'}`}
          </p>
        )}

        {/* Botones */}
        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="flex-1 !rounded-2xl font-bold py-4 hover:bg-slate-100/50"
            onClick={handleClose}
          >
            Cancelar
          </Button>

          {isPaid ? (
            <button
              onClick={handleConfirm}
              className="flex-1 !rounded-2xl font-black py-4 text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 border border-amber-400/30"
            >
              <i className="fa-solid fa-rotate-left"></i>
              Desmarcar
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="flex-1 !rounded-2xl font-black py-4 text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 border border-green-400/30"
            >
              <i className="fa-solid fa-check"></i>
              Pagar
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};
