import React from 'react';

/**
 * Formatea un monto a moneda ARS.
 */
export const formatMoney = (amount) => {
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    minimumFractionDigits: 0 
  }).format(amount);
};

/**
 * Formatea un monto con opción de ocultar el balance.
 */
export const formatMoneyProtected = (amount, showBalance) => {
  if (!showBalance) return '$\u00A0***';
  return formatMoney(amount);
};

/**
 * Verifica si una fecha ha pasado de hoy.
 */
export const isOverdue = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Usamos T12:00:00 para evitar problemas de zona horaria local
  return new Date(dateStr + 'T12:00:00') < today;
};

/**
 * Obtiene la diferencia de días entre hoy y una fecha.
 */
export const getDiffDays = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr + 'T12:00:00');
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Retorna el icono correspondiente a una categoría.
 */
export const getIcon = (category) => {
  switch (category) {
    case 'casa': return <i className="fa-solid fa-house"></i>;
    case 'auto': return <i className="fa-solid fa-car-side"></i>;
    case 'otro': return <i className="fa-solid fa-credit-card"></i>;
    default: return <i className="fa-solid fa-receipt"></i>;
  }
};
