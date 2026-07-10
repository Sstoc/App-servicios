import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Card, Button } from '../ui';

export const BillModal = ({ isOpen, onClose, onSave, bill = null }) => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'casa',
    isFixed: false,
    isInstallments: false,
    totalInstallments: '',
    currentInstallment: ''
  });

  // useLayoutEffect: corre ANTES del pintado del navegador → el modal
  // siempre arranca en el estado correcto sin el frame de "aparición brusca"
  useLayoutEffect(() => {
    if (isOpen) setShow(true);
  }, [isOpen]);

  // useEffect: resetea el formulario (no afecta la animación visual)
  useEffect(() => {
    if (isOpen) {
      if (bill) {
        setForm({ 
          ...bill,
          isFixed: !!bill.isFixed,
          isInstallments: !!bill.isInstallments,
          totalInstallments: bill.totalInstallments || '',
          currentInstallment: bill.currentInstallment || ''
        });
      } else {
        setForm({
          name: '',
          amount: '',
          dueDate: new Date().toISOString().split('T')[0],
          category: 'casa',
          isFixed: false,
          isInstallments: false,
          totalInstallments: '',
          currentInstallment: ''
        });
      }
    }
  }, [bill, isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen && !show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form, !!bill);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      ></div>
      
      <Card className={`w-full max-w-[380px] p-8 text-center relative z-50 border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl !rounded-[2.5rem] max-h-[90vh] flex flex-col transition-all duration-300 ${show ? 'animate-modal-in' : 'animate-modal-out'}`}>
        
        {/* Logo minimalista o Icono de Categoría */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-white/50 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/10 border border-white/20 transition-transform active:scale-95">
            <img src="/logo-home.png" alt="Logo" className="w-16 h-16 object-contain rounded-2xl" />
          </div>
          <button 
            onClick={handleClose} 
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/30 dark:bg-white/10 text-slate-500 hover:bg-white/50 flex items-center justify-center transition active:scale-95 border border-white/20"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">
          {bill ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h3>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">Gestión Inteligente</p>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col text-left">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
              <input 
                type="text" 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                required
                placeholder="Ej: Internet, Luz..."
                className="w-full p-4 bg-white/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-800 dark:text-white text-base transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Monto ($)</label>
                <input 
                  type="number" 
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  required
                  placeholder="0.00"
                  className="w-full p-4 bg-white/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-2xl focus:border-indigo-500 outline-none font-black text-slate-800 dark:text-white text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Vencimiento</label>
                <input 
                  type="date" 
                  value={form.dueDate}
                  onChange={(e) => setForm({...form, dueDate: e.target.value})}
                  required
                  className="w-full p-4 bg-white/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-2xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Categoría</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'casa', icon: 'fa-house', label: 'Casa' },
                  { id: 'auto', icon: 'fa-car-side', label: 'Auto' },
                  { id: 'otro', icon: 'fa-credit-card', label: 'Otro' }
                ].map(cat => (
                  <button 
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({...form, category: cat.id})} 
                    className={`p-3 rounded-2xl border-[0.5px] flex flex-col items-center gap-1.5 transition-all duration-300 ${form.category === cat.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105' : 'bg-white/40 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400'}`}
                  >
                    <i className={`fa-solid ${cat.icon} text-lg`}></i>
                    <span className="text-[8px] font-bold uppercase tracking-widest">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.isFixed ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <i className="fa-solid fa-lock text-sm"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Monto Fijo</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-500 font-medium">Mantener importe al cambiar de mes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({...form, isFixed: !form.isFixed})}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative ${form.isFixed ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${form.isFixed ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.isInstallments ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <i className="fa-solid fa-layer-group text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Es en Cuotas</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-500 font-medium">Dividir o repetir el pago</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({...form, isInstallments: !form.isInstallments})}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative ${form.isInstallments ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${form.isInstallments ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {form.isInstallments && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Total Cuotas</label>
                    <input 
                      type="number" 
                      value={form.totalInstallments}
                      onChange={(e) => setForm({...form, totalInstallments: e.target.value})}
                      placeholder="Ej: 12"
                      required
                      min="1"
                      className="w-full p-3 bg-white/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-xl outline-none font-bold text-slate-800 dark:text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Cuota Actual</label>
                    <input 
                      type="number" 
                      value={form.currentInstallment}
                      onChange={(e) => setForm({...form, currentInstallment: e.target.value})}
                      placeholder="Ej: 1"
                      required
                      min="1"
                      className="w-full p-3 bg-white/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-xl outline-none font-bold text-slate-800 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-check text-base"></i>
                {bill ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
