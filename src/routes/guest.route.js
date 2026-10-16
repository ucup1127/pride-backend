import { Router } from 'express';
import * as guestController from '../controllers/guest.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createGuestSchema, updateGuestSchema, bulkGuestSchema, rsvpBySlugSchema } from '../validators/guest.validator.js';

const router = Router();

// Publik — lihat tamu by slug
router.get('/by-slug/:slug', guestController.detail);

// Publik — RSVP by slug
router.post('/rsvp', validate(rsvpBySlugSchema), guestController.rsvp);

// Auth — CRUD tamu
router.get('/',      requireAuth, guestController.list);
router.get('/stats', requireAuth, guestController.stats);
router.post('/',     requireAuth, validate(createGuestSchema), guestController.create);
router.post('/bulk', requireAuth, validate(bulkGuestSchema),   guestController.bulkCreate);
router.put('/:id',   requireAuth, validate(updateGuestSchema), guestController.update);
router.delete('/:id', requireAuth, guestController.remove);

export default router;