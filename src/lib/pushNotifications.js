import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const base64UrlToUint8Array = (value) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, character => character.charCodeAt(0));
};

const ensurePushIsSupported = () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Este navegador no admite notificaciones push.');
  }

  if (!window.isSecureContext) {
    throw new Error('Las notificaciones push requieren una conexión segura (HTTPS o localhost).');
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error('Falta configurar VITE_VAPID_PUBLIC_KEY para activar las notificaciones.');
  }
};

export const enablePushNotifications = async () => {
  ensurePushIsSupported();

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('No autorizaste las notificaciones en este dispositivo.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;

  const expectedKeyBytes = base64UrlToUint8Array(VAPID_PUBLIC_KEY);
  let subscription = await registration.pushManager.getSubscription();

  // Si ya existía suscripción con otra clave o antigua, la desuscribimos para renovarla
  if (subscription) {
    try {
      const currentKey = subscription.options?.applicationServerKey;
      if (currentKey) {
        const currentBytes = new Uint8Array(currentKey);
        const isMatch = currentBytes.length === expectedKeyBytes.length &&
          currentBytes.every((b, i) => b === expectedKeyBytes[i]);
        if (!isMatch) {
          await subscription.unsubscribe();
          subscription = null;
        }
      }
    } catch {
      // Ignorar error al verificar opciones
    }
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: expectedKeyBytes,
    });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Iniciá sesión para activar las notificaciones.');

  const serialized = subscription.toJSON();
  const { error: saveError } = await supabase.from('push_subscriptions').upsert({
    endpoint: serialized.endpoint,
    user_id: user.id,
    p256dh: serialized.keys?.p256dh,
    auth_key: serialized.keys?.auth,
    expiration_time: serialized.expirationTime
      ? new Date(serialized.expirationTime).toISOString()
      : null,
    user_agent: navigator.userAgent,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'endpoint' });

  if (saveError) throw saveError;
  return 'Notificaciones activadas. Te avisaremos 2 días antes de vencer y el mismo día.';
};

export const disablePushNotifications = async () => {
  const registration = await navigator.serviceWorker.getRegistration('/');

  if (!registration) {
    // No hay SW registrado; no hay nada que desactivar
    return 'Notificaciones desactivadas en este dispositivo.';
  }

  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    // Eliminar del servidor y cancelar la suscripción del browser
    await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
    await subscription.unsubscribe();
  }

  return 'Notificaciones desactivadas en este dispositivo.';
};

