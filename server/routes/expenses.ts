import { Router, Response } from 'express';
import { db, StoredExpenseSplit } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// 0. CHECK FOR POTENTIAL DUPLICATE EXPENSE
router.post('/check-duplicate', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { groupId, title, amount, payerId, date } = req.body;
    if (!groupId || !title || !amount) {
      res.json({ isDuplicate: false });
      return;
    }
    const match = db.findPotentialDuplicateExpense(groupId, {
      title,
      amount: parseFloat(amount),
      payerId,
      date,
    });
    if (match) {
      res.json({
        isDuplicate: true,
        duplicateExpense: match,
        message: `A similar expense "${match.title}" for ${match.currency} ${match.amount.toLocaleString()} on ${match.date} was paid by ${match.payerName}.`,
      });
    } else {
      res.json({ isDuplicate: false });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to check duplicates.' });
  }
});

// 1. ADD EXPENSE TO GROUP
router.post('/group/:groupId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const groupId = (Array.isArray(req.params.groupId) ? req.params.groupId[0] : req.params.groupId) as string;
    const {
      title,
      amount,
      currency = 'INR',
      payerId,
      payerName,
      category = 'Others',
      date = new Date().toISOString().split('T')[0],
      splitType = 'EQUAL',
      participants, // array of { userId, userName, shareAmount?, percentage? }
      notes,
      taxAmount,
      receiptUrl,
      allowDuplicate = false,
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Expense title is required.' });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Please enter a valid expense amount greater than 0.' });
      return;
    }

    const group = db.getGroupById(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found.' });
      return;
    }

    const userEmail = req.user!.email.toLowerCase().trim();
    const isMember = group.members.some(m => m.userId === req.user!.id || (m.email && m.email.toLowerCase().trim() === userEmail));
    if (!isMember) {
      res.status(403).json({ error: 'You must be a member of this trip group to add expenses.' });
      return;
    }
    db.syncUserWithGroups(req.user!);

    // Duplicate expense guard
    if (!allowDuplicate) {
      const existingMatch = db.findPotentialDuplicateExpense(groupId, {
        title: title.trim(),
        amount: numAmount,
        payerId: payerId || req.user!.id,
        date,
      });

      if (existingMatch) {
        res.status(200).json({
          warning: 'POTENTIAL_DUPLICATE',
          message: `A similar expense "${existingMatch.title}" (${existingMatch.currency} ${existingMatch.amount.toLocaleString()}) was already recorded on ${existingMatch.date} by ${existingMatch.payerName}.`,
          duplicateExpense: existingMatch,
        });
        return;
      }
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      res.status(400).json({ error: 'Please select at least one participant.' });
      return;
    }

    let calculatedSplits: StoredExpenseSplit[] = [];

    if (splitType === 'EQUAL') {
      const count = participants.length;
      const baseShare = Math.round((numAmount / count) * 100) / 100;
      calculatedSplits = participants.map((p, idx) => {
        // Adjust last participant for penny rounding
        const share = idx === count - 1
          ? Math.round((numAmount - baseShare * (count - 1)) * 100) / 100
          : baseShare;
        return {
          id: 'sp_' + Math.random().toString(36).substring(2, 9),
          expenseId: '',
          userId: p.userId,
          userName: p.userName,
          shareAmount: share,
          percentage: Math.round((100 / count) * 10) / 10,
        };
      });
    } else if (splitType === 'PERCENTAGE') {
      let totalPct = 0;
      for (const p of participants) {
        totalPct += Number(p.percentage || 0);
      }
      if (Math.abs(totalPct - 100) > 0.5) {
        res.status(400).json({ error: `Percentages must add up to 100%. Currently: ${totalPct.toFixed(1)}%` });
        return;
      }

      let runningShareSum = 0;
      calculatedSplits = participants.map((p, idx) => {
        let share = Math.round((numAmount * (Number(p.percentage) / 100)) * 100) / 100;
        if (idx === participants.length - 1) {
          share = Math.round((numAmount - runningShareSum) * 100) / 100;
        } else {
          runningShareSum += share;
        }
        return {
          id: 'sp_' + Math.random().toString(36).substring(2, 9),
          expenseId: '',
          userId: p.userId,
          userName: p.userName,
          shareAmount: share,
          percentage: Number(p.percentage),
        };
      });
    } else {
      // CUSTOM SPLIT
      let totalCustom = 0;
      for (const p of participants) {
        totalCustom += Number(p.shareAmount || 0);
      }
      if (Math.abs(totalCustom - numAmount) > 0.05) {
        res.status(400).json({
          error: `Individual shares must equal total amount (${numAmount}). Currently sums to: ${totalCustom.toFixed(2)}`
        });
        return;
      }
      calculatedSplits = participants.map(p => ({
        id: 'sp_' + Math.random().toString(36).substring(2, 9),
        expenseId: '',
        userId: p.userId,
        userName: p.userName,
        shareAmount: Number(p.shareAmount),
      }));
    }

    const newExpense = db.createExpense({
      groupId,
      title: title.trim(),
      amount: numAmount,
      currency,
      payerId: payerId || req.user!.id,
      payerName: payerName || req.user!.name,
      category,
      date,
      splitType,
      splits: calculatedSplits,
      notes: notes?.trim() || '',
      taxAmount: taxAmount ? parseFloat(taxAmount) : undefined,
      receiptUrl: receiptUrl || undefined,
    });

    // Notify other members
    for (const member of group.members) {
      if (member.userId !== req.user!.id) {
        db.createNotification({
          userId: member.userId,
          title: 'New Expense Added',
          message: `${req.user!.name} added "${newExpense.title}" (${currency} ${numAmount.toLocaleString()}) in ${group.name}.`,
          type: 'EXPENSE',
          link: `/groups/${group.id}`,
        });
      }
    }

    // Smart Budget Alerts Check
    if (group.budget && group.budget > 0) {
      const allGroupExpenses = db.getExpensesForGroup(groupId);
      const totalGroupSpent = allGroupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const pctUsed = Math.round((totalGroupSpent / group.budget) * 100);

      if (pctUsed >= 100) {
        for (const member of group.members) {
          db.createNotification({
            userId: member.userId,
            title: '🚨 Group Budget Exceeded',
            message: `"${group.name}" has reached ${pctUsed}% of its budget (${currency} ${group.budget.toLocaleString()}). Total spent: ${currency} ${totalGroupSpent.toLocaleString()}.`,
            type: 'ALERT',
            link: `/groups/${group.id}`,
          });
        }
      } else if (pctUsed >= 70) {
        for (const member of group.members) {
          db.createNotification({
            userId: member.userId,
            title: '⚠️ Group Budget Warning',
            message: `"${group.name}" has used ${pctUsed}% of its budget (${currency} ${group.budget.toLocaleString()}). Remaining: ${currency} ${(group.budget - totalGroupSpent).toLocaleString()}.`,
            type: 'ALERT',
            link: `/groups/${group.id}`,
          });
        }
      }
    }

    res.status(201).json({
      message: 'Expense successfully recorded.',
      expense: newExpense,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record expense.' });
  }
});

