import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { buttonInteractiveMotion } from '../../utils/fluentMotion';

export const Card = memo(({ children, className = "" }) => (
  <div className={`card-item p-6 rounded-3xl relative ${className}`}>
    {children}
  </div>
));

export const Badge = memo(({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-[#EEF2F7] text-[#64748B] dark:bg-[#1B263B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#253149]",
    green: "bg-[#15803D]/10 text-[#15803D] dark:bg-[#16A765]/15 dark:text-[#16A765] border border-[#15803D]/20 dark:border-[#16A765]/30",
    red: "bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#F04452]/15 dark:text-[#F04452] border border-[#DC2626]/20 dark:border-[#F04452]/30",
    orange: "bg-[#B45309]/10 text-[#B45309] dark:bg-[#F59E0B]/15 dark:text-[#F59E0B] border border-[#B45309]/20 dark:border-[#F59E0B]/30",
    blue: "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3478F6]/15 dark:text-[#3478F6] border border-[#2563EB]/20 dark:border-[#3478F6]/30"
  };

  return (
    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
});

export const Button = memo(({ children, variant = "primary", onClick, className = "", disabled = false, icon = null }) => {
  const variants = {
    primary: "bg-[#2563EB] hover:bg-blue-700 dark:bg-[#3478F6] dark:hover:bg-[#2563EB] text-white shadow-md shadow-blue-500/20 border border-transparent",
    secondary: "bg-[#0F172A] hover:bg-slate-800 text-white dark:bg-[#1B263B] dark:hover:bg-[#253149] dark:text-[#F1F5F9] border border-transparent dark:border-[#253149]",
    ghost: "bg-transparent hover:bg-[#EEF2F7] dark:hover:bg-[#1B263B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]",
    danger: "bg-[#DC2626] hover:bg-red-700 dark:bg-[#F04452] dark:hover:bg-red-600 text-white shadow-md shadow-red-500/20 border border-transparent"
  };

  return (
    <motion.button 
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : buttonInteractiveMotion.whileTap}
      transition={buttonInteractiveMotion.transition}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-colors duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl ${variants[variant]} ${className}`}
    >
      {icon && <i className={`${icon} transition-transform group-hover:scale-110`}></i>}
      {children}
    </motion.button>
  );
});
