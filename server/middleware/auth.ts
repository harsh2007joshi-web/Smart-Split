import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, StoredUser } from '../db/database';

export const JWT_SECRET = process.env.JWT_SECRET || 'splitsmart_secret_hackathon_key_2026_xyz';

export interface AuthenticatedRequest extends Request {
  user?: StoredUser;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.findUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'User session not found or expired.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}