// 2. UPDATE EXPENSE
router.put('/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const expenseId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const existing = db.getExpenseById(expenseId);
    if (!existing) {
      res.status(404).json({ error: 'Expense not found.' });
      return;
    }

    const { title, amount, category, date, notes } = req.body;
    const updates: any = {};
    if (title) updates.title = title.trim();
    if (amount) updates.amount = parseFloat(amount);
    if (category) updates.category = category;
    if (date) updates.date = date;
    if (notes !== undefined) updates.notes = notes;

    const updated = db.updateExpense(expenseId, updates);

    // Notify other group members
    const group = db.getGroupById(existing.groupId);
    if (group) {
      for (const member of group.members) {
        if (member.userId !== req.user!.id) {
          db.createNotification({
            userId: member.userId,
            title: 'Expense Updated',
            message: `${req.user!.name} updated "${updated?.title || existing.title}" in ${group.name}.`,
            type: 'EXPENSE',
            link: `/groups/${group.id}`,
          });
        }
      }
    }

    res.json({ message: 'Expense updated successfully.', expense: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update expense.' });
  }
});

// 3. DELETE EXPENSE
router.delete('/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const expenseId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const deleted = db.deleteExpense(expenseId);
    if (!deleted) {
      res.status(404).json({ error: 'Expense not found or already deleted.' });
      return;
    }
    res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
});

export default router;
