import { Router, Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.post('/request', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const { username } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      res.status(400).json({ error: 'Please enter a valid username (e.g. @rahulpatel_192).' });
      return;
    }

    const cleanUsername = username.trim();
    const result = db.createFriendRequest(currentUserId, cleanUsername);

    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.status(201).json({
      success: true,
      message: result.message,
      request: result.request,
    });
  } catch (err: any) {
    console.error('Send friend request error:', err);
    res.status(500).json({ error: 'Failed to send friend request.' });
  }
});

router.get('/requests', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const incoming = db.getPendingIncomingRequests(currentUserId);
    const outgoing = db.getSentRequests(currentUserId);

    res.json({
      incoming,
      outgoing,
    });
  } catch (err) {
    console.error('Get friend requests error:', err);
    res.status(500).json({ error: 'Failed to retrieve friend requests.' });
  }
});

router.post('/requests/:id/accept', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const requestId = req.params.id as string;

    const result = db.acceptFriendRequest(requestId, currentUserId);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json({
      success: true,
      message: result.message,
      friendRequest: result.friendRequest,
    });
  } catch (err) {
    console.error('Accept friend request error:', err);
    res.status(500).json({ error: 'Failed to accept friend request.' });
  }
});

router.post('/requests/:id/decline', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const requestId = req.params.id as string;

    const result = db.declineFriendRequest(requestId, currentUserId);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error('Decline friend request error:', err);
    res.status(500).json({ error: 'Failed to decline friend request.' });
  }
});

router.get('/contacts', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const search = req.query.search as string;

    let contacts = db.getContactsForUser(currentUserId);

    if (search && search.trim()) {
      const term = search.trim().toLowerCase().replace(/^@/, '');
      contacts = contacts.filter(c =>
        c.user.name.toLowerCase().includes(term) ||
        c.user.username.toLowerCase().replace(/^@/, '').includes(term) ||
        c.user.email.toLowerCase().includes(term) ||
        (c.nickname && c.nickname.toLowerCase().includes(term))
      );
    }

    res.json({ contacts });
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ error: 'Failed to retrieve contacts.' });
  }
});

router.delete('/contacts/:contactUserId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const contactUserId = req.params.contactUserId as string;

    const success = db.removeContact(currentUserId, contactUserId);
    if (!success) {
      res.status(404).json({ error: 'Contact not found or already removed.' });
      return;
    }

    res.json({
      success: true,
      message: 'Contact removed successfully.',
    });
  } catch (err) {
    console.error('Remove contact error:', err);
    res.status(500).json({ error: 'Failed to remove contact.' });
  }
});

export default router;
