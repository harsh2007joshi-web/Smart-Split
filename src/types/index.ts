export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export type SplitMethod = 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  avatarUrl?: string;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  category: string;
  currency: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  totalSpent?: number;
  recentExpensesCount?: number;
  budget?: number;
  remainingBudget?: number;
  budgetUsedPercentage?: number;
}

export interface ExpenseSplit {
  id?: string;
  expenseId?: string;
  userId: string;
  userName: string;
  shareAmount: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  groupId: string;
  groupName?: string;
  title: string;
  amount: number;
  currency: string;
  payerId: string;
  payerName: string;
  category: 'Food' | 'Travel' | 'Accommodation' | 'Entertainment' | 'Shopping' | 'Utilities' | 'Others';
  date: string;
  splitType: SplitMethod;
  splits: ExpenseSplit[];
  notes?: string;
  taxAmount?: number;
  receiptUrl?: string;
  createdAt: string;
}

export interface MemberBalance {
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // Positive = gets back, Negative = owes
}

export interface SuggestedSettlement {
  id: string;
  groupId: string;
  groupName: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  toUserName: string;
  toUserAvatar?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED';
}

export type PaymentMethodType = 'PAYPAL' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'GOOGLE_PAY';
export type PaymentStatusType = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface PaymentTransaction {
  id: string;
  settlementId?: string;
  groupId?: string;
  groupName?: string;
  payerId: string;
  payerName: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  currency: string;
  method: PaymentMethodType;
  status: PaymentStatusType;
  reference: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INVITATION' | 'EXPENSE' | 'SETTLEMENT' | 'PAYMENT' | 'ALERT';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface AIParsedExpense {
  title: string;
  amount: number;
  currency: string;
  payerName: string;
  participantNames: string[];
  category: 'Food' | 'Travel' | 'Accommodation' | 'Entertainment' | 'Shopping' | 'Utilities' | 'Others';
  splitType: SplitMethod;
  splits: { userName: string; shareAmount: number; percentage?: number }[];
  date: string;
  notes?: string;
  confidence: number;
  explanation: string;
}

export interface DashboardData {
  user: User;
  totalSpent: number;
  youOwe: number;
  youAreOwed: number;
  totalGroups: number;
  recentGroups: Group[];
  categorySpending: { category: string; amount: number; percentage: number; color: string }[];
  aiInsight: {
    title: string;
    description: string;
    recommendation: string;
    badge: string;
  };
  recentActivities: {
    id: string;
    type: string;
    description: string;
    time: string;
    amount?: number;
    currency?: string;
  }[];
}

export interface ScannedReceipt {
  success: boolean;
  message?: string;
  merchantName?: string;
  title?: string;
  amount?: number;
  currency?: string;
  date?: string;
  category?: 'Food' | 'Travel' | 'Accommodation' | 'Entertainment' | 'Shopping' | 'Utilities' | 'Others';
  taxAmount?: number;
  notes?: string;
  confidence?: number;
  serviceConfigured: boolean;
}

export interface SpendingPrediction {
  hasSufficientData: boolean;
  historicalAverage: number;
  currentMonthSpent: number;
  estimatedMonthEnd: number;
  dailyVelocity: number;
  daysRemainingInMonth: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  budgetOverrunRisk: boolean;
  budgetRiskMessage: string;
  disclaimer: string;
}
