import { Router } from 'express';
import * as templatesController from '../controllers/templates.controller.js';
const router = Router();
router.get('/',    templatesController.list);
router.get('/:id', templatesController.detail);
export default router;