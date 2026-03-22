import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middlewares/index.js';
import { UserRole } from '../models/user.model.js';

const router = Router();

router.get('/', authenticate, requireRole(UserRole.SUPER_ADMIN), (req, res, next) => {
  userController.getAllUsers(req, res).catch(next);
});

router.patch('/:id/role', authenticate, requireRole(UserRole.SUPER_ADMIN), (req, res, next) => {
  userController.updateUserRole(req, res).catch(next);
});

export const userRoutes = router;
