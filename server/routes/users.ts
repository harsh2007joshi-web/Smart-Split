import { Router, Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/search', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const q = req.query.q as string;
    const currentUserId = req.user!.id;

    if (!q || !q.trim()) {
      res.json({ users: [] });
      return;
    }

    const matches = db.searchUsers(q, currentUserId);
    const enriched = matches.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username || `@${u.name.toLowerCase().replace(/\s+/g, '')}`,
      email: u.email,
      avatarUrl: u.avatarUrl,
      isContact: db.areFriends(currentUserId, u.id),
    }));

    res.json({ users: enriched });
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ error: 'Failed to search users.' });
  }
});

router.get('/by-username/:username', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const username = req.params.username as string;
    const currentUserId = req.user!.id;

    const user = db.findUserByUsername(username);
    if (!user) {
      res.status(404).json({ error: `User with username "${username}" not found.` });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isContact: db.areFriends(currentUserId, user.id),
        isSelf: user.id === currentUserId,
      },
    });
  } catch (err) {
    console.error('User by username lookup error:', err);
    res.status(500).json({ error: 'Failed to fetch user by username.' });
  }
});

export default router;
