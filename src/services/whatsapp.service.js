import { env } from '../config/env.js';
import { info, warn } from '../utils/logger.js';

export async function sendWhatsappMessage(phone, message) {
  if (env.WHATSAPP_PROVIDER === 'console' || !env.WHATSAPP_API_URL) {
    info('[WA -> +62' + phone + '] ' + message);
    return { delivered: true, provider: 'console' };
  }
  try {
    const res = await fetch(env.WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.WHATSAPP_API_KEY ? { Authorization: env.WHATSAPP_API_KEY } : {}),
      },
      body: JSON.stringify({ target: '62' + phone, sender: env.WHATSAPP_SENDER, message }),
    });
    if (!res.ok) throw new Error('WA provider error ' + res.status);
    return { delivered: true, provider: 'custom' };
  } catch (e) {
    warn('Gagal kirim WA:', e.message);
    return { delivered: false, provider: 'custom' };
  }
}