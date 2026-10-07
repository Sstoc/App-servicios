import * as Sentry from '@sentry/react';

/**
 * Inicializa Sentry para monitoreo de errores en producción.
 * Solo se activa si VITE_SENTRY_DSN está configurado.
 * En desarrollo, los errores se muestran normalmente en consola.
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // No inicializar en dev ni si no hay DSN configurado
  if (!dsn || import.meta.env.DEV) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // 'production' | 'preview'

    // Capturar el 10% de las sesiones para Session Replay (no datos sensibles)
    replaysSessionSampleRate: 0.1,
    // Capturar el 100% de las sesiones con error
    replaysOnErrorSampleRate: 1.0,

    // Tracing: medir performance de transacciones
    tracesSampleRate: 0.2,

    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
    ],

    // Filtrar errores de red/extensiones de browser (ruido)
    beforeSend(event) {
      // Ignorar errores de extensiones del browser
      if (event.exception?.values?.some(v =>
        v.stacktrace?.frames?.some(f =>
          f.filename?.includes('chrome-extension://') ||
          f.filename?.includes('moz-extension://')
        )
      )) {
        return null;
      }
      return event;
    },
  });
};

/**
 * Asociar el usuario actual a los eventos de Sentry.
 * Llamar después de la autenticación exitosa.
 * IMPORTANTE: solo se envía el ID — nunca email ni datos PII.
 */
export const setSentryUser = (userId) => {
  if (!import.meta.env.VITE_SENTRY_DSN || import.meta.env.DEV) return;
  // Solo el ID anónimo — sin email, nombre ni datos personales
  Sentry.setUser(userId ? { id: userId } : null);
};

/**
 * Capturar un error manualmente con contexto adicional.
 * Útil para errores recuperados (try/catch) que igual queremos monitorear.
 */
export const captureError = (error, context = {}) => {
  if (import.meta.env.DEV) {
    console.error('[Sentry]', error, context);
    return;
  }
  Sentry.withScope(scope => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(error);
  });
};
