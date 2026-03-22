import { Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';
import { clerkClient, verifyToken } from '@clerk/express';

export class AuthController {
  async getSession(req: Request, res: Response<ApiResponse>) {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID required'
        });
        return;
      }

      const session = await clerkClient.sessions.getSession(sessionId);
      
      res.json({
        success: true,
        data: {
          id: session.id,
          userId: session.userId,
          status: session.status
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }
  }

  async verifyToken(req: Request, res: Response<ApiResponse>) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(400).json({
          success: false,
          error: 'No token provided'
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      const verification = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY
      });

      if (!verification) {
        res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          userId: verification.sub,
          email: (verification as any).email
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Token verification failed'
      });
    }
  }
}

export const authController = new AuthController();
