import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const DB_FILE = path.join(DATA_DIR, 'splitsmart_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  isPhoneVerified?: boolean;
  passwordHash: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredPhoneVerification {
  id: string;
  phone: string;
  otp: string;
  sessionId: string;
  expiresAt: number;
  verified: boolean;
}

export interface StoredInvitation {
  id: string;
  groupId: string;
  groupName: string;
  inviterName: string;
  email: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: string;
}

export interface StoredVerificationToken {
  id: string;
  userId: string;
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

export interface StoredResetChallenge {
  id: string;
  email: string;
  otp: string;
  resetToken?: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

export interface StoredGroupMember {
  id: string;
  groupId: string;
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface StoredGroup {
  id: string;
  name: string;
  description?: string;
  category: string;
  currency: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  members: StoredGroupMember[];
}

export interface StoredExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  userName: string;
  shareAmount: number;
  percentage?: number;
}

export interface StoredExpense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  payerId: string;
  payerName: string;
  category: 'Food' | 'Travel' | 'Accommodation' | 'Entertainment' | 'Shopping' | 'Utilities' | 'Others';
  date: string;
  splitType: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
  splits: StoredExpenseSplit[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSettlement {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED';
  paymentId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StoredPayment {
  id: string;
  settlementId?: string;
  groupId?: string;
  payerId: string;
  payerName: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  currency: string;
  method: 'PAYPAL' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'GOOGLE_PAY';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference: string;
  receiptNumber?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface StoredNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INVITATION' | 'EXPENSE' | 'SETTLEMENT' | 'PAYMENT' | 'ALERT';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  verificationTokens: StoredVerificationToken[];
  phoneVerifications: StoredPhoneVerification[];
  invitations: StoredInvitation[];
  resetChallenges: StoredResetChallenge[];
  groups: StoredGroup[];
  expenses: StoredExpense[];
  settlements: StoredSettlement[];
  payments: StoredPayment[];
  notifications: StoredNotification[];
}

const defaultSchema: DatabaseSchema = {
  users: [],
  verificationTokens: [],
  phoneVerifications: [],
  invitations: [],
  resetChallenges: [],
  groups: [],
  expenses: [],
  settlements: [],
  payments: [],
  notifications: [],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.initDemoDataIfNeeded();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...defaultSchema,
          ...parsed,
          phoneVerifications: parsed.phoneVerifications || [],
          invitations: parsed.invitations || [],
        };
      }
    } catch (e) {
      console.error('Failed to load database file, creating fresh:', e);
    }
    return JSON.parse(JSON.stringify(defaultSchema));
  }

  public save(): void {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error('Failed to persist database file:', e);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // --- Users ---
  public findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt'>): StoredUser {
    const newUser: StoredUser = {
      ...user,
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: user.email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.syncUserWithGroups(newUser);
    this.save();
    return newUser;
  }

  public syncUserWithGroups(user: StoredUser): void {
    if (!user || !user.email) return;
    const userEmail = user.email.toLowerCase().trim();
    let changed = false;

    for (const group of this.data.groups) {
      for (const member of group.members) {
        if (member.email && member.email.toLowerCase().trim() === userEmail) {
          const oldUserId = member.userId;
          if (member.userId !== user.id || (user.name && member.name !== user.name)) {
            member.userId = user.id;
            if (user.name) member.name = user.name;
            changed = true;

            // Sync any existing expenses in this group
            for (const expense of this.data.expenses) {
              if (expense.groupId === group.id) {
                if (expense.payerId === oldUserId) {
                  expense.payerId = user.id;
                  if (user.name) expense.payerName = user.name;
                }
                if (expense.splits) {
                  for (const split of expense.splits) {
                    if (split.userId === oldUserId) {
                      split.userId = user.id;
                      if (user.name) split.userName = user.name;
                    }
                  }
                }
              }
            }

            // Sync settlements
            for (const s of this.data.settlements) {
              if (s.groupId === group.id) {
                if (s.fromUserId === oldUserId) {
                  s.fromUserId = user.id;
                  if (user.name) s.fromUserName = user.name;
                }
                if (s.toUserId === oldUserId) {
                  s.toUserId = user.id;
                  if (user.name) s.toUserName = user.name;
                }
              }
            }
          }
        }
      }
    }

    if (changed) {
      this.save();
    }
  }

  public findUserByPhone(phone: string): StoredUser | undefined {
    const cleaned = phone.replace(/\D/g, '');
    return this.data.users.find(u => {
      if (!u.phoneNumber) return false;
      const uClean = u.phoneNumber.replace(/\D/g, '');
      return uClean.endsWith(cleaned) || cleaned.endsWith(uClean);
    });
  }

  public savePhoneOtp(phone: string, otp: string, sessionId: string): void {
    const cleaned = phone.replace(/\D/g, '');
    this.data.phoneVerifications = (this.data.phoneVerifications || []).filter(
      p => p.phone !== cleaned
    );
    this.data.phoneVerifications.push({
      id: 'pv_' + Math.random().toString(36).substring(2, 9),
      phone: cleaned,
      otp,
      sessionId,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      verified: false,
    });
    this.save();
  }

  public verifyPhoneOtpLocally(phone: string, otp: string): { success: boolean; sessionId?: string; message: string } {
    const cleaned = phone.replace(/\D/g, '');
    const record = (this.data.phoneVerifications || []).find(
      p => p.phone === cleaned && Date.now() <= p.expiresAt
    );
    if (!record) {
      return { success: false, message: 'OTP expired or not found. Please request a new code.' };
    }
    if (record.otp !== otp.trim()) {
      return { success: false, message: 'Invalid OTP code. Please enter the 6 digits sent to your phone.' };
    }
    record.verified = true;
    this.save();
    return { success: true, sessionId: record.sessionId, message: 'Phone verified successfully.' };
  }

  public updateUser(id: string, updates: Partial<StoredUser>): StoredUser | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return user;
  }

  // --- Email Verification ---
  public createVerificationOtp(userId: string, email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // remove existing tokens for this user
    this.data.verificationTokens = this.data.verificationTokens.filter(t => t.userId !== userId);
    this.data.verificationTokens.push({
      id: 'tok_' + Math.random().toString(36).substring(2, 9),
      userId,
      email: email.toLowerCase().trim(),
      code,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
      attempts: 0,
    });
    this.save();
    return code;
  }

  public verifyEmailOtp(userId: string, code: string): { success: boolean; message: string } {
    const token = this.data.verificationTokens.find(t => t.userId === userId);
    if (!token) {
      return { success: false, message: 'No pending verification found.' };
    }
    if (Date.now() > token.expiresAt) {
      this.data.verificationTokens = this.data.verificationTokens.filter(t => t.id !== token.id);
      this.save();
      return { success: false, message: 'Verification code has expired. Please request a new code.' };
    }
    token.attempts += 1;
    if (token.attempts > 5) {
      this.data.verificationTokens = this.data.verificationTokens.filter(t => t.id !== token.id);
      this.save();
      return { success: false, message: 'Too many failed attempts. Please request a new code.' };
    }
    if (token.code !== code.trim()) {
      this.save();
      return { success: false, message: 'Incorrect verification code. Please check and try again.' };
    }
    // Mark user verified
    this.updateUser(userId, { isEmailVerified: true });
    this.data.verificationTokens = this.data.verificationTokens.filter(t => t.id !== token.id);
    this.save();
    return { success: true, message: 'Email successfully verified!' };
  }

  // --- Password Reset Challenges ---
  public createPasswordResetChallenge(email: string): { challengeId: string; otp: string } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const challengeId = 'res_' + Math.random().toString(36).substring(2, 11);
    this.data.resetChallenges = this.data.resetChallenges.filter(c => c.email !== email.toLowerCase().trim());
    this.data.resetChallenges.push({
      id: challengeId,
      email: email.toLowerCase().trim(),
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      verified: false,
    });
    this.save();
    return { challengeId, otp };
  }

  public verifyResetOtp(challengeId: string, otp: string): { success: boolean; resetToken?: string; message: string } {
    const challenge = this.data.resetChallenges.find(c => c.id === challengeId);
    if (!challenge) {
      return { success: false, message: 'Invalid or expired recovery session.' };
    }
    if (Date.now() > challenge.expiresAt) {
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }
    challenge.attempts += 1;
    if (challenge.attempts > 5) {
      this.data.resetChallenges = this.data.resetChallenges.filter(c => c.id !== challengeId);
      this.save();
      return { success: false, message: 'Too many attempts. Recovery session terminated.' };
    }
    if (challenge.otp !== otp.trim()) {
      this.save();
      return { success: false, message: 'Invalid OTP code. Please enter the 6 digits sent to your email.' };
    }
    challenge.verified = true;
    challenge.resetToken = 'rst_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    this.save();
    return { success: true, resetToken: challenge.resetToken, message: 'Code verified successfully.' };
  }

  public completePasswordReset(resetToken: string, newPasswordHash: string): { success: boolean; message: string } {
    const challenge = this.data.resetChallenges.find(c => c.resetToken === resetToken && c.verified);
    if (!challenge) {
      return { success: false, message: 'Invalid or already-used reset authorization.' };
    }
    const user = this.findUserByEmail(challenge.email);
    if (!user) {
      return { success: false, message: 'Associated user account not found.' };
    }
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();
    // Invalidate challenge
    this.data.resetChallenges = this.data.resetChallenges.filter(c => c.id !== challenge.id);
    this.save();
    return { success: true, message: 'Password has been successfully updated.' };
  }

  // --- Groups ---
  public getGroupsForUser(userId: string): StoredGroup[] {
    const user = this.findUserById(userId);
    if (user) {
      this.syncUserWithGroups(user);
    }
    const userEmail = user?.email?.toLowerCase().trim();
    return this.data.groups.filter(g =>
      g.members.some(m => m.userId === userId || (userEmail && m.email && m.email.toLowerCase().trim() === userEmail))
    );
  }

  public getGroupById(groupId: string): StoredGroup | undefined {
    return this.data.groups.find(g => g.id === groupId);
  }

  public createGroup(data: { name: string; description?: string; category: string; currency: string; creator: StoredUser; initialMembers?: { name: string; email: string }[] }): StoredGroup {
    const groupId = 'grp_' + Math.random().toString(36).substring(2, 9);
    const members: StoredGroupMember[] = [
      {
        id: 'gm_' + Math.random().toString(36).substring(2, 9),
        groupId,
        userId: data.creator.id,
        name: data.creator.name,
        email: data.creator.email,
        role: 'ADMIN',
        joinedAt: new Date().toISOString(),
      }
    ];

    if (data.initialMembers && data.initialMembers.length > 0) {
      for (const m of data.initialMembers) {
        if (!m.name || !m.email) continue;
        const existingUser = this.findUserByEmail(m.email);
        members.push({
          id: 'gm_' + Math.random().toString(36).substring(2, 9),
          groupId,
          userId: existingUser ? existingUser.id : 'usr_ext_' + Math.random().toString(36).substring(2, 7),
          name: m.name,
          email: m.email.toLowerCase().trim(),
          role: 'MEMBER',
          joinedAt: new Date().toISOString(),
        });
      }
    }

    const newGroup: StoredGroup = {
      id: groupId,
      name: data.name,
      description: data.description || '',
      category: data.category || 'General',
      currency: data.currency || 'INR',
      creatorId: data.creator.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members,
    };

    this.data.groups.push(newGroup);
    this.save();
    return newGroup;
  }

  public addMemberToGroup(groupId: string, memberData: { name: string; email: string }): StoredGroupMember | undefined {
    const group = this.getGroupById(groupId);
    if (!group) return undefined;
    const existing = group.members.find(m => m.email.toLowerCase() === memberData.email.toLowerCase());
    if (existing) return existing;

    const existingUser = this.findUserByEmail(memberData.email);
    const newMember: StoredGroupMember = {
      id: 'gm_' + Math.random().toString(36).substring(2, 9),
      groupId,
      userId: existingUser ? existingUser.id : 'usr_ext_' + Math.random().toString(36).substring(2, 7),
      name: memberData.name,
      email: memberData.email.toLowerCase().trim(),
      role: 'MEMBER',
      joinedAt: new Date().toISOString(),
    };
    group.members.push(newMember);
    group.updatedAt = new Date().toISOString();
    this.save();
    return newMember;
  }

  public createGroupInvitation(groupId: string, groupName: string, inviterName: string, email: string): StoredInvitation {
    const token = 'inv_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    const invitation: StoredInvitation = {
      id: 'invit_' + Math.random().toString(36).substring(2, 9),
      groupId,
      groupName,
      inviterName,
      email: email.toLowerCase().trim(),
      token,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.data.invitations = this.data.invitations || [];
    this.data.invitations.push(invitation);
    this.save();
    return invitation;
  }

  public getInvitationByToken(token: string): StoredInvitation | undefined {
    return (this.data.invitations || []).find(i => i.token === token.trim());
  }

  public acceptGroupInvitation(token: string, user: StoredUser): { success: boolean; group?: StoredGroup; message: string } {
    const invitation = this.getInvitationByToken(token);
    if (!invitation) {
      return { success: false, message: 'Invalid or expired invitation link.' };
    }
    const group = this.getGroupById(invitation.groupId);
    if (!group) {
      return { success: false, message: 'The requested trip group is no longer active.' };
    }

    const userEmail = user.email.toLowerCase().trim();
    // Check if user is already in group by userId or email
    const existingMember = group.members.find(m => 
      m.userId === user.id || (m.email && m.email.toLowerCase().trim() === userEmail)
    );

    if (existingMember) {
      existingMember.userId = user.id;
      if (user.name) existingMember.name = user.name;
      existingMember.email = userEmail;
    } else {
      group.members.push({
        id: 'gm_' + Math.random().toString(36).substring(2, 9),
        groupId: group.id,
        userId: user.id,
        name: user.name,
        email: userEmail,
        role: 'MEMBER',
        joinedAt: new Date().toISOString(),
      });
    }

    group.updatedAt = new Date().toISOString();
    invitation.status = 'ACCEPTED';
    this.syncUserWithGroups(user);
    this.save();
    return { success: true, group, message: `Successfully joined ${group.name}!` };
  }

  public deleteGroup(groupId: string, userId: string): { success: boolean; message: string } {
    const group = this.getGroupById(groupId);
    if (!group) {
      return { success: false, message: 'Group not found or already deleted.' };
    }

    // Check if requester is creator/admin or member
    const member = group.members.find(m => m.userId === userId);
    if (!member) {
      return { success: false, message: 'You are not a member of this group.' };
    }

    // Clean up expenses
    this.data.expenses = this.data.expenses.filter(e => e.groupId !== groupId);
    // Clean up settlements
    this.data.settlements = this.data.settlements.filter(s => s.groupId !== groupId);
    // Clean up invitations
    if (this.data.invitations) {
      this.data.invitations = this.data.invitations.filter(i => i.groupId !== groupId);
    }
    // Remove group
    this.data.groups = this.data.groups.filter(g => g.id !== groupId);
    this.save();

    return { success: true, message: `Trip group "${group.name}" has been successfully deleted and closed.` };
  }

  // --- Expenses ---
  public getExpensesForGroup(groupId: string): StoredExpense[] {
    return this.data.expenses.filter(e => e.groupId === groupId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getExpenseById(id: string): StoredExpense | undefined {
    return this.data.expenses.find(e => e.id === id);
  }

  public createExpense(data: Omit<StoredExpense, 'id' | 'createdAt' | 'updatedAt'>): StoredExpense {
    const newExpense: StoredExpense = {
      ...data,
      id: 'exp_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.expenses.push(newExpense);
    this.save();
    return newExpense;
  }

  public updateExpense(id: string, updates: Partial<StoredExpense>): StoredExpense | undefined {
    const expense = this.getExpenseById(id);
    if (!expense) return undefined;
    Object.assign(expense, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return expense;
  }

  public deleteExpense(id: string): boolean {
    const initialLen = this.data.expenses.length;
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    if (this.data.expenses.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Settlements ---
  public getSettlementsForGroup(groupId: string): StoredSettlement[] {
    return this.data.settlements.filter(s => s.groupId === groupId);
  }

  public getAllSettlements(): StoredSettlement[] {
    return this.data.settlements;
  }

  public createSettlement(settlement: Omit<StoredSettlement, 'id' | 'createdAt'>): StoredSettlement {
    const newSettlement: StoredSettlement = {
      ...settlement,
      id: 'set_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.data.settlements.push(newSettlement);
    this.save();
    return newSettlement;
  }

  public markSettlementCompleted(settlementId: string, paymentId: string): StoredSettlement | undefined {
    const settlement = this.data.settlements.find(s => s.id === settlementId);
    if (settlement) {
      settlement.status = 'COMPLETED';
      settlement.paymentId = paymentId;
      settlement.completedAt = new Date().toISOString();
      this.save();
    }
    return settlement;
  }

  // --- Payments ---
  public createPayment(payment: Omit<StoredPayment, 'id' | 'createdAt'>): StoredPayment {
    const newPayment: StoredPayment = {
      ...payment,
      id: 'pay_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.data.payments.push(newPayment);
    this.save();
    return newPayment;
  }

  public getPaymentById(id: string): StoredPayment | undefined {
    return this.data.payments.find(p => p.id === id);
  }

  public getPaymentByReference(reference: string): StoredPayment | undefined {
    return this.data.payments.find(p => p.reference === reference);
  }

  public updatePaymentStatus(id: string, status: StoredPayment['status'], metadata?: Record<string, any>): StoredPayment | undefined {
    const payment = this.getPaymentById(id);
    if (payment) {
      payment.status = status;
      if (metadata) {
        payment.metadata = { ...(payment.metadata || {}), ...metadata };
      }
      this.save();
    }
    return payment;
  }

  public getAllPayments(): StoredPayment[] {
    return this.data.payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- Notifications ---
  public getNotificationsForUser(userId: string): StoredNotification[] {
    return this.data.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: Omit<StoredNotification, 'id' | 'createdAt' | 'isRead'>): StoredNotification {
    const notif: StoredNotification = {
      ...data,
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.push(notif);
    this.save();
    return notif;
  }

  public markNotificationRead(id: string): void {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
  }

  public markAllNotificationsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.save();
  }

  // --- Demo Seed Data Initialization ---
  public initDemoDataIfNeeded(force: boolean = false): void {
    if (!force && this.data.users.length > 0) {
      return;
    }

    console.log('Seeding initial demo data for SplitSmart AI...');
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('Password@123', salt);

    // Create realistic users
    const rahul: StoredUser = {
      id: 'usr_rahul',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const priya: StoredUser = {
      id: 'usr_priya',
      name: 'Priya Patel',
      email: 'priya@example.com',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const aman: StoredUser = {
      id: 'usr_aman',
      name: 'Aman Gupta',
      email: 'aman@example.com',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sneha: StoredUser = {
      id: 'usr_sneha',
      name: 'Sneha Roy',
      email: 'sneha@example.com',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users = [rahul, priya, aman, sneha];

    // Groups
    const goaTrip: StoredGroup = {
      id: 'grp_goa2026',
      name: 'Goa Trip 2026',
      description: 'Annual beach vacation and adventures with college gang',
      category: 'Travel',
      currency: 'INR',
      creatorId: rahul.id,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        { id: 'gm_1', groupId: 'grp_goa2026', userId: rahul.id, name: rahul.name, email: rahul.email, role: 'ADMIN', joinedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
        { id: 'gm_2', groupId: 'grp_goa2026', userId: priya.id, name: priya.name, email: priya.email, role: 'MEMBER', joinedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
        { id: 'gm_3', groupId: 'grp_goa2026', userId: aman.id, name: aman.name, email: aman.email, role: 'MEMBER', joinedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
        { id: 'gm_4', groupId: 'grp_goa2026', userId: sneha.id, name: sneha.name, email: sneha.email, role: 'MEMBER', joinedAt: new Date(Date.now() - 13 * 86400000).toISOString() },
      ]
    };

    const collegeFriends: StoredGroup = {
      id: 'grp_college',
      name: 'College Friends',
      description: 'Weekend hangouts, dinners, movies & treats',
      category: 'Entertainment',
      currency: 'INR',
      creatorId: rahul.id,
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        { id: 'gm_5', groupId: 'grp_college', userId: rahul.id, name: rahul.name, email: rahul.email, role: 'ADMIN', joinedAt: new Date(Date.now() - 45 * 86400000).toISOString() },
        { id: 'gm_6', groupId: 'grp_college', userId: priya.id, name: priya.name, email: priya.email, role: 'MEMBER', joinedAt: new Date(Date.now() - 45 * 86400000).toISOString() },
        { id: 'gm_7', groupId: 'grp_college', userId: aman.id, name: aman.name, email: aman.email, role: 'MEMBER', joinedAt: new Date(Date.now() - 45 * 86400000).toISOString() },
      ]
    };

    const roommates: StoredGroup = {
      id: 'grp_roommates',
      name: 'Roommates Flat 402',
      description: 'Rent, groceries, high-speed WiFi, electricity & maintenance',
      category: 'Utilities',
      currency: 'INR',
      creatorId: aman.id,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        { id: 'gm_8', groupId: 'grp_roommates', userId: rahul.id, name: rahul.name, email: rahul.email, role: 'MEMBER', joinedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
        { id: 'gm_9', groupId: 'grp_roommates', userId: aman.id, name: aman.name, email: aman.email, role: 'ADMIN', joinedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
      ]
    };

    this.data.groups = [goaTrip, collegeFriends, roommates];

    // Expenses
    const exp1: StoredExpense = {
      id: 'exp_1',
      groupId: 'grp_goa2026',
      title: 'Beach Resort Villa Booking',
      amount: 14000,
      currency: 'INR',
      payerId: rahul.id,
      payerName: rahul.name,
      category: 'Accommodation',
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      splitType: 'EQUAL',
      splits: [
        { id: 's_1', expenseId: 'exp_1', userId: rahul.id, userName: rahul.name, shareAmount: 3500 },
        { id: 's_2', expenseId: 'exp_1', userId: priya.id, userName: priya.name, shareAmount: 3500 },
        { id: 's_3', expenseId: 'exp_1', userId: aman.id, userName: aman.name, shareAmount: 3500 },
        { id: 's_4', expenseId: 'exp_1', userId: sneha.id, userName: sneha.name, shareAmount: 3500 },
      ],
      notes: '3 nights stay near Baga Beach with breakfast included',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const exp2: StoredExpense = {
      id: 'exp_2',
      groupId: 'grp_goa2026',
      title: 'Seafood Shack Dinner & Drinks',
      amount: 4800,
      currency: 'INR',
      payerId: priya.id,
      payerName: priya.name,
      category: 'Food',
      date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      splitType: 'EQUAL',
      splits: [
        { id: 's_5', expenseId: 'exp_2', userId: rahul.id, userName: rahul.name, shareAmount: 1200 },
        { id: 's_6', expenseId: 'exp_2', userId: priya.id, userName: priya.name, shareAmount: 1200 },
        { id: 's_7', expenseId: 'exp_2', userId: aman.id, userName: aman.name, shareAmount: 1200 },
        { id: 's_8', expenseId: 'exp_2', userId: sneha.id, userName: sneha.name, shareAmount: 1200 },
      ],
      notes: 'Candlelight dinner at Curlies Beach Shack',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const exp3: StoredExpense = {
      id: 'exp_3',
      groupId: 'grp_goa2026',
      title: 'Self-Drive Thar Rental & Fuel',
      amount: 6000,
      currency: 'INR',
      payerId: aman.id,
      payerName: aman.name,
      category: 'Travel',
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      splitType: 'EQUAL',
      splits: [
        { id: 's_9', expenseId: 'exp_3', userId: rahul.id, userName: rahul.name, shareAmount: 1500 },
        { id: 's_10', expenseId: 'exp_3', userId: priya.id, userName: priya.name, shareAmount: 1500 },
        { id: 's_11', expenseId: 'exp_3', userId: aman.id, userName: aman.name, shareAmount: 1500 },
        { id: 's_12', expenseId: 'exp_3', userId: sneha.id, userName: sneha.name, shareAmount: 1500 },
      ],
      notes: 'Airport pickup and north Goa cruising',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const exp4: StoredExpense = {
      id: 'exp_4',
      groupId: 'grp_college',
      title: 'Italian Bistro Weekend Celebration',
      amount: 3600,
      currency: 'INR',
      payerId: rahul.id,
      payerName: rahul.name,
      category: 'Food',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      splitType: 'EQUAL',
      splits: [
        { id: 's_13', expenseId: 'exp_4', userId: rahul.id, userName: rahul.name, shareAmount: 1200 },
        { id: 's_14', expenseId: 'exp_4', userId: priya.id, userName: priya.name, shareAmount: 1200 },
        { id: 's_15', expenseId: 'exp_4', userId: aman.id, userName: aman.name, shareAmount: 1200 },
      ],
      notes: 'Pizzas, pasta and tiramisu',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const exp5: StoredExpense = {
      id: 'exp_5',
      groupId: 'grp_roommates',
      title: 'High-Speed Fiber WiFi & Electricity',
      amount: 2400,
      currency: 'INR',
      payerId: aman.id,
      payerName: aman.name,
      category: 'Utilities',
      date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      splitType: 'EQUAL',
      splits: [
        { id: 's_16', expenseId: 'exp_5', userId: rahul.id, userName: rahul.name, shareAmount: 1200 },
        { id: 's_17', expenseId: 'exp_5', userId: aman.id, userName: aman.name, shareAmount: 1200 },
      ],
      notes: 'Monthly connection bill',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.expenses = [exp1, exp2, exp3, exp4, exp5];

    // Historical Payments & Transactions
    const pay1: StoredPayment = {
      id: 'pay_demo_1',
      settlementId: 'set_demo_1',
      groupId: 'grp_goa2026',
      payerId: sneha.id,
      payerName: sneha.name,
      recipientId: rahul.id,
      recipientName: rahul.name,
      amount: 3500,
      currency: 'INR',
      method: 'PAYPAL',
      status: 'COMPLETED',
      reference: 'PP-TXN-88492019',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      metadata: { note: 'Villa booking share settled via PayPal Sandbox' },
    };

    this.data.payments = [pay1];

    // Notifications
    this.data.notifications = [
      {
        id: 'notif_1',
        userId: rahul.id,
        title: 'Settlement Received',
        message: 'Sneha Roy settled ₹3,500 for Beach Resort Villa Booking via PayPal Sandbox.',
        type: 'PAYMENT',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        link: '/transactions',
      },
      {
        id: 'notif_2',
        userId: rahul.id,
        title: 'New Expense Added',
        message: 'Aman Gupta added "High-Speed Fiber WiFi & Electricity" (₹2,400) in Roommates Flat 402.',
        type: 'EXPENSE',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        link: '/groups/grp_roommates',
      },
      {
        id: 'notif_3',
        userId: rahul.id,
        title: 'AI Smart Insight',
        message: 'Food and Accommodation account for 61% of your group spending this month.',
        type: 'ALERT',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        link: '/analytics',
      }
    ];

    this.save();
    console.log('Demo data successfully initialized.');
  }

  public resetDemoData(): void {
    this.initDemoDataIfNeeded(true);
  }
}

export const db = new Database();
