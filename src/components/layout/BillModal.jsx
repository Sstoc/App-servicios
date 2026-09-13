import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Card, Button } from '../ui';
import { useApp } from '../../context/AppContext';

const DEFAULT_CATEGORIES = [
  { id: 'casa', icon: 'fa-house', label: 'Casa' },
  { id: 'auto', icon: 'fa-car-side', label: 'Auto' },
  { id: 'otro', icon: 'fa-credit-card', label: 'Otro' },
];

export const BillModal = ({ isOpen, onClose, onSave, bill = null }) => {
  const { customCategories = [], saveCustomCategories, bills = [], saveBill } = useApp() || {};
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('fa-tag');

  // Estado del flujo de eliminación de categoría personalizada
  const [deletingCatId, setDeletingCatId] = useState(null);      // cat a borrar
  const [deleteStep, setDeleteStep] = useState(null);             // 'confirm' | 'reassign'
  const [reassignTarget, setReassignTarget] = useState('otro');   // cat destino

  // Referencia y estado de scroll para difuminar bordes izquierdo/derecho en mobile
  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollIndicators = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    updateScrollIndicators();
    const timer = setTimeout(updateScrollIndicators, 100);
    el.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', updateScrollIndicators);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [customCategories, show, isAddingCategory]);

  const getMaskStyle = () => {
    // En mobile genera el difuminado suave en los bordes como el nav
    if (canScrollLeft && canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 32px), transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 32px), transparent 100%)'
      };
    }
    if (canScrollLeft) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 24px, black 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 24px, black 100%)'
      };
    }
    if (canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, black 0%, black calc(100% - 32px), transparent 100%)',
        maskImage: 'linear-gradient(to right, black 0%, black calc(100% - 32px), transparent 100%)'
      };
    }
    return {};
  };

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
      setFormError(''); // Limpiar error al abrir
      setIsAddingCategory(false);
      setNewCategoryName('');

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

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const id = trimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    const all = [...DEFAULT_CATEGORIES, ...customCategories];
    const existing = all.find(c => c.id === id);
    if (existing) {
      setForm(prev => ({ ...prev, category: existing.id }));
      setIsAddingCategory(false);
      return;
    }

    const newCat = {
      id,
      label: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      icon: newCategoryIcon || 'fa-tag'
    };

    const updated = [...customCategories, newCat];
    if (saveCustomCategories) {
      saveCustomCategories(updated);
    }

    setForm(prev => ({ ...prev, category: id }));
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  // Paso 1: el botón × abre el flujo de confirmación
  const handleDeleteCustomCategory = (e, catId) => {
    e.stopPropagation();
    setDeletingCatId(catId);
    setReassignTarget('otro');
    setDeleteStep('confirm');
  };

  // Paso 2a: cancelar en cualquier paso
  const cancelDelete = () => {
    setDeletingCatId(null);
    setDeleteStep(null);
  };

  // Paso 2b: confirmar — si hay servicios afectados → pedir reasignación, si no → borrar directo
  const confirmDeleteStep = () => {
    const affected = bills.filter(b => b.category === deletingCatId);
    if (affected.length > 0) {
      setDeleteStep('reassign');
    } else {
      executeDelete(null);
    }
  };

  // Paso 3: ejecutar borrado y reasignación en masa
  const executeDelete = async (targetCat) => {
    const affected = bills.filter(b => b.category === deletingCatId);
    const destination = targetCat || reassignTarget;

    // Reasignar servicios afectados
    if (affected.length > 0 && saveBill) {
      for (const bill of affected) {
        await saveBill({ ...bill, category: destination }, true);
      }
    }

    // Borrar la categoría
    const updated = customCategories.filter(c => c.id !== deletingCatId);
    if (saveCustomCategories) saveCustomCategories(updated);

    // Si el form tenía esa categoría, cambiarla
    if (form.category === deletingCatId) {
      setForm(prev => ({ ...prev, category: destination }));
    }

    cancelDelete();
  };


  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen && !show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validar que la cuota actual no supere el total de cuotas
    if (form.isInstallments) {
      const current = Number(form.currentInstallment);
      const total = Number(form.totalInstallments);
      if (current > total) {
        setFormError('La cuota actual no puede ser mayor al total de cuotas.');
        return;
      }
      if (current < 1 || total < 1) {
        setFormError('Los valores de cuotas deben ser mayores a 0.');
        return;
      }
    }

    onSave(form, !!bill);
    handleClose();
  };

  const inputClass = "w-full p-4 bg-white/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 dark:text-white text-base transition-all";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      ></div>

      {/* Mobile: tarjeta centrada pill-style | Desktop: panel rectangular más ancho */}
      <Card className={`
        w-full relative z-50 border border-white/20 bg-white/70 dark:bg-slate-900/70
        backdrop-blur-2xl shadow-2xl max-h-[90vh] flex flex-col transition-all duration-300
        ${show ? 'animate-modal-in' : 'animate-modal-out'}
        max-w-[400px] !rounded-[2.5rem] p-8
        md:max-w-3xl md:!rounded-3xl md:p-0
      `}>

        {/* ─── HEADER ─────────────────────────────────── */}
        {/* Mobile: centrado vertical | Desktop: barra horizontal */}
        <div className="md:flex md:items-center md:gap-5 md:px-8 md:pt-7 md:pb-6 md:border-b md:border-slate-100 md:dark:border-white/5 text-center md:text-left relative mb-6 md:mb-0">

          {/* Logo */}
          <div className="w-16 h-16 md:w-12 md:h-12 bg-white/50 dark:bg-white/10 rounded-2xl md:rounded-xl mx-auto md:mx-0 flex-shrink-0 flex items-center justify-center shadow-lg border border-white/20">
            <img src="/logo-home.png" alt="Logo" className="w-12 h-12 md:w-9 md:h-9 object-contain rounded-xl md:rounded-lg" />
          </div>

          {/* Título */}
          <div className="mt-3 md:mt-0 flex-1">
            <h3 className="text-2xl md:text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
              {bill ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Gestión Inteligente</p>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 md:relative md:top-auto md:right-auto w-8 h-8 rounded-full bg-white/30 dark:bg-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/20 flex items-center justify-center transition active:scale-95 border border-white/20 md:ml-auto flex-shrink-0"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* ─── FORM ────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col text-left md:px-8 md:py-6">
          <div className="space-y-5">

            {/* Nombre — ocupa todo el ancho */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre del Servicio</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                required
                placeholder="Ej: Internet, Luz, Agua..."
                className={inputClass}
              />
            </div>

            {/* Monto + Vencimiento: 2 col siempre */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Monto ($)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Vencimiento</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({...form, dueDate: e.target.value})}
                  required
                  className="w-full p-4 bg-white/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-2xl focus:border-blue-500 outline-none text-slate-800 dark:text-white font-bold text-sm transition-all"
                />
              </div>
            </div>

            {/* En desktop: Categoría + Toggles en la misma fila */}
            <div className="flex flex-col md:flex-row md:items-start gap-5">

              {/* Categoría */}
              <div className="space-y-3 md:flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    Categoría
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-blue-500/80 dark:text-blue-400/80 md:hidden flex items-center gap-1">
                      <i className="fa-solid fa-arrows-left-right text-[8px] animate-pulse"></i> Deslizá
                    </span>
                    {customCategories.length > 0 && (
                      <span className="text-[9px] font-bold text-slate-400">
                        {DEFAULT_CATEGORIES.length + customCategories.length} opciones
                      </span>
                    )}
                  </div>
                </div>

                {/* Carrusel deslizable horizontal en mobile con bordes difuminados / Grilla en desktop */}
                <div
                  ref={categoryScrollRef}
                  style={getMaskStyle()}
                  className="category-carousel-container flex overflow-x-auto gap-3 py-3 px-4 scroll-px-4 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x md:grid md:grid-cols-4 md:overflow-x-visible md:gap-2 md:px-0 md:py-0 md:scroll-px-0 transition-[mask-image] duration-200"
                >
                  {[...DEFAULT_CATEGORIES, ...customCategories].map(cat => {
                    const isSelected = form.category === cat.id;
                    const isCustom = customCategories.some(c => c.id === cat.id);

                    return (
                      <div key={cat.id} className="relative flex-shrink-0 w-[84px] md:w-auto snap-start">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, category: cat.id })}
                          className={`w-full p-2.5 md:p-3 rounded-2xl border-[0.5px] flex flex-col items-center justify-center gap-1.5 transition-all duration-300 min-h-[70px] ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.22)] scale-[1.02]'
                              : 'bg-white/40 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                        >
                          <i className={`fa-solid ${cat.icon} text-base md:text-lg`}></i>
                          <span className="text-[8px] font-bold uppercase tracking-widest truncate max-w-full px-0.5">
                            {cat.label}
                          </span>
                        </button>

                        {/* Botón eliminar categoría personalizada */}
                        {isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomCategory(e, cat.id)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-500 hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center text-[8px] shadow-sm transition-colors z-10"
                            title="Eliminar categoría"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Botón vacío con símbolo + para Agregar nueva categoría */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(!isAddingCategory);
                      setNewCategoryName('');
                    }}
                    className={`flex-shrink-0 w-[84px] md:w-auto snap-start p-2.5 md:p-3 rounded-2xl border-[1.5px] border-dashed flex flex-col items-center justify-center gap-1.5 transition-all duration-200 group active:scale-95 min-h-[70px] ${
                      isAddingCategory
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 scale-[1.02]'
                        : 'border-slate-300 dark:border-white/15 text-slate-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white/20 dark:bg-white/[0.02]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <i className="fa-solid fa-plus text-[11px]"></i>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest">
                      Agregar
                    </span>
                  </button>
                </div>

                {/* Formulario desplegable para agregar categoría */}
                {isAddingCategory && (
                  <div className="mt-2 p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-blue-200 dark:border-blue-500/30 animate-in fade-in zoom-in-95 duration-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-plus text-blue-500"></i>
                        Nueva categoría
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          }
                        }}
                        placeholder="Nombre (ej: Salud, Gym, Mascotas)..."
                        className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        Guardar
                      </button>
                    </div>

                    {/* Selector de icono rápido */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <span className="text-[8px] font-bold text-slate-400 uppercase mr-1">Icono:</span>
                      {[
                        'fa-tag', 'fa-utensils', 'fa-heart-pulse', 'fa-graduation-cap',
                        'fa-gamepad', 'fa-paw', 'fa-plane', 'fa-dumbbell',
                        'fa-briefcase', 'fa-basket-shopping', 'fa-wrench', 'fa-wifi'
                      ].map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setNewCategoryIcon(icon)}
                          className={`w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-xs transition-all ${
                            newCategoryIcon === icon
                              ? 'bg-blue-600 text-white shadow-sm scale-110'
                              : 'bg-white dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <i className={`fa-solid ${icon}`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles: apilados en mobile, columna en desktop */}
              <div className="flex flex-col gap-3 md:flex-1">
                {/* Monto Fijo */}
                <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.isFixed ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <i className="fa-solid fa-lock text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Monto Fijo</p>
                      <p className="text-[9px] text-slate-500 font-medium">Mantener importe al cambiar de mes</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({...form, isFixed: !form.isFixed})}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative flex-shrink-0 ${form.isFixed ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${form.isFixed ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                {/* Es en Cuotas */}
                <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.isInstallments ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <i className="fa-solid fa-layer-group text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Es en Cuotas</p>
                      <p className="text-[9px] text-slate-500 font-medium">Dividir o repetir el pago</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({...form, isInstallments: !form.isInstallments})}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative flex-shrink-0 ${form.isInstallments ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${form.isInstallments ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Cuotas (campos expandibles) */}
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

            {/* Error + Botón submit */}
            <div className="pt-2 md:pt-0">
              {formError && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 text-center animate-in slide-in-from-top-2 duration-200">
                  <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                  {formError}
                </div>
              )}
              {/* Mobile: botón full width | Desktop: alineado a la derecha */}
              <div className="md:flex md:justify-end">
                <button
                  type="submit"
                  className="w-full md:w-auto md:px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-check text-sm"></i>
                  {bill ? 'Actualizar Servicio' : 'Guardar Servicio'}
                </button>
              </div>
            </div>

          </div>
        </form>

        {/* Padding inferior en desktop para el form */}
        <div className="hidden md:block md:pb-2" />
      </Card>

      {/* ─── Mini-modal de eliminación de categoría ───────────────────── */}
      {deleteStep && deletingCatId && (() => {
        const deletingCat = customCategories.find(c => c.id === deletingCatId);
        const affected = bills.filter(b => b.category === deletingCatId);
        const allCats = [...DEFAULT_CATEGORIES, ...customCategories.filter(c => c.id !== deletingCatId)];

        return (
          <div className="absolute inset-0 z-[200] flex items-center justify-center p-6 rounded-[2.5rem] md:rounded-3xl overflow-hidden">
            {/* Fondo difuminado */}
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] md:rounded-3xl"
              onClick={cancelDelete}
            />

            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 p-6 animate-in fade-in zoom-in-95 duration-200">

              {deleteStep === 'confirm' && (
                <>
                  {/* Ícono de advertencia */}
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-trash-can text-red-500 text-xl" />
                  </div>
                  <h4 className="text-base font-black text-slate-800 dark:text-white text-center mb-1">
                    ¿Eliminar categoría?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-1 font-medium">
                    Vas a eliminar la categoría <span className="font-black text-slate-700 dark:text-slate-200">"{deletingCat?.label}"</span>.
                  </p>
                  {affected.length > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold text-center mb-4 bg-amber-50 dark:bg-amber-500/10 py-2 px-3 rounded-xl border border-amber-200 dark:border-amber-500/20">
                      <i className="fa-solid fa-triangle-exclamation mr-1" />
                      {affected.length} {affected.length === 1 ? 'servicio usa' : 'servicios usan'} esta categoría
                    </p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={cancelDelete}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteStep}
                      className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-lg shadow-red-500/20 transition active:scale-95"
                    >
                      {affected.length > 0 ? 'Continuar' : 'Eliminar'}
                    </button>
                  </div>
                </>
              )}

              {deleteStep === 'reassign' && (
                <>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-folder-open text-blue-500 text-xl" />
                  </div>
                  <h4 className="text-base font-black text-slate-800 dark:text-white text-center mb-1">
                    ¿A dónde mover los servicios?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4 font-medium">
                    Los <span className="font-black text-slate-700 dark:text-slate-200">{affected.length} servicios</span> de <span className="font-black">"{deletingCat?.label}"</span> serán reasignados a:
                  </p>

                  {/* Selector de categoría destino */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {allCats.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setReassignTarget(cat.id)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          reassignTarget === cat.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-[1.03]'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 hover:border-blue-400'
                        }`}
                      >
                        <i className={`fa-solid ${cat.icon} text-sm`} />
                        <span className="text-[9px] font-bold uppercase tracking-wide truncate w-full">{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={cancelDelete}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => executeDelete(reassignTarget)}
                      className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/20 transition active:scale-95"
                    >
                      <i className="fa-solid fa-check mr-1.5" />
                      Confirmar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
