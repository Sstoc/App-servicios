import React, { memo } from 'react';

export const Card = memo(({ children, className = "" }) => (
  <div className={`glass-card p-6 rounded-3xl shadow-weightless relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 active:scale-[0.98] ${className}`}>
    {children}
  </div>
));

export const Badge = memo(({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-100/50 text-slate-600 dark:bg-white/10 dark:text-slate-300 backdrop-blur-md",
    green: "bg-green-100/50 text-green-700 dark:bg-green-500/20 dark:text-green-400 backdrop-blur-md",
    red: "bg-red-100/50 text-red-600 dark:bg-red-500/20 dark:text-red-400 backdrop-blur-md",
    orange: "bg-orange-100/50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 backdrop-blur-md",
    indigo: "bg-indigo-100/50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 backdrop-blur-md"
  };

  return (
    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
});

export const Button = memo(({ children, variant = "primary", onClick, className = "", disabled = false, icon = null }) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30 border border-indigo-400/30",
    secondary: "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/30 dark:bg-white/10 dark:hover:bg-white/20 border border-white/5",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400",
    danger: "bg-red-500 hover:bg-red-400 text-white shadow-red-500/30 border border-red-400/30"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 shadow-lg hover:shadow-xl ${variants[variant]} ${className}`}
    >
      {icon && <i className={`${icon} transition-transform group-hover:scale-110`}></i>}
      {children}
    </button>
  );
});
