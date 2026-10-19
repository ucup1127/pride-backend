import { env } from '../config/env.js';
import { info, warn } from '../utils/logger.js';

export async function sendWhatsappMessage(phone, message) {
  // Kalau lagi mode console (development), munculin di terminal aja
  if (env.WHATSAPP_PROVIDER === 'console' || !env.WHATSAPP_API_URL) {
    info(`[SIMULASI WA -> +62${phone}] ${message}`);
    return { delivered: true, provider: 'console' };
  }

  // Kalau mode custom (Fonnte), nembak API beneran
  try {
    const res = await fetch(env.WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.WHATSAPP_API_KEY ? { Authorization: env.WHATSAPP_API_KEY } : {}),
      },
      body: JSON.stringify({
        target: `62${phone}`, // Fonnte minta format 62xxxx
        message: message,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.status === false) {
      throw new Error(data.reason || 'Gagal kirim WA');
    }
    
    info(`[WA SUKSES -> +62${phone}]`);
    return { delivered: true, provider: 'fonnte' };
  } catch (e) {
    warn('Gagal kirim WA via Fonnte:', e.message);
    // Kalau gagal, kita tetep kasih tau lewat console biar bisa dites manual
    info(`[FALLBACK WA -> +62${phone}] ${message}`);
    return { delivered: false, provider: 'fonnte', error: e.message };
  }
}