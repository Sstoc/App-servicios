import React, { useState, useLayoutEffect } from 'react';
import { Card, Button } from '../ui';

/**
 * DeleteConfirmModal
 * Modal de confirmación para eliminar un servicio con animaciones de apertura y cierre
 * idénticas a BillModal (animate-modal-in y animate-modal-out).
 * Props:
 *   isOpen    – booleano indicando si el modal debe mostrarse
 *   bill      – el servicio a eliminar
 *   onConfirm – callback al confirmar la eliminación
 *   onClose   – callback al cancelar
 */
export const DeleteConfirmModal = ({ isOpen, bill, onConfirm, onClose }) => {
  const [show, setShow] = useState(false);
  const [currentBill, setCurrentBill] = useState(bill);

  useLayoutEffect(() => {
    if (isOpen) {
      if (bill) setCurrentBill(bill);
      setShow(true);
    }
  }, [isOpen, bill]);

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

  if (!isOpen && !show) return null;

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
        <div className="w-20 h-20 bg-white/50 dark:bg-white/10 text-red-500 rounded-3xl mx-auto flex items-center justify-center mb-6 text-3xl shadow-xl shadow-red-500/10 border border-red-500/10">
          <i className="fa-solid fa-trash-can"></i>
        </div>

        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
          ¿Eliminar servicio?
        </h3>

        <p className="text-blue-600 dark:text-blue-400 font-black text-lg mb-2 uppercase tracking-tight">
          {currentBill?.name}
        </p>

        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
          Se eliminarán los pagos de este mes. El historial de meses pasados se mantendrá intacto.
        </p>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="flex-1 !rounded-2xl font-bold py-4 hover:bg-slate-100/50"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="flex-1 !rounded-2xl font-black py-4 shadow-lg shadow-red-500/20"
            onClick={handleConfirm}
          >
            Eliminar
          </Button>
        </div>
      </Card>
    </div>
  );
};
