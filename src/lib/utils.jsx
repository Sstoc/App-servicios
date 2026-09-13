import React from 'react';

// Caché en memoria para evitar accesos lentos en renderizado
let cachedCategories = [];

export const setCustomCategoriesCache = (categories) => {
  cachedCategories = Array.isArray(categories) ? categories : [];
};

const getCustomCategoriesCached = () => {
  return cachedCategories;
};

/**
 * Formatea un monto a moneda ARS.
 */
export const formatMoney = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    minimumFractionDigits: 0 
  }).format(num);
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
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T12:00:00');
  if (isNaN(due.getTime())) return false;
  return due < today;
};

/**
 * Obtiene la diferencia de días entre hoy y una fecha.
 */
export const getDiffDays = (dateStr) => {
  if (!dateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr + 'T12:00:00');
  if (isNaN(dueDate.getTime())) return 999;
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Retorna el icono correspondiente a una categoría (incluyendo personalizadas).
 */
export const getIcon = (category) => {
  switch (category) {
    case 'casa': return <i className="fa-solid fa-house"></i>;
    case 'auto': return <i className="fa-solid fa-car-side"></i>;
    case 'otro': return <i className="fa-solid fa-credit-card"></i>;
    default: {
      const custom = getCustomCategoriesCached();
      const found = custom.find(c => c.id === category);
      if (found && found.icon) {
        return <i className={`fa-solid ${found.icon}`}></i>;
      }
      return <i className="fa-solid fa-tag"></i>;
    }
  }
};

/**
 * Retorna el nombre legible de una categoría (incluyendo personalizadas).
 */
export const getCategoryLabel = (category) => {
  const defaults = { casa: 'Casa', auto: 'Auto', otro: 'Otro' };
  if (defaults[category]) return defaults[category];
  const custom = getCustomCategoriesCached();
  const found = custom.find(c => c.id === category);
  if (found && found.label) return found.label;
  if (!category) return 'Otro';
  return category.charAt(0).toUpperCase() + category.slice(1);
};
