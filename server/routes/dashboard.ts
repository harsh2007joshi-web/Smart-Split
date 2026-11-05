import { Router, Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { SettlementEngine } from '../services/settlementEngine';

const router = Router();
router.use(authenticateToken);

router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const userGroups = db.getGroupsForUser(user.id);
    const userGroupIds = userGroups.map(g => g.id);

    const allExpenses = db.getRawData().expenses.filter(e => userGroupIds.includes(e.groupId));
    const allSettlements = db.getRawData().settlements.filter(s => userGroupIds.includes(s.groupId));

    const categoryTotals: Record<string, number> = {
      Food: 0,
      Travel: 0,
      Accommodation: 0,
      Entertainment: 0,
      Others: 0,
    };

    let totalSpent = 0;
    for (const exp of allExpenses) {
      const amt = Number(exp.amount);
      totalSpent += amt;
      const cat = exp.category in categoryTotals ? exp.category : 'Others';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    }

    const categoryColors: Record<string, string> = {
      Food: '#1685F8',
      Accommodation: '#10274A',
      Travel: '#16B890',
      Entertainment: '#F59E0B',
      Others: '#64748B',
    };

    const categorySpending = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0,
      color: categoryColors[cat] || '#1685F8',
    }));

    let youOwe = 0;
    let youAreOwed = 0;

    for (const group of userGroups) {
      const gExpenses = allExpenses.filter(e => e.groupId === group.id);
      const gSettlements = allSettlements.filter(s => s.groupId === group.id);
      const balances = SettlementEngine.calculateBalances(group, gExpenses, gSettlements);
      const userBal = balances.find(b => b.userId === user.id);
      if (userBal) {
        if (userBal.netBalance > 0) youAreOwed += userBal.netBalance;
        else if (userBal.netBalance < 0) youOwe += Math.abs(userBal.netBalance);
      }
    }

    const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ['Food', 0];
    const topCatPct = totalSpent > 0 ? Math.round((topCat[1] / totalSpent) * 100) : 0;

    const groupWithBudget = userGroups.find(g => g.budget && g.budget > 0);
    let budgetInsightText = '';
    if (groupWithBudget) {
      const gExpenses = allExpenses.filter(e => e.groupId === groupWithBudget.id);
      const gSpent = gExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const bPct = Math.round((gSpent / groupWithBudget.budget!) * 100);
      budgetInsightText = ` "${groupWithBudget.name}" has utilized ${bPct}% of its ${groupWithBudget.currency} ${groupWithBudget.budget!.toLocaleString()} budget.`;
    }

    let aiInsight = {
      title: 'AI Insight',
      badge: 'Smart Budgeting',
      description: totalSpent > 0
        ? `${topCat[0]} is your largest spending category this month (${topCatPct}% of total group spending).${budgetInsightText}`
        : 'Start tracking group expenses to unlock personalized smart AI insights.',
      recommendation: youOwe > 0
        ? `You have ₹${youOwe.toLocaleString()} in pending settlements. Use PayPal or 3D Card checkout to clear balances with 1 click.`
        : youAreOwed > 0
        ? `You are owed ₹${youAreOwed.toLocaleString()}. Send an instant settlement reminder to group members.`
        : 'All your group expenses are balanced. Great financial management!',
    };

    const recentGroups = userGroups.slice(0, 4).map(g => {
      const gExpenses = allExpenses.filter(e => e.groupId === g.id);
      const gTotal = gExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        ...g,
        totalSpent: gTotal,
        recentExpensesCount: gExpenses.length,
      };
    });

    const recentActivities = allExpenses.slice(0, 5).map(exp => ({
      id: exp.id,
      type: 'EXPENSE',
      description: `${exp.payerName} paid for ${exp.title}`,
      time: exp.date,
      amount: exp.amount,
      currency: exp.currency,
    }));

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
      totalSpent,
      youOwe,
      youAreOwed,
      totalGroups: userGroups.length,
      recentGroups,
      categorySpending,
      aiInsight,
      recentActivities,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assemble dashboard data.' });
  }
});

export default router;
