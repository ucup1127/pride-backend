import { Router } from 'express';
import * as undanganController from '../controllers/undangan.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createUndanganSchema, updateUndanganSchema } from '../validators/undangan.validator.js';

const router = Router();
router.get('/',       requireAuth, undanganController.list);
router.get('/:id',    requireAuth, undanganController.detail);
router.post('/',      requireAuth, validate(createUndanganSchema), undanganController.create);
router.put('/:id',    requireAuth, validate(updateUndanganSchema), undanganController.update);
router.delete('/:id', requireAuth, undanganController.remove);
export default router;