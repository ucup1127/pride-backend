import { Router } from 'express';
import * as rsvpController from '../controllers/rsvp.controller.js';
import { validate } from '../middlewares/validate.js';
import { createRsvpSchema } from '../validators/rsvp.validator.js';

const router = Router();
router.get('/:undanganId', rsvpController.list);
router.post('/',           validate(createRsvpSchema), rsvpController.create);
export default router;