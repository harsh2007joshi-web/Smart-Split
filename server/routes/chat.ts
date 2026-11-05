import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db, StoredChatAttachment, StoredChatReceipt } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

const isVercel = !!process.env.VERCEL;
const UPLOAD_DIR = isVercel
  ? path.join('/tmp', 'splitsmart_uploads', 'chat')
  : path.resolve(process.cwd(), 'server/uploads/chat');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'php', 'js', 'py', 'ps1', 'msi', 'vbs', 'com', 'scr', 'jar', 'apk', 'vbe', 'wsf'
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

router.get('/messages/:contactUserId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const contactUserId = req.params.contactUserId as string;

    if (!db.areFriends(currentUserId, contactUserId)) {
      res.status(403).json({ error: 'You can only view conversations with accepted contacts.' });
      return;
    }

    const messages = db.getChatMessages(currentUserId, contactUserId);
    res.json({ messages });
  } catch (err) {
    console.error('Get chat messages error:', err);
    res.status(500).json({ error: 'Failed to retrieve chat messages.' });
  }
});

router.post('/messages/:contactUserId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const contactUserId = req.params.contactUserId as string;
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Message text cannot be empty.' });
      return;
    }

    if (!db.areFriends(currentUserId, contactUserId)) {
      res.status(403).json({ error: 'You can only message accepted contacts.' });
      return;
    }

    const msg = db.sendTextMessage(currentUserId, contactUserId, text.trim());
    res.status(201).json({ message: msg });
  } catch (err: any) {
    console.error('Send text message error:', err);
    res.status(400).json({ error: err.message || 'Failed to send message.' });
  }
});

router.post('/upload/:contactUserId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const contactUserId = req.params.contactUserId as string;
    const { fileBase64, filename, mimeType, size } = req.body;

    if (!fileBase64 || !filename) {
      res.status(400).json({ error: 'File data and original filename are required.' });
      return;
    }

    if (!db.areFriends(currentUserId, contactUserId)) {
      res.status(403).json({ error: 'You can only share files with accepted contacts.' });
      return;
    }

    const cleanMime = (mimeType || 'application/octet-stream').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
      res.status(400).json({
        error: `Unsupported file format (${cleanMime}). Supported formats: JPG, PNG, WEBP, GIF, PDF, DOC, TXT, XLS.`,
      });
      return;
    }

    const ext = path.extname(filename).replace(/^\./, '').toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      res.status(400).json({ error: 'Executable and script uploads are strictly prohibited for security reasons.' });
      return;
    }

    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_FILE_SIZE) {
      res.status(400).json({ error: 'File size exceeds maximum allowed limit of 10MB.' });
      return;
    }

    const safeExt = ext || (cleanMime.startsWith('image/') ? cleanMime.split('/')[1] : 'bin');
    const storedFilename = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${safeExt}`;
    const filePath = path.join(UPLOAD_DIR, storedFilename);

    fs.writeFileSync(filePath, buffer);

    const attachmentId = 'att_' + Math.random().toString(36).substring(2, 9);
    const attachment: StoredChatAttachment = {
      id: attachmentId,
      filename: storedFilename,
      originalName: path.basename(filename).substring(0, 100),
      mimeType: cleanMime,
      size: buffer.length,
      uploadedAt: new Date().toISOString(),
    };

    const isImage = cleanMime.startsWith('image/');
    const msg = db.sendFileMessage(currentUserId, contactUserId, attachment, isImage);

    res.status(201).json({
      message: msg,
      attachment,
    });
  } catch (err: any) {
    console.error('Upload chat file error:', err);
    res.status(500).json({ error: 'Failed to upload and send file.' });
  }
});

router.get('/attachments/:attachmentId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const attachmentId = req.params.attachmentId as string;

    const message = db.getAttachmentMessage(attachmentId);
    if (!message || !message.attachment) {
      res.status(404).json({ error: 'Attachment not found.' });
      return;
    }

    if (message.senderId !== currentUserId && message.receiverId !== currentUserId) {
      res.status(403).json({ error: 'Access denied: You are not authorized to view this private attachment.' });
      return;
    }

    const filePath = path.join(UPLOAD_DIR, message.attachment.filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File no longer exists on server.' });
      return;
    }

    res.setHeader('Content-Type', message.attachment.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(message.attachment.originalName)}"`
    );
    res.setHeader('Cache-Control', 'private, max-age=86400');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error('Download attachment error:', err);
    res.status(500).json({ error: 'Failed to retrieve attachment.' });
  }
});

router.get('/user-receipts', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const allPayments = db.getAllPayments();

    const userPayments = allPayments
      .filter(p => p.payerId === currentUserId || p.recipientId === currentUserId)
      .map(p => {
        const group = p.groupId ? db.getGroupById(p.groupId) : undefined;
        return {
          id: p.id,
          reference: p.reference,
          receiptNumber: p.metadata?.receiptNumber || `REC-2026-${p.id.substring(4)}`,
          amount: p.amount,
          currency: p.currency,
          groupName: group ? group.name : 'Direct Settlement',
          date: p.createdAt,
          status: p.status,
          payerName: p.payerName,
          recipientName: p.recipientName,
          method: p.method,
        };
      });

    res.json({ receipts: userPayments });
  } catch (err) {
    console.error('Get user receipts for chat error:', err);
    res.status(500).json({ error: 'Failed to retrieve user payment receipts.' });
  }
});

router.post('/share-receipt/:contactUserId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user!.id;
    const contactUserId = req.params.contactUserId as string;
    const { reference, paymentId } = req.body;

    if (!reference && !paymentId) {
      res.status(400).json({ error: 'Transaction reference or payment ID is required.' });
      return;
    }

    if (!db.areFriends(currentUserId, contactUserId)) {
      res.status(403).json({ error: 'You can only share receipts with accepted contacts.' });
      return;
    }

    let payment = reference ? db.getPaymentByReference(reference) : undefined;
    if (!payment && paymentId) {
      payment = db.getPaymentById(paymentId);
    }

    if (!payment) {
      res.status(404).json({ error: 'No matching verified payment record found.' });
      return;
    }

    if (payment.payerId !== currentUserId && payment.recipientId !== currentUserId) {
      res.status(403).json({ error: 'You can only share receipts from your own transactions.' });
      return;
    }

    const group = payment.groupId ? db.getGroupById(payment.groupId) : undefined;

    const receiptData: StoredChatReceipt = {
      paymentId: payment.id,
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      groupName: group ? group.name : 'Direct Settlement',
      date: payment.createdAt,
      status: payment.status,
      payerName: payment.payerName,
      recipientName: payment.recipientName,
      receiptNumber: payment.metadata?.receiptNumber || `REC-2026-${payment.id.substring(4)}`,
    };

    const msg = db.sendReceiptMessage(currentUserId, contactUserId, receiptData);

    res.status(201).json({
      message: msg,
      receipt: receiptData,
    });
  } catch (err: any) {
    console.error('Share receipt error:', err);
    res.status(500).json({ error: err.message || 'Failed to share payment receipt.' });
  }
});

export default router;
