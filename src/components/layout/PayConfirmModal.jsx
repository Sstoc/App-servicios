import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMoney, getDiffDays } from '../../lib/utils';
import { Button } from '../ui';
import { modalDrillInVariants, backdropFadeVariants } from '../../utils/fluentMotion';

/**
 * PayConfirmModal
 * Modal centrado con animaciones fluidas Fluent Design (WinUI 3 / Drill-In).
 * Sirve tanto para:
 *   - Confirmar el pago de un servicio pendiente
 *   - Confirmar volver a poner un servicio pagado como impago (evita desmarques accidentales)
 * Props:
 *   bill      – el servicio a confirmar (o null para cerrar)
 *   onConfirm – callback al confirmar la acción
 *   onClose   – callback al cancelar
 */
export const PayConfirmModal = ({ bill, onConfirm, onClose }) => {
  const lastBillRef = useRef(bill);
  if (bill) lastBillRef.current = bill;
  const currentBill = bill || lastBillRef.current;
  const isVisible = Boolean(bill);

  const isPaid = !!currentBill?.paid;
  const diff = getDiffDays(currentBill?.dueDate);
  const isOverdue = diff < 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop con fade idéntico a BillModal */}
          <motion.div
            key="pay-confirm-backdrop"
            variants={backdropFadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Card con Fluent Drill-In */}
          <motion.div
            key="pay-confirm-card"
            variants={modalDrillInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="card-item w-full max-w-sm p-8 text-center relative z-50 border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111A2D] shadow-2xl !rounded-[2.5rem]"
          >
            {/* Icono grande adaptado a la acción */}
            <div
              className={`w-20 h-20 bg-[#EEF2F7] dark:bg-[#1B263B] rounded-3xl mx-auto flex items-center justify-center mb-6 text-3xl shadow-xl border ${
                isPaid
                  ? 'text-[#B45309] dark:text-[#F59E0B] border-[#B45309]/20'
                  : isOverdue
                  ? 'text-[#DC2626] dark:text-[#F04452] border-[#DC2626]/20'
                  : 'text-[#15803D] dark:text-[#16A765] border-[#15803D]/20'
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

            <h3 className="text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9] mb-2 tracking-tight">
              {isPaid ? '¿Marcar como impago?' : '¿Confirmar pago?'}
            </h3>

            <p className="text-[#2563EB] dark:text-[#3478F6] font-black text-lg mb-1 uppercase tracking-tight">
              {currentBill?.name}
            </p>

            <p className="text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9] mb-2 tracking-tight">
              {formatMoney(currentBill?.amount)}
            </p>

            {isPaid ? (
              <p className="text-sm font-medium mb-8 leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                El servicio volverá a figurar como <span className="text-[#B45309] dark:text-[#F59E0B] font-bold">pendiente</span> y se descontará del total pagado este mes.
              </p>
            ) : (
              <p
                className={`text-sm font-medium mb-8 leading-relaxed ${
                  isOverdue ? 'text-[#DC2626] dark:text-[#F04452] font-bold' : 'text-[#64748B] dark:text-[#94A3B8]'
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
                className="flex-1 !rounded-2xl font-bold py-4 hover:bg-[#EEF2F7] dark:hover:bg-[#1B263B]"
                onClick={onClose}
              >
                Cancelar
              </Button>

              {isPaid ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={onConfirm}
                  className="flex-1 !rounded-2xl font-black py-4 text-white bg-[#B45309] hover:bg-amber-600 dark:bg-[#F59E0B] dark:hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-colors text-sm flex items-center justify-center gap-2 border border-transparent"
                >
                  <i className="fa-solid fa-rotate-left"></i>
                  Desmarcar
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={onConfirm}
                  className="flex-1 !rounded-2xl font-black py-4 text-white bg-[#15803D] hover:bg-green-700 dark:bg-[#16A765] dark:hover:bg-emerald-600 shadow-lg shadow-green-500/25 transition-colors text-sm flex items-center justify-center gap-2 border border-transparent"
                >
                  <i className="fa-solid fa-check"></i>
                  Pagar
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
