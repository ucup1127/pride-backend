import { Xendit } from 'xendit-node';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';

export async function createInvoice(req, res, next) {
  try {
    if (!env.XENDIT_SECRET_KEY) {
      return res.status(503).json({ success: false, message: 'Pembayaran belum dikonfigurasi' });
    }

    const { undanganId } = req.body;
    if (!undanganId) {
      return res.status(400).json({ success: false, message: 'ID undangan wajib diisi' });
    }

    const undangan = await prisma.undangan.findUnique({ where: { id: undanganId } });
    if (!undangan) return res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
    if (undangan.userId !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const frontendUrl = env.CORS_ORIGIN.replace(/\/+$/, '');
    const xendit = new Xendit({ secretKey: env.XENDIT_SECRET_KEY });
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId: `PRIDE-${undangan.id}-${Date.now()}`,
        amount: 99000, // Harga paket Standard
        description: `Pembayaran Paket Standard - Undangan ${undangan.judul}`,
        invoiceDuration: 86400, // 24 jam
        successRedirectUrl: `${frontendUrl}/dashboard`,
        failureRedirectUrl: `${frontendUrl}/checkout`,
      },
    });

    return res.status(200).json({
      success: true,
      invoiceUrl: invoice.invoiceUrl, // Ini link buat buka halaman bayar Xendit
    });

  } catch (e) {
    console.error(e);
    next(e);
  }
}

// Webhook (Dipanggil Xendit kalau pembayaran lunas)
export async function handleWebhook(req, res, next) {
  if (!env.XENDIT_WEBHOOK_TOKEN) {
    return res.status(503).json({ success: false, message: 'Webhook pembayaran belum dikonfigurasi' });
  }
  if (req.get('x-callback-token') !== env.XENDIT_WEBHOOK_TOKEN) {
    return res.status(401).json({ success: false, message: 'Token webhook tidak valid' });
  }

  try {
    const { external_id, status } = req.body;
    const match = typeof external_id === 'string'
      ? /^PRIDE-(.+)-\d+$/.exec(external_id)
      : null;
    if (!match) {
      return res.status(400).json({ success: false, message: 'ID pembayaran tidak valid' });
    }

    if (status === 'PAID' || status === 'SETTLED') {
      await prisma.undangan.update({
        where: { id: match[1] },
        data: { status: 'published', isPublic: true },
      });
    }

    return res.status(200).json({ status: 'OK' });
  } catch (e) {
    next(e);
  }
}