import { Router } from 'express';
import healthRoute from './health.route.js';
import authRoute from './auth.route.js';
import templatesRoute from './templates.route.js';
import undanganRoute from './undangan.route.js';
import rsvpRoute from './rsvp.route.js';

const router = Router();
router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/templates', templatesRoute);
router.use('/undangan', undanganRoute);
router.use('/rsvp', rsvpRoute);
export default router;