import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema, googleLoginSchema } from '../validators/auth.validator.js';

const router = Router();
router.post('/register', validate(registerSchema), authController.register);
router.post('/login',    validate(loginSchema),    authController.login);
router.post('/google',   validate(googleLoginSchema), authController.googleLogin);
router.get('/me',        requireAuth,              authController.me);
export default router;