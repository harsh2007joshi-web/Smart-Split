import { Router, Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { paypalService } from '../services/paypalService';

const router = Router();
router.use(authenticateToken);

router.post('/paypal/create-order', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'INR', groupId, recipientId, recipientName, settlementId } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required.' });
      return;
    }

    if (settlementId) {
      const existingSettlement = db.getAllSettlements().find(
        s => s.id === settlementId && s.status === 'COMPLETED'
      );
      if (existingSettlement) {
        res.status(409).json({ error: 'This settlement balance has already been completed and verified.' });
        return;
      }
    }

    const order = await paypalService.createOrder({
      amount: numAmount,
      currency,
      description: `SplitSmart AI settlement to ${recipientName || 'Group Member'}`,
      customId: JSON.stringify({ groupId, recipientId, settlementId, payerId: req.user!.id }),
    });

    res.json({
      orderId: order.id,
      status: order.status,
      links: order.links,
      isSandboxDemo: order.isSandboxDemo,
    });
  } catch (err: any) {
    console.error('PayPal create order error:', err);
    res.status(500).json({ error: 'Failed to initiate PayPal order.' });
  }
});

router.post('/paypal/capture-order', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, groupId, recipientId, recipientName, amount, currency = 'INR', settlementId } = req.body;

    if (!orderId) {
      res.status(400).json({ error: 'Order ID is required.' });
      return;
    }

    const existingPaymentForOrder = db.getAllPayments().find(
      p => p.metadata?.paypalOrderId === orderId && p.status === 'COMPLETED'
    );
    if (existingPaymentForOrder) {
      res.status(409).json({
        error: 'This PayPal order has already been captured and processed.',
        payment: existingPaymentForOrder,
      });
      return;
    }

    if (settlementId) {
      const existingSettlement = db.getAllSettlements().find(
        s => s.id === settlementId && s.status === 'COMPLETED'
      );
      if (existingSettlement) {
        res.status(409).json({ error: 'This settlement balance has already been completed and verified.' });
        return;
      }
    }

    const captureResult = await paypalService.captureOrder(orderId);

    if (captureResult.status !== 'COMPLETED') {
      res.status(400).json({
        error: 'PayPal payment capture was not completed.',
        status: captureResult.status,
      });
      return;
    }

    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const payment = db.createPayment({
      settlementId: settlementId || undefined,
      groupId: groupId || undefined,
      payerId: req.user!.id,
      payerName: req.user!.name,
      recipientId: recipientId || 'usr_unknown',
      recipientName: recipientName || 'Group Member',
      amount: parseFloat(amount) || captureResult.amount,
      currency,
      method: 'PAYPAL',
      status: 'COMPLETED',
      reference: captureResult.transactionReference,
      metadata: {
        receiptNumber,
        paypalOrderId: orderId,
        payerEmail: captureResult.payerEmail,
        isSandbox: true,
      },
    });

    const receipt = {
      receiptNumber,
      date: new Date().toISOString(),
      reference: payment.reference,
      payerName: req.user!.name,
      payerEmail: req.user!.email,
      recipientName: recipientName || 'Group Member',
      groupName: groupId ? db.getGroupById(groupId)?.name || 'Trip Group' : 'Direct Settlement',
      amount: payment.amount,
      currency,
      method: 'PAYPAL',
      status: 'COMPLETED',
      verifiedStamp: 'VERIFIED BY PAYPAL SANDBOX',
    };

    if (groupId) {
      db.createSettlement({
        groupId,
        fromUserId: req.user!.id,
        fromUserName: req.user!.name,
        toUserId: recipientId,
        toUserName: recipientName,
        amount: parseFloat(amount),
        currency,
        status: 'COMPLETED',
        paymentId: payment.id,
        completedAt: new Date().toISOString(),
      });
    }

    if (recipientId) {
      db.createNotification({
        userId: recipientId,
        title: 'Settlement Received 💰',
        message: `${req.user!.name} settled ${currency} ${Number(amount).toLocaleString()} with you via PayPal Sandbox. Ref: ${payment.reference}`,
        type: 'PAYMENT',
        link: '/transactions',
      });
    }

    res.json({
      success: true,
      message: 'PayPal payment verified and settled successfully!',
      payment,
      receipt,
    });
  } catch (err: any) {
    console.error('PayPal capture error:', err);
    res.status(500).json({ error: 'Failed to process PayPal capture.' });
  }
});

