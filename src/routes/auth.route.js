import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { sendOtpSchema, verifyOtpSchema } from '../validators/auth.validator.js';

const router = Router();
router.post('/otp/send',   validate(sendOtpSchema),   authController.sendOtp);
router.post('/otp/verify', validate(verifyOtpSchema), authController.verifyOtp);
router.get('/me',          requireAuth,               authController.me);
export default router;