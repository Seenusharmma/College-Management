import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { UserRole } from '../models/user.model.js';
import { User } from '../models/index.js';
import { clerkClient, verifyToken } from '@clerk/express';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const verification = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });
    
    if (!verification) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }

    req.user = {
      id: verification.sub,
      email: (verification as any).email || '',
      role: 'student'
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const user = await User.findOne({ clerkUserId: req.user.id });
      
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({ success: false, error: 'Insufficient permissions' });
        return;
      }

      req.userId = user._id.toString();
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const verification = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });
    
    if (verification) {
      req.user = {
        id: verification.sub,
        email: (verification as any).email || '',
        role: 'student'
      };
    }
    
    next();
  } catch {
    next();
  }
};
