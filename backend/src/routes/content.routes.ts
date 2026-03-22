import { Router } from 'express';
import { contentController } from '../controllers/content.controller.js';
import { authenticate, requireRole, upload } from '../middlewares/index.js';
import { UserRole } from '../models/user.model.js';

const router = Router();

router.get('/', authenticate, (req, res, next) => {
  contentController.findAll(req, res).catch(next);
});

router.get('/stats', authenticate, requireRole(UserRole.TEACHER, UserRole.SUPER_ADMIN), (req, res, next) => {
  contentController.getStats(req, res).catch(next);
});

router.get('/:id', authenticate, (req, res, next) => {
  contentController.findById(req, res).catch(next);
});

router.post(
  '/',
  authenticate,
  requireRole(UserRole.TEACHER, UserRole.SUPER_ADMIN),
  upload.single('file'),
  (req, res, next) => {
    contentController.create(req, res).catch(next);
  }
);

router.patch('/:id', authenticate, requireRole(UserRole.TEACHER, UserRole.SUPER_ADMIN), (req, res, next) => {
  contentController.update(req, res).catch(next);
});

router.delete('/:id', authenticate, requireRole(UserRole.TEACHER, UserRole.SUPER_ADMIN), (req, res, next) => {
  contentController.delete(req, res).catch(next);
});

router.post('/:id/download', authenticate, (req, res, next) => {
  contentController.incrementDownloads(req, res).catch(next);
});

export const contentRoutes = router;
