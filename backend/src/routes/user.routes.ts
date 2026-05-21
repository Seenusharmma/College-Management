import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middlewares/index.js';
import { UserRole } from '../models/user.model.js';
import { validate } from '../middlewares/validator.js';
import { createUserSchema } from '../validators/content.validator.js';

const router = Router();

router.post('/', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(createUserSchema), (req, res, next) => {
  userController.createUser(req, res).catch(next);
});

router.get('/', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), (req, res, next) => {
  userController.getAllUsers(req, res).catch(next);
});

router.patch('/:id/role', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), (req, res, next) => {
  userController.updateUserRole(req, res).catch(next);
});

export const userRoutes = router;
