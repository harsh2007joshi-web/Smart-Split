import { StoredGroup, StoredExpense, StoredSettlement } from '../db/database';

export interface CalculatedBalance {
  userId: string;
  userName: string;
  email: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // positive = should receive, negative = owes
}

export interface OptimizedTransfer {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  currency: string;
}

export class SettlementEngine {
  /**
   * Calculates deterministic balances for every member in a group,
   * accounting for all expenses and completed settlements.
   */
  public static calculateBalances(
    group: StoredGroup,
    expenses: StoredExpense[],
    settlements: StoredSettlement[]
  ): CalculatedBalance[] {
    const balanceMap = new Map<string, {
      userId: string;
      userName: string;
      email: string;
      totalPaid: number;
      totalOwed: number;
    }>();

    // Initialize all group members with 0
    for (const member of group.members) {
      balanceMap.set(member.userId, {
        userId: member.userId,
        userName: member.name,
        email: member.email,
        totalPaid: 0,
        totalOwed: 0,
      });
    }

    // Process expenses
    for (const expense of expenses) {
      const payerRecord = balanceMap.get(expense.payerId);
      if (payerRecord) {
        payerRecord.totalPaid += Number(expense.amount);
      }

      for (const split of expense.splits) {
        let memberRecord = balanceMap.get(split.userId);
        if (!memberRecord) {
          // External or unlisted member
          memberRecord = {
            userId: split.userId,
            userName: split.userName,
            email: '',
            totalPaid: 0,
            totalOwed: 0,
          };
          balanceMap.set(split.userId, memberRecord);
        }
        memberRecord.totalOwed += Number(split.shareAmount);
      }
    }

    // Account for completed settlements
    const settlementAdjustments = new Map<string, number>();
    for (const s of settlements) {
      if (s.status === 'COMPLETED') {
        const amt = Number(s.amount);
        // Sender has paid their debt, so their effective net increases
        settlementAdjustments.set(s.fromUserId, (settlementAdjustments.get(s.fromUserId) || 0) + amt);
        // Receiver has collected, so their effective claim decreases
        settlementAdjustments.set(s.toUserId, (settlementAdjustments.get(s.toUserId) || 0) - amt);
      }
    }

    const results: CalculatedBalance[] = [];
    for (const record of balanceMap.values()) {
      const adjustment = settlementAdjustments.get(record.userId) || 0;
      // Net = (totalPaid - totalOwed) + adjustment
      const net = Math.round((record.totalPaid - record.totalOwed + adjustment) * 100) / 100;

      results.push({
        userId: record.userId,
        userName: record.userName,
        email: record.email,
        totalPaid: Math.round(record.totalPaid * 100) / 100,
        totalOwed: Math.round(record.totalOwed * 100) / 100,
        netBalance: net,
      });
    }

    return results;
  }

  /**
   * Optimizes settlement transfers using a deterministic greedy netting algorithm.
   * Minimizes the total number of transactions required to clear all debts.
   */
  public static optimizeTransfers(balances: CalculatedBalance[], currency: string = 'INR'): OptimizedTransfer[] {
    // Separate into debtors (negative net balance) and creditors (positive net balance)
    interface Participant {
      userId: string;
      userName: string;
      amount: number;
    }

    const debtors: Participant[] = [];
    const creditors: Participant[] = [];

    for (const b of balances) {
      const net = Math.round(b.netBalance * 100) / 100;
      if (net < -0.01) {
        debtors.push({ userId: b.userId, userName: b.userName, amount: Math.abs(net) });
      } else if (net > 0.01) {
        creditors.push({ userId: b.userId, userName: b.userName, amount: net });
      }
    }

    // Sort descending by amount to maximize debt clearing per transaction
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transfers: OptimizedTransfer[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // Settle min of what debtor owes and creditor is owed
      const settleAmount = Math.round(Math.min(debtor.amount, creditor.amount) * 100) / 100;

      if (settleAmount > 0.01) {
        transfers.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: settleAmount,
          currency,
        });
      }

      debtor.amount = Math.round((debtor.amount - settleAmount) * 100) / 100;
      creditor.amount = Math.round((creditor.amount - settleAmount) * 100) / 100;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return transfers;
  }
}
