import { StoredGroup, StoredExpense, StoredSettlement } from '../db/database';

export interface CalculatedBalance {
  userId: string;
  userName: string;
  email: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
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

    for (const member of group.members) {
      balanceMap.set(member.userId, {
        userId: member.userId,
        userName: member.name,
        email: member.email,
        totalPaid: 0,
        totalOwed: 0,
      });
    }

    for (const expense of expenses) {
      const payerRecord = balanceMap.get(expense.payerId);
      if (payerRecord) {
        payerRecord.totalPaid += Number(expense.amount);
      }

      for (const split of expense.splits) {
        let memberRecord = balanceMap.get(split.userId);
        if (!memberRecord) {

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

    const settlementAdjustments = new Map<string, number>();
    for (const s of settlements) {
      if (s.status === 'COMPLETED') {
        const amt = Number(s.amount);

        settlementAdjustments.set(s.fromUserId, (settlementAdjustments.get(s.fromUserId) || 0) + amt);

        settlementAdjustments.set(s.toUserId, (settlementAdjustments.get(s.toUserId) || 0) - amt);
      }
    }

    const results: CalculatedBalance[] = [];
    for (const record of balanceMap.values()) {
      const adjustment = settlementAdjustments.get(record.userId) || 0;

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

  public static optimizeTransfers(balances: CalculatedBalance[], currency: string = 'INR'): OptimizedTransfer[] {

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

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transfers: OptimizedTransfer[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

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
