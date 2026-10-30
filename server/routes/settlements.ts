import { Router, Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { SettlementEngine } from '../services/settlementEngine';

const router = Router();
router.use(authenticateToken);

// GET ALL SETTLEMENTS (SUGGESTED AND COMPLETED)
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const userGroups = db.getGroupsForUser(userId);

    const suggestedSettlements: any[] = [];
    const completedSettlements: any[] = [];

    for (const group of userGroups) {
      const expenses = db.getExpensesForGroup(group.id);
      const settlements = db.getSettlementsForGroup(group.id);
      const balances = SettlementEngine.calculateBalances(group, expenses, settlements);
      const transfers = SettlementEngine.optimizeTransfers(balances, group.currency);

      for (let i = 0; i < transfers.length; i++) {
        const t = transfers[i];
        suggestedSettlements.push({
          id: `sug_${group.id}_${i}`,
          groupId: group.id,
          groupName: group.name,
          fromUserId: t.fromUserId,
          fromUserName: t.fromUserName,
          toUserId: t.toUserId,
          toUserName: t.toUserName,
          amount: t.amount,
          currency: t.currency,
          status: 'PENDING',
          isPayerCurrentUser: t.fromUserId === userId,
          isRecipientCurrentUser: t.toUserId === userId,
        });
      }

      for (const s of settlements) {
        if (s.status === 'COMPLETED') {
          completedSettlements.push({
            ...s,
            groupName: group.name,
          });
        }
      }
    }

    res.json({
      suggestedSettlements,
      completedSettlements,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve settlements.' });
  }
});

// REMIND A MEMBER TO SETTLE
router.post('/remind', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { toUserId, amount, currency = 'INR', groupName } = req.body;

    if (!toUserId) {
      res.status(400).json({ error: 'Recipient user ID is required.' });
      return;
    }

    db.createNotification({
      userId: toUserId,
      title: 'Settlement Reminder 🔔',
      message: `${req.user!.name} reminded you to settle your pending balance of ${currency} ${Number(amount).toLocaleString()} in ${groupName}.`,
      type: 'SETTLEMENT',
      link: '/settlements',
    });

    res.json({ message: 'Settlement reminder sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reminder.' });
  }
});

export default router;
