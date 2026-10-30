import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db/database';
import { emailService } from '../services/email';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// GET USER NOTIFICATIONS
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const notifications = db.getNotificationsForUser(userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// CHECK EMAIL API CONNECTION STATUS
router.get('/email-status', (req: AuthenticatedRequest, res: Response): void => {
  const status = emailService.getProviderStatus();
  res.json({
    configured: status.ready,
    provider: status.provider,
    appUrl: process.env.APP_URL || null,
  });
});

// UPDATE / CONFIGURE PUBLIC APP_URL AT RUNTIME & IN .ENV
router.post('/set-public-url', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { appUrl } = req.body;
    if (!appUrl || typeof appUrl !== 'string') {
      res.status(400).json({ error: 'Valid URL is required.' });
      return;
    }
    const cleanUrl = appUrl.trim().replace(/\/$/, '');
    process.env.APP_URL = cleanUrl;

    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');
        if (/^APP_URL=/m.test(content)) {
          content = content.replace(/^APP_URL=.*$/m, `APP_URL=${cleanUrl}`);
        } else {
          content += `\nAPP_URL=${cleanUrl}\n`;
        }
        fs.writeFileSync(envPath, content, 'utf8');
      }
    } catch (e) {
      console.warn('Could not persist APP_URL to .env:', e);
    }

    res.json({ success: true, appUrl: cleanUrl, message: `Public URL updated to ${cleanUrl}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update public URL.' });
  }
});

// SEND DIRECT LINK TO FRIEND'S EMAIL ADDRESS
router.post('/share-link', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, friendName, targetUrl, note } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Friend email address is required.' });
      return;
    }

    const clientOrigin = (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer).origin : '');
    const defaultUrl = (process.env.APP_URL && process.env.APP_URL.trim() !== '')
      ? process.env.APP_URL.trim()
      : (clientOrigin || 'http://localhost:5173');

    const finalLink = targetUrl || defaultUrl;

    const emailResult = await emailService.sendShareLink({
      to: email.trim(),
      friendName: friendName?.trim() || 'Friend',
      senderName: req.user!.name,
      linkUrl: finalLink,
      customMessage: note,
    });

    res.json({
      success: emailResult.delivered,
      message: emailResult.delivered
        ? `Link successfully dispatched to ${email}!`
        : (emailResult.message || `Note: Could not deliver email to ${email}. Please share link directly via WhatsApp or copy below!`),
      linkUrl: finalLink,
      emailDispatch: emailResult,
    });
  } catch (err: any) {
    console.error('Failed to share link via email:', err);
    res.status(500).json({ error: 'Failed to dispatch email.' });
  }
});

// MARK SINGLE NOTIFICATION READ
router.put('/:id/read', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const notifId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    db.markNotificationRead(notifId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

// MARK ALL READ
router.post('/read-all', (req: AuthenticatedRequest, res: Response): void => {
  try {
    db.markAllNotificationsRead(req.user!.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read.' });
  }
});

export default router;
