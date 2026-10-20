/**
 * WinUI 3 / Windows 11 Fluent Design Motion System
 * Optimizado para Framer Motion con aceleración por hardware (GPU Compositor Thread)
 */

// Curvas canónicas de Fluent Design System (WinUI 3)
export const FLUENT_DECELERATE_EASE = [0.1, 0.9, 0.2, 1];
export const FLUENT_ACCELERATE_EASE = [0.7, 0, 1, 0.5];

// Page / Tab Entrance (Entrada y salida de vistas)
export const pageEntranceVariants = {
  initial: {
    opacity: 0,
    y: 36,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease: FLUENT_DECELERATE_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.99,
    transition: {
      duration: 0.15,
      ease: FLUENT_ACCELERATE_EASE,
    },
  },
};

// Staggered Cascade (Cascada para grillas y listas de elementos)
export const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

export const staggerItemVariants = {
  initial: {
    opacity: 0,
    y: 28,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 22,
      mass: 0.9,
    },
  },
};

// Apertura de Modales / Tarjetas (Drill-In / Connected Layout)
export const modalDrillInVariants = {
  initial: {
    opacity: 0,
    scale: 0.88,
    y: 24,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 24,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 16,
    transition: {
      duration: 0.16,
      ease: FLUENT_ACCELERATE_EASE,
    },
  },
};

// Backdrop / Overlay Fade
export const backdropFadeVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.22,
      ease: FLUENT_DECELERATE_EASE,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.16,
      ease: FLUENT_ACCELERATE_EASE,
    },
  },
};

// Active Pill (Indicador de pestaña activa y barra de navegación)
export const fluentPillSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 24,
};

// Micro-interacciones de Hover y Tap (Mobile + PC)
export const cardInteractiveMotion = {
  whileHover: { y: -5, scale: 1.02 },
  whileTap: { scale: 0.93 },
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 18,
  },
};

export const buttonInteractiveMotion = {
  whileTap: { scale: 0.90 },
  transition: {
    type: 'spring',
    stiffness: 450,
    damping: 16,
  },
};

export const fabInteractiveMotion = {
  whileHover: { scale: 1.06, y: -2 },
  whileTap: { scale: 0.88 },
  transition: {
    type: 'spring',
    stiffness: 420,
    damping: 18,
  },
};
