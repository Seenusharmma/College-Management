import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/index.js';

const router = Router();

router.post('/sync', authenticate, (req, res, next) => {
  userController.syncUser(req, res).catch(next);
});

router.get('/profile', authenticate, (req, res, next) => {
  userController.getProfile(req, res).catch(next);
});

router.patch('/profile', authenticate, (req, res, next) => {
  userController.updateProfile(req, res).catch(next);
});

router.post('/bookmarks/:contentId', authenticate, (req, res, next) => {
  userController.addBookmark(req, res).catch(next);
});

router.delete('/bookmarks/:contentId', authenticate, (req, res, next) => {
  userController.removeBookmark(req, res).catch(next);
});

router.get('/bookmarks', authenticate, (req, res, next) => {
  userController.getBookmarks(req, res).catch(next);
});

export const userApiRoutes = router;
