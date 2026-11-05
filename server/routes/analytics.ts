import { Router, Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { SettlementEngine } from '../services/settlementEngine';

const router = Router();
router.use(authenticateToken);

router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const userGroups = db.getGroupsForUser(userId);
    const userGroupIds = userGroups.map(g => g.id);

    const allExpenses = db.getRawData().expenses.filter(e => userGroupIds.includes(e.groupId));
    const allSettlements = db.getRawData().settlements.filter(s => userGroupIds.includes(s.groupId));

    const categoryMap: Record<string, number> = {
      Food: 0,
      Travel: 0,
      Accommodation: 0,
      Entertainment: 0,
      Utilities: 0,
      Shopping: 0,
      Others: 0,
    };

    let totalGroupSpent = 0;
    let userPaidTotal = 0;
    let userShareTotal = 0;

    for (const exp of allExpenses) {
      const amt = Number(exp.amount);
      totalGroupSpent += amt;
      const cat = exp.category || 'Others';
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;

      if (exp.payerId === userId) {
        userPaidTotal += amt;
      }

      for (const s of exp.splits) {
        if (s.userId === userId) {
          userShareTotal += Number(s.shareAmount);
        }
      }
    }

    const categoryColors: Record<string, string> = {
      Food: '#1685F8',
      Accommodation: '#10274A',
      Travel: '#16B890',
      Entertainment: '#F59E0B',
      Utilities: '#8B5CF6',
      Shopping: '#EC4899',
      Others: '#64748B',
    };

    const categoryBreakdown = Object.entries(categoryMap)
      .filter(([_, amt]) => amt > 0)
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: totalGroupSpent > 0 ? Math.round((amt / totalGroupSpent) * 100) : 0,
        color: categoryColors[cat] || '#1685F8',
      }));

    const groupBreakdown = userGroups.map(g => {
      const gExpenses = allExpenses.filter(e => e.groupId === g.id);
      const spent = gExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        id: g.id,
        name: g.name,
        spent,
        expenseCount: gExpenses.length,
        membersCount: g.members.length,
      };
    });

    let youOwe = 0;
    let youAreOwed = 0;

    for (const group of userGroups) {
      const gExpenses = allExpenses.filter(e => e.groupId === group.id);
      const gSettlements = allSettlements.filter(s => s.groupId === group.id);
      const balances = SettlementEngine.calculateBalances(group, gExpenses, gSettlements);
      const userBal = balances.find(b => b.userId === userId);
      if (userBal) {
        if (userBal.netBalance > 0) youAreOwed += userBal.netBalance;
        else if (userBal.netBalance < 0) youOwe += Math.abs(userBal.netBalance);
      }
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    interface MonthlyBucket {
      month: string;
      year: number;
      monthIndex: number;
      amount: number;
    }

    const monthlyBuckets: MonthlyBucket[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyBuckets.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        amount: 0,
      });
    }

    for (const exp of allExpenses) {
      const amt = Number(exp.amount) || 0;
      if (amt <= 0) continue;

      const expDate = new Date(exp.date || exp.createdAt);
      if (isNaN(expDate.getTime())) continue;

      const bucket = monthlyBuckets.find(
        b => b.year === expDate.getFullYear() && b.monthIndex === expDate.getMonth()
      );
      if (bucket) {
        bucket.amount += amt;
      }
    }

    const monthlySpending = monthlyBuckets.map(b => ({
      month: b.month,
      amount: b.amount,
    }));

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = Math.max(1, now.getDate());
    const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);

    const currentMonthSpent = monthlyBuckets[5].amount;

    let dailyVelocity = 0;
    let estimatedMonthEnd = 0;
    if (currentMonthSpent > 0) {
      dailyVelocity = Math.round((currentMonthSpent / dayOfMonth) * 100) / 100;
      estimatedMonthEnd = Math.round(currentMonthSpent + (dailyVelocity * daysRemaining));
    }

    const historicalAmounts = monthlyBuckets.slice(0, 5).map(m => m.amount);
    const pastSpending = historicalAmounts.reduce((a, b) => a + b, 0);
    const monthsWithSpend = historicalAmounts.filter(a => a > 0).length;
    const historicalAverage = monthsWithSpend > 0 ? Math.round(pastSpending / monthsWithSpend) : 0;

    let trend: 'INCREASING' | 'DECREASING' | 'STABLE' = 'STABLE';
    if (currentMonthSpent === 0 && historicalAverage === 0) {
      trend = 'STABLE';
    } else if (historicalAverage === 0) {
      trend = currentMonthSpent > 0 ? 'INCREASING' : 'STABLE';
    } else {
      trend = estimatedMonthEnd > historicalAverage * 1.08
        ? 'INCREASING'
        : estimatedMonthEnd < historicalAverage * 0.92
        ? 'DECREASING'
        : 'STABLE';
    }

    let budgetOverrunRisk = false;
    let budgetRiskMessage = '';
    const groupsWithBudget = userGroups.filter(g => g.budget && g.budget > 0);
    for (const g of groupsWithBudget) {
      const gSpent = allExpenses.filter(e => e.groupId === g.id).reduce((sum, e) => sum + Number(e.amount), 0);
      if (gSpent > g.budget!) {
        budgetOverrunRisk = true;
        budgetRiskMessage = `Group "${g.name}" has exceeded its set budget by ${g.currency} ${(gSpent - g.budget!).toLocaleString()}.`;
        break;
      } else if (gSpent / g.budget! >= 0.85) {
        budgetOverrunRisk = true;
        budgetRiskMessage = `Group "${g.name}" is near its budget (${Math.round((gSpent / g.budget!) * 100)}% used).`;
        break;
      }
    }

    const spendingPrediction = {
      hasSufficientData: allExpenses.length > 0,
      historicalAverage,
      currentMonthSpent,
      estimatedMonthEnd,
      dailyVelocity,
      daysRemainingInMonth: daysRemaining,
      trend,
      budgetOverrunRisk,
      budgetRiskMessage,
      disclaimer: 'Predictions are mathematical estimates based on current daily spending velocity and historical patterns. They are not guaranteed outcomes.',
    };

    res.json({
      summary: {
        totalSpent: totalGroupSpent,
        userPaidTotal,
        userShareTotal,
        youOwe,
        youAreOwed,
        activeGroupsCount: userGroups.length,
        totalExpensesCount: allExpenses.length,
      },
      categoryBreakdown,
      groupBreakdown,
      monthlySpending,
      spendingPrediction,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve analytics data.' });
  }
});

export default router;
