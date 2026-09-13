import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (body: unknown, status = 200) => Response.json(body, { status });

const argentinaDate = (offsetDays: number) => {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return parts; // Formato YYYY-MM-DD garantizado
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const cronSecret = Deno.env.get('PUSH_CRON_SECRET');
  if (!cronSecret || request.headers.get('x-cron-secret') !== cronSecret) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  let secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!secretKey) {
    try {
      const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
      secretKey = secretKeys.default;
    } catch {
      // Ignorar error al parsear secret keys
    }
  }

  const vapidSubject = Deno.env.get('VAPID_SUBJECT');
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

  if (!supabaseUrl || !secretKey || !vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
    return json({ error: 'Missing push notification secrets' }, 500);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const supabase = createClient(supabaseUrl, secretKey);

  // Únicamente hoy (offset 0) y 2 días antes de vencer (offset 2)
  const today = argentinaDate(0);
  const inTwoDays = argentinaDate(2);
  const targetDueDates = [today, inTwoDays];

  const { data: bills, error: billsError } = await supabase
    .from('bills')
    .select('owner_id, name, amount, due_date')
    .eq('paid', false)
    .is('deleted_at', null)
    .in('due_date', targetDueDates);

  if (billsError) return json({ error: billsError.message }, 500);
  if (!bills?.length) return json({ sent: 0, reason: 'No due bills' });

  const ownerIds = [...new Set(bills.map(bill => bill.owner_id))];
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('push_subscriptions')
    .select('endpoint, user_id, p256dh, auth_key')
    .in('user_id', ownerIds);

  if (subscriptionsError) return json({ error: subscriptionsError.message }, 500);

  const billsByOwner = new Map<string, typeof bills>();
  for (const bill of bills) {
    billsByOwner.set(bill.owner_id, [...(billsByOwner.get(bill.owner_id) || []), bill]);
  }

  let sent = 0;
  let removed = 0;
  for (const subscription of subscriptions || []) {
    const ownerBills = billsByOwner.get(subscription.user_id) || [];
    if (!ownerBills.length) continue;

    const details = ownerBills.slice(0, 3).map(bill => {
      const isToday = bill.due_date === today;
      const when = isToday ? 'vence hoy' : 'vence en 2 días';
      return `${bill.name} (${when})`;
    });

    const hasDueToday = ownerBills.some(bill => bill.due_date === today);
    const title = hasDueToday
      ? '¡Tenés servicios que vencen hoy!'
      : 'Tenés servicios que vencen en 2 días';

    const payload = JSON.stringify({
      title,
      body: details.join(' · '),
      tag: `due-${today}`,
      url: '/',
    });

    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth_key },
      }, payload, { TTL: 60 * 60 * 12, urgency: 'high' });
      sent += 1;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
        removed += 1;
      } else {
        console.error('Push delivery failed:', error);
      }
    }
  }

  return json({ sent, removed });
});