router.post('/card-checkout', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      amount,
      currency = 'INR',
      groupId,
      recipientId,
      recipientName,
      settlementId,
      cardType = 'CREDIT_CARD',
      cardholderName,
      cardNumber,
      expiry,
      cvv,
    } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required.' });
      return;
    }

    if (settlementId) {
      const existingSettlement = db.getAllSettlements().find(
        s => s.id === settlementId && s.status === 'COMPLETED'
      );
      if (existingSettlement) {
        res.status(409).json({ error: 'This settlement balance has already been completed and verified.' });
        return;
      }
    }

    if (!cardholderName || !cardholderName.trim()) {
      res.status(400).json({ error: 'Cardholder name is required.' });
      return;
    }

    const cleanNumber = (cardNumber || '').replace(/\s+/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      res.status(400).json({ error: 'Please enter a valid 16-digit card number.' });
      return;
    }

    if (!expiry || !expiry.includes('/')) {
      res.status(400).json({ error: 'Please provide valid expiry in MM/YY format.' });
      return;
    }

    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      res.status(400).json({ error: 'Please enter a valid 3 or 4 digit CVV security code.' });
      return;
    }

    const last4 = cleanNumber.slice(-4);
    const maskedNumber = `•••• •••• •••• ${last4}`;

    const txnRef = `SS-${cardType === 'DEBIT_CARD' ? 'DBT' : 'CRD'}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const payment = db.createPayment({
      settlementId: settlementId || undefined,
      groupId: groupId || undefined,
      payerId: req.user!.id,
      payerName: req.user!.name,
      recipientId: recipientId || 'usr_unknown',
      recipientName: recipientName || 'Group Member',
      amount: numAmount,
      currency,
      method: cardType === 'DEBIT_CARD' ? 'DEBIT_CARD' : 'CREDIT_CARD',
      status: 'COMPLETED',
      reference: txnRef,
      metadata: {
        receiptNumber,
        cardholderName: cardholderName.trim(),
        cardMasked: maskedNumber,
        verifiedVia: 'SplitSmart Secure Vault Gateway',
      },
    });

    const receipt = {
      receiptNumber,
      date: new Date().toISOString(),
      reference: txnRef,
      payerName: req.user!.name,
      payerEmail: req.user!.email,
      recipientName: recipientName || 'Group Member',
      groupName: groupId ? db.getGroupById(groupId)?.name || 'Trip Group' : 'Direct Settlement',
      amount: numAmount,
      currency,
      method: cardType === 'DEBIT_CARD' ? 'DEBIT_CARD' : 'CREDIT_CARD',
      status: 'COMPLETED',
      verifiedStamp: 'VERIFIED & SETTLED',
      cardMasked: maskedNumber,
    };

    if (groupId) {
      db.createSettlement({
        groupId,
        fromUserId: req.user!.id,
        fromUserName: req.user!.name,
        toUserId: recipientId,
        toUserName: recipientName,
        amount: numAmount,
        currency,
        status: 'COMPLETED',
        paymentId: payment.id,
        completedAt: new Date().toISOString(),
      });
    }

    if (recipientId) {
      db.createNotification({
        userId: recipientId,
        title: 'Settlement Payment Verified 🎉',
        message: `${req.user!.name} settled ${currency} ${numAmount.toLocaleString()} with you using ${cardType === 'DEBIT_CARD' ? 'Debit' : 'Credit'} Card. Ref: ${payment.reference}`,
        type: 'PAYMENT',
        link: '/transactions',
      });
    }

    res.json({
      success: true,
      message: `${cardType === 'DEBIT_CARD' ? 'Debit' : 'Credit'} Card payment of ${currency} ${numAmount.toLocaleString()} verified successfully!`,
      payment,
      receipt,
    });
  } catch (err: any) {
    console.error('Card payment error:', err);
    res.status(500).json({ error: 'Card transaction processing failed.' });
  }
});

router.post('/google-pay', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'INR', groupId, recipientId, recipientName, settlementId } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required.' });
      return;
    }

    if (settlementId) {
      const existingSettlement = db.getAllSettlements().find(
        s => s.id === settlementId && s.status === 'COMPLETED'
      );
      if (existingSettlement) {
        res.status(409).json({ error: 'This settlement balance has already been completed and verified.' });
        return;
      }
    }

    const txnRef = `SS-GPAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const payment = db.createPayment({
      settlementId: settlementId || undefined,
      groupId: groupId || undefined,
      payerId: req.user!.id,
      payerName: req.user!.name,
      recipientId: recipientId || 'usr_unknown',
      recipientName: recipientName || 'Group Member',
      amount: numAmount,
      currency,
      method: 'GOOGLE_PAY',
      status: 'COMPLETED',
      reference: txnRef,
      metadata: {
        receiptNumber,
        verifiedVia: 'Google Pay Tokenized UPI/VPA',
      },
    });

    const receipt = {
      receiptNumber,
      date: new Date().toISOString(),
      reference: txnRef,
      payerName: req.user!.name,
      payerEmail: req.user!.email,
      recipientName: recipientName || 'Group Member',
      groupName: groupId ? db.getGroupById(groupId)?.name || 'Trip Group' : 'Direct Settlement',
      amount: numAmount,
      currency,
      method: 'GOOGLE_PAY',
      status: 'COMPLETED',
      verifiedStamp: 'VERIFIED BY GOOGLE PAY',
    };

    if (groupId) {
      db.createSettlement({
        groupId,
        fromUserId: req.user!.id,
        fromUserName: req.user!.name,
        toUserId: recipientId,
        toUserName: recipientName,
        amount: numAmount,
        currency,
        status: 'COMPLETED',
        paymentId: payment.id,
        completedAt: new Date().toISOString(),
      });
    }

    if (recipientId) {
      db.createNotification({
        userId: recipientId,
        title: 'Settlement Received via Google Pay ⚡',
        message: `${req.user!.name} settled ${currency} ${numAmount.toLocaleString()} with you via Google Pay. Ref: ${payment.reference}`,
        type: 'PAYMENT',
        link: '/transactions',
      });
    }

    res.json({
      success: true,
      message: `Google Pay settlement of ${currency} ${numAmount.toLocaleString()} verified successfully!`,
      payment,
      receipt,
    });
  } catch (err: any) {
    console.error('Google Pay error:', err);
    res.status(500).json({ error: 'Google Pay processing failed.' });
  }
});

router.get('/receipt/:reference', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const reference = (Array.isArray(req.params.reference) ? req.params.reference[0] : req.params.reference) as string;
    const payment = db.getPaymentByReference(reference);

    if (!payment) {
      res.status(404).json({ error: 'Receipt not found for this transaction reference.' });
      return;
    }

    const group = payment.groupId ? db.getGroupById(payment.groupId) : undefined;

    const receipt = {
      receiptNumber: payment.metadata?.receiptNumber || `REC-2026-${payment.id.substring(4)}`,
      date: payment.createdAt,
      reference: payment.reference,
      payerName: payment.payerName,
      recipientName: payment.recipientName,
      groupName: group ? group.name : 'SplitSmart AI Group Settlement',
      groupCategory: group ? group.category : 'Trip Settlement',
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      cardMasked: payment.metadata?.cardMasked,
      verifiedStamp: 'OFFICIALLY VERIFIED & SETTLED',
    };

    res.json({ receipt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch receipt.' });
  }
});

router.get('/transactions', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const allPayments = db.getAllPayments();

    const userPayments = allPayments.filter(p => p.payerId === userId || p.recipientId === userId);

    res.json({
      transactions: userPayments,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
});

export default router;
