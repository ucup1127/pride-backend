import { Router } from 'express';
import * as controller from '../controllers/manual-payment.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createManualOrderSchema,
  refundSchema,
  submitTransferSchema,
} from '../validators/payment.validator.js';

const router = Router();

router.get('/options', controller.getPaymentOptions);
router.post('/orders', requireAuth, validate(createManualOrderSchema), controller.createOrder);
router.get('/orders/:id', requireAuth, controller.getOrder);
router.post('/orders/:id/transfer', requireAuth, validate(submitTransferSchema), controller.submitTransfer);
router.get('/access', requireAuth, controller.getAccess);

router.get('/admin/summary', requireAuth, requireRole('admin'), controller.getAdminSummary);
router.get('/admin/orders', requireAuth, requireRole('admin'), controller.listAdminOrders);
router.post('/admin/orders/:id/approve', requireAuth, requireRole('admin'), controller.approveOrder);
router.post('/admin/orders/:id/refund', requireAuth, requireRole('admin'), validate(refundSchema), controller.refundOrder);

export default router;
