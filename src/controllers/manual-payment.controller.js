import * as paymentService from '../services/payment.service.js';
import { created, ok } from '../utils/response.js';

export async function createOrder(req, res, next) {
  try {
    return created(res, await paymentService.createOrder(req.user.sub, req.body), 'Pesanan dibuat');
  } catch (error) {
    next(error);
  }
}

export async function getPaymentOptions(_req, res, next) {
  try {
    return ok(res, paymentService.getPaymentOptions());
  } catch (error) {
    next(error);
  }
}

export async function submitTransfer(req, res, next) {
  try {
    return ok(res, await paymentService.submitTransfer(req.user.sub, req.params.id, req.body), 'Laporan transfer dikirim');
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    return ok(res, await paymentService.getOrder(req.user.sub, req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function getAccess(req, res, next) {
  try {
    return ok(res, await paymentService.getAccess(req.user.sub));
  } catch (error) {
    next(error);
  }
}

export async function listAdminOrders(req, res, next) {
  try {
    const statuses = new Set([
      'all',
      'pending',
      'review',
      'underpaid',
      'overpaid',
      'paid',
      'refunded',
      'expired',
      'rejected',
    ]);
    const status = req.query.status || 'all';
    const page = Number(req.query.page || 1);
    const requestedPageSize = Number(req.query.pageSize || 20);
    if (typeof status !== 'string' || !statuses.has(status)) {
      throw Object.assign(new Error('Filter status tidak valid.'), { status: 400 });
    }
    if (!Number.isInteger(page) || page < 1) {
      throw Object.assign(new Error('Nomor halaman tidak valid.'), { status: 400 });
    }
    if (!Number.isInteger(requestedPageSize) || requestedPageSize < 1) {
      throw Object.assign(new Error('Ukuran halaman tidak valid.'), { status: 400 });
    }

    return ok(res, await paymentService.listAdminOrders({
      status,
      search: typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 120) : '',
      page,
      pageSize: Math.min(requestedPageSize, 50),
    }));
  } catch (error) {
    next(error);
  }
}

export async function getAdminSummary(_req, res, next) {
  try {
    return ok(res, await paymentService.getAdminSummary());
  } catch (error) {
    next(error);
  }
}

export async function approveOrder(req, res, next) {
  try {
    return ok(res, await paymentService.approveOrder(req.params.id, req.user.sub), 'Pembayaran disetujui; paket diaktifkan');
  } catch (error) {
    next(error);
  }
}

export async function refundOrder(req, res, next) {
  try {
    return ok(res, await paymentService.refundOrder(req.params.id, req.user.sub, req.body), 'Refund dicatat');
  } catch (error) {
    next(error);
  }
}

