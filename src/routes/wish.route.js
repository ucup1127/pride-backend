import { Router } from 'express';
import * as wishController from '../controllers/wish.controller.js';

const router = Router();
router.get('/:undanganId', wishController.list);
router.post('/', wishController.create);

export default router;