import { Router } from 'express';
import { ok } from '../utils/response.js';
const router = Router();
router.get('/', (req, res) => ok(res, { uptime: process.uptime() }, 'Server sehat'));
export default router;