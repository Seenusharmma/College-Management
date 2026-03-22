import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

const router = Router();

router.get('/session', (req, res, next) => {
  authController.getSession(req, res).catch(next);
});

router.post('/verify', (req, res, next) => {
  authController.verifyToken(req, res).catch(next);
});

export const authRoutes = router;
