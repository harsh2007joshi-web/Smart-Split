import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const isVercel = !!process.env.VERCEL;
const BASE_DATA_DIR = path.resolve(process.cwd(), 'server/data');
const BASE_DB_FILE = path.join(BASE_DATA_DIR, 'splitsmart_db.json');

const DATA_DIR = isVercel ? path.join('/tmp', 'splitsmart_data') : BASE_DATA_DIR;
const DB_FILE = isVercel ? path.join(DATA_DIR, 'splitsmart_db.json') : BASE_DB_FILE;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (isVercel && !fs.existsSync(DB_FILE) && fs.existsSync(BASE_DB_FILE)) {
  try {
    fs.copyFileSync(BASE_DB_FILE, DB_FILE);
  } catch (e) {
  }
}

export interface StoredUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  gender?: 'male' | 'female' | 'other';
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
  budget?: number;
  budgetCurrency?: string;
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
  taxAmount?: number;
  receiptUrl?: string;
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
  type: 'INVITATION' | 'EXPENSE' | 'SETTLEMENT' | 'PAYMENT' | 'ALERT' | 'FRIEND_REQUEST' | 'MESSAGE';
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StoredFriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatarUrl?: string;
  receiverId: string;
  receiverName: string;
  receiverUsername: string;
  receiverAvatarUrl?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  updatedAt: string;
}

export interface StoredContact {
  id: string;
  userId: string;
  contactUserId: string;
  nickname?: string;
  createdAt: string;
}

export interface StoredChatAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface StoredChatReceipt {
  paymentId?: string;
  reference: string;
  amount: number;
  currency: string;
  groupName: string;
  date: string;
  status: string;
  payerName: string;
  recipientName: string;
  receiptNumber?: string;
}

export interface StoredChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatarUrl?: string;
  receiverId: string;
  receiverName: string;
  receiverUsername: string;
  receiverAvatarUrl?: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'RECEIPT';
  text?: string;
  attachment?: StoredChatAttachment;
  receipt?: StoredChatReceipt;
  createdAt: string;
  isRead: boolean;
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
  friendRequests: StoredFriendRequest[];
  contacts: StoredContact[];
  chatMessages: StoredChatMessage[];
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
  friendRequests: [],
  contacts: [],
  chatMessages: [],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.migrateUsernames();
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
          friendRequests: parsed.friendRequests || [],
          contacts: parsed.contacts || [],
          chatMessages: parsed.chatMessages || [],
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

  public generateUniqueUsername(name: string): string {
    let base = (name || 'user')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');
    if (!base) base = 'user';
    let suffix = Math.floor(100 + Math.random() * 900);
    let candidate = `@${base}_${suffix}`;
    let attempts = 0;
    while (this.data.users && this.data.users.some(u => u.username && u.username.toLowerCase() === candidate.toLowerCase())) {
      suffix = Math.floor(100 + Math.random() * 900);
      candidate = `@${base}_${suffix}`;
      attempts++;
      if (attempts > 60) {
        candidate = `@${base}_${Date.now().toString().slice(-4)}`;
        break;
      }
    }
    return candidate;
  }

  public migrateUsernames(): void {
    if (!this.data.users) return;
    let changed = false;
    for (const user of this.data.users) {
      if (!user.username) {
        user.username = this.generateUniqueUsername(user.name);
        changed = true;
      }
    }
    if (changed) {
      this.save();
      console.log('✅ Safely migrated existing users with unique usernames.');
    }
  }

  public findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByUsername(username: string): StoredUser | undefined {
    if (!username) return undefined;
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    return this.data.users.find(u => {
      if (!u.username) return false;
      return u.username.toLowerCase().replace(/^@/, '') === clean;
    });
  }

  public searchUsers(query: string, currentUserId?: string): StoredUser[] {
    if (!query || !query.trim()) return [];
    const clean = query.trim().toLowerCase().replace(/^@/, '');
    return this.data.users
      .filter(u => {
        if (currentUserId && u.id === currentUserId) return false;
        const matchUsername = u.username && u.username.toLowerCase().replace(/^@/, '').includes(clean);
        const matchName = u.name.toLowerCase().includes(clean);
        const matchEmail = u.email.toLowerCase().includes(clean);
        return matchUsername || matchName || matchEmail;
      })
      .slice(0, 15);
  }

  public createUser(user: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt' | 'username'> & { username?: string }): StoredUser {
    const assignedUsername = user.username || this.generateUniqueUsername(user.name);
    const newUser: StoredUser = {
      ...user,
      username: assignedUsername,
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
      expiresAt: Date.now() + 10 * 60 * 1000,
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

  public createVerificationOtp(userId: string, email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.data.verificationTokens = this.data.verificationTokens.filter(t => t.userId !== userId);
    this.data.verificationTokens.push({
      id: 'tok_' + Math.random().toString(36).substring(2, 9),
      userId,
      email: email.toLowerCase().trim(),
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
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
    this.updateUser(userId, { isEmailVerified: true });
    this.data.verificationTokens = this.data.verificationTokens.filter(t => t.id !== token.id);
    this.save();
    return { success: true, message: 'Email successfully verified!' };
  }

  public createPasswordResetChallenge(email: string): { challengeId: string; otp: string } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const challengeId = 'res_' + Math.random().toString(36).substring(2, 11);
    this.data.resetChallenges = this.data.resetChallenges.filter(c => c.email !== email.toLowerCase().trim());
    this.data.resetChallenges.push({
      id: challengeId,
      email: email.toLowerCase().trim(),
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
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
    this.data.resetChallenges = this.data.resetChallenges.filter(c => c.id !== challenge.id);
    this.save();
    return { success: true, message: 'Password has been successfully updated.' };
  }

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

    const member = group.members.find(m => m.userId === userId);
    if (!member) {
      return { success: false, message: 'You are not a member of this group.' };
    }

    this.data.expenses = this.data.expenses.filter(e => e.groupId !== groupId);
    this.data.settlements = this.data.settlements.filter(s => s.groupId !== groupId);
    if (this.data.invitations) {
      this.data.invitations = this.data.invitations.filter(i => i.groupId !== groupId);
    }
    this.data.groups = this.data.groups.filter(g => g.id !== groupId);
    this.save();

    return { success: true, message: `Trip group "${group.name}" has been successfully deleted and closed.` };
  }

  public updateGroup(groupId: string, updates: Partial<StoredGroup>): StoredGroup | undefined {
    const group = this.getGroupById(groupId);
    if (!group) return undefined;
    Object.assign(group, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return group;
  }

  public findPotentialDuplicateExpense(
    groupId: string,
    data: { title: string; amount: number; payerId?: string; date?: string }
  ): StoredExpense | undefined {
    const expenses = this.getExpensesForGroup(groupId);
    const targetTitle = (data.title || '').trim().toLowerCase();
    const targetAmount = Number(data.amount);
    if (!targetAmount || targetAmount <= 0) return undefined;

    const targetTime = data.date ? new Date(data.date).getTime() : Date.now();

    return expenses.find(e => {
      const diff = Math.abs(Number(e.amount) - targetAmount);
      const isAmountClose = diff <= 0.5 || (targetAmount > 0 && diff / targetAmount < 0.015);
      if (!isAmountClose) return false;

      const eTitle = e.title.trim().toLowerCase();
      const isTitleMatch =
        eTitle === targetTitle ||
        (targetTitle.length > 3 && eTitle.includes(targetTitle)) ||
        (eTitle.length > 3 && targetTitle.includes(eTitle));

      const eTime = new Date(e.date).getTime();
      const isDateClose = Math.abs(eTime - targetTime) <= 3 * 86400000;

      const isPayerMatch = !data.payerId || e.payerId === data.payerId;

      return isAmountClose && isTitleMatch && isDateClose && isPayerMatch;
    });
  }

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

  public createFriendRequest(senderId: string, receiverIdentifier: string): { success: boolean; message: string; request?: StoredFriendRequest } {
    const sender = this.findUserById(senderId);
    if (!sender) return { success: false, message: 'Sender not found.' };

    let receiver = this.findUserByUsername(receiverIdentifier);
    if (!receiver) {
      receiver = this.findUserById(receiverIdentifier);
    }
    if (!receiver) {
      return { success: false, message: `No registered user found matching "${receiverIdentifier}".` };
    }

    if (receiver.id === sender.id) {
      return { success: false, message: 'You cannot send a friend request to yourself.' };
    }

    if (this.areFriends(sender.id, receiver.id)) {
      return { success: false, message: `${receiver.name} is already in your contacts.` };
    }

    if (!this.data.friendRequests) this.data.friendRequests = [];

    const existingPending = this.data.friendRequests.find(
      r => r.status === 'PENDING' &&
        ((r.senderId === sender.id && r.receiverId === receiver.id) ||
         (r.senderId === receiver.id && r.receiverId === sender.id))
    );

    if (existingPending) {
      if (existingPending.senderId === sender.id) {
        return { success: false, message: 'Friend request is already pending.' };
      } else {
        return { success: false, message: `${receiver.name} has already sent you a friend request. You can accept it in Contacts or Notifications!` };
      }
    }

    const newRequest: StoredFriendRequest = {
      id: 'freq_' + Math.random().toString(36).substring(2, 9),
      senderId: sender.id,
      senderName: sender.name,
      senderUsername: sender.username || this.generateUniqueUsername(sender.name),
      senderAvatarUrl: sender.avatarUrl,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverUsername: receiver.username || this.generateUniqueUsername(receiver.name),
      receiverAvatarUrl: receiver.avatarUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.friendRequests.push(newRequest);

    this.createNotification({
      userId: receiver.id,
      title: 'New Friend Request 👋',
      message: `${sender.name} (${newRequest.senderUsername}) sent you a friend request.`,
      type: 'FRIEND_REQUEST',
      link: '/contacts',
      metadata: {
        friendRequestId: newRequest.id,
        senderId: sender.id,
        senderName: sender.name,
        senderUsername: newRequest.senderUsername,
      },
    });

    this.save();
    return { success: true, message: 'Friend request sent successfully.', request: newRequest };
  }

  public getFriendRequestById(id: string): StoredFriendRequest | undefined {
    return (this.data.friendRequests || []).find(r => r.id === id);
  }

  public getPendingIncomingRequests(userId: string): StoredFriendRequest[] {
    return (this.data.friendRequests || []).filter(r => r.receiverId === userId && r.status === 'PENDING');
  }

  public getSentRequests(userId: string): StoredFriendRequest[] {
    return (this.data.friendRequests || []).filter(r => r.senderId === userId);
  }

  public acceptFriendRequest(requestId: string, userId: string): { success: boolean; message: string; friendRequest?: StoredFriendRequest } {
    const req = this.getFriendRequestById(requestId);
    if (!req) return { success: false, message: 'Friend request not found.' };
    if (req.receiverId !== userId) return { success: false, message: 'You are not authorized to accept this friend request.' };
    if (req.status !== 'PENDING') return { success: false, message: `This friend request has already been ${req.status.toLowerCase()}.` };

    req.status = 'ACCEPTED';
    req.updatedAt = new Date().toISOString();

    this.addContact(req.senderId, req.receiverId);
    this.addContact(req.receiverId, req.senderId);

    const receiver = this.findUserById(userId);
    const receiverName = receiver?.name || req.receiverName;
    const receiverUsername = receiver?.username || req.receiverUsername;

    this.createNotification({
      userId: req.senderId,
      title: 'Friend Request Accepted 🎉',
      message: `${receiverName} (${receiverUsername}) accepted your friend request. You can now chat privately!`,
      type: 'FRIEND_REQUEST',
      link: '/contacts',
      metadata: {
        friendRequestId: req.id,
        acceptedUserId: userId,
      },
    });

    const notif = this.data.notifications.find(n => n.userId === userId && n.metadata?.friendRequestId === req.id);
    if (notif) notif.isRead = true;

    this.save();
    return { success: true, message: 'Friend request accepted successfully.', friendRequest: req };
  }

  public declineFriendRequest(requestId: string, userId: string): { success: boolean; message: string } {
    const req = this.getFriendRequestById(requestId);
    if (!req) return { success: false, message: 'Friend request not found.' };
    if (req.receiverId !== userId) return { success: false, message: 'You are not authorized to decline this friend request.' };
    if (req.status !== 'PENDING') return { success: false, message: `This friend request has already been ${req.status.toLowerCase()}.` };

    req.status = 'DECLINED';
    req.updatedAt = new Date().toISOString();

    const notif = this.data.notifications.find(n => n.userId === userId && n.metadata?.friendRequestId === req.id);
    if (notif) notif.isRead = true;

    this.save();
    return { success: true, message: 'Friend request declined.' };
  }

  public addContact(userId: string, contactUserId: string, nickname?: string): StoredContact {
    if (!this.data.contacts) this.data.contacts = [];
    const existing = this.data.contacts.find(c => c.userId === userId && c.contactUserId === contactUserId);
    if (existing) {
      if (nickname) existing.nickname = nickname;
      return existing;
    }
    const newContact: StoredContact = {
      id: 'cnt_' + Math.random().toString(36).substring(2, 9),
      userId,
      contactUserId,
      nickname,
      createdAt: new Date().toISOString(),
    };
    this.data.contacts.push(newContact);
    this.save();
    return newContact;
  }

  public areFriends(userId1: string, userId2: string): boolean {
    if (!userId1 || !userId2 || userId1 === userId2) return false;
    return (this.data.contacts || []).some(c => c.userId === userId1 && c.contactUserId === userId2);
  }

  public getContactsForUser(userId: string): Array<{
    contactRecordId: string;
    user: { id: string; name: string; username: string; email: string; avatarUrl?: string };
    addedAt: string;
    nickname?: string;
  }> {
    if (!this.data.contacts) this.data.contacts = [];
    const userContacts = this.data.contacts.filter(c => c.userId === userId);
    const result = [];
    for (const c of userContacts) {
      const u = this.findUserById(c.contactUserId);
      if (u) {
        result.push({
          contactRecordId: c.id,
          user: {
            id: u.id,
            name: u.name,
            username: u.username || this.generateUniqueUsername(u.name),
            email: u.email,
            avatarUrl: u.avatarUrl,
          },
          addedAt: c.createdAt,
          nickname: c.nickname,
        });
      }
    }
    return result.sort((a, b) => a.user.name.localeCompare(b.user.name));
  }

  public removeContact(userId: string, contactUserId: string): boolean {
    if (!this.data.contacts) this.data.contacts = [];
    const initialLen = this.data.contacts.length;
    this.data.contacts = this.data.contacts.filter(
      c => !( (c.userId === userId && c.contactUserId === contactUserId) ||
              (c.userId === contactUserId && c.contactUserId === userId) )
    );
    const changed = this.data.contacts.length !== initialLen;
    if (changed) this.save();
    return changed;
  }

  public getConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join(':');
  }

  public getChatMessages(userId1: string, userId2: string): StoredChatMessage[] {
    if (!this.data.chatMessages) this.data.chatMessages = [];
    const convId = this.getConversationId(userId1, userId2);
    const msgs = this.data.chatMessages.filter(m => m.conversationId === convId);

    let readChanged = false;
    for (const m of msgs) {
      if (m.receiverId === userId1 && !m.isRead) {
        m.isRead = true;
        readChanged = true;
      }
    }
    if (readChanged) {
      this.save();
    }

    return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public sendTextMessage(senderId: string, receiverId: string, text: string): StoredChatMessage {
    const sender = this.findUserById(senderId);
    const receiver = this.findUserById(receiverId);
    if (!sender || !receiver) throw new Error('User not found.');
    if (!this.areFriends(senderId, receiverId)) {
      throw new Error('You can only send private messages to accepted contacts.');
    }

    const convId = this.getConversationId(senderId, receiverId);
    const msg: StoredChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 11),
      conversationId: convId,
      senderId: sender.id,
      senderName: sender.name,
      senderUsername: sender.username || this.generateUniqueUsername(sender.name),
      senderAvatarUrl: sender.avatarUrl,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverUsername: receiver.username || this.generateUniqueUsername(receiver.name),
      receiverAvatarUrl: receiver.avatarUrl,
      type: 'TEXT',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    if (!this.data.chatMessages) this.data.chatMessages = [];
    this.data.chatMessages.push(msg);

    this.createNotification({
      userId: receiver.id,
      title: `New Message from ${sender.name}`,
      message: text.length > 80 ? text.substring(0, 77) + '...' : text,
      type: 'MESSAGE',
      link: `/contacts?chat=${sender.id}`,
    });

    this.save();
    return msg;
  }

  public sendFileMessage(senderId: string, receiverId: string, attachment: StoredChatAttachment, isImage: boolean): StoredChatMessage {
    const sender = this.findUserById(senderId);
    const receiver = this.findUserById(receiverId);
    if (!sender || !receiver) throw new Error('User not found.');
    if (!this.areFriends(senderId, receiverId)) {
      throw new Error('You can only send files to accepted contacts.');
    }

    const convId = this.getConversationId(senderId, receiverId);
    const msg: StoredChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 11),
      conversationId: convId,
      senderId: sender.id,
      senderName: sender.name,
      senderUsername: sender.username || this.generateUniqueUsername(sender.name),
      senderAvatarUrl: sender.avatarUrl,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverUsername: receiver.username || this.generateUniqueUsername(receiver.name),
      receiverAvatarUrl: receiver.avatarUrl,
      type: isImage ? 'IMAGE' : 'FILE',
      attachment,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    if (!this.data.chatMessages) this.data.chatMessages = [];
    this.data.chatMessages.push(msg);

    this.createNotification({
      userId: receiver.id,
      title: `New File from ${sender.name}`,
      message: `${sender.name} sent you ${isImage ? 'an image' : 'a file'}: ${attachment.originalName}`,
      type: 'MESSAGE',
      link: `/contacts?chat=${sender.id}`,
    });

    this.save();
    return msg;
  }

  public sendReceiptMessage(senderId: string, receiverId: string, receipt: StoredChatReceipt): StoredChatMessage {
    const sender = this.findUserById(senderId);
    const receiver = this.findUserById(receiverId);
    if (!sender || !receiver) throw new Error('User not found.');
    if (!this.areFriends(senderId, receiverId)) {
      throw new Error('You can only share receipts with accepted contacts.');
    }

    const convId = this.getConversationId(senderId, receiverId);
    const msg: StoredChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 11),
      conversationId: convId,
      senderId: sender.id,
      senderName: sender.name,
      senderUsername: sender.username || this.generateUniqueUsername(sender.name),
      senderAvatarUrl: sender.avatarUrl,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverUsername: receiver.username || this.generateUniqueUsername(receiver.name),
      receiverAvatarUrl: receiver.avatarUrl,
      type: 'RECEIPT',
      receipt,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    if (!this.data.chatMessages) this.data.chatMessages = [];
    this.data.chatMessages.push(msg);

    this.createNotification({
      userId: receiver.id,
      title: `Payment Receipt Shared by ${sender.name}`,
      message: `${sender.name} shared a settlement receipt for ${receipt.currency} ${receipt.amount.toLocaleString()} (${receipt.groupName}).`,
      type: 'PAYMENT',
      link: `/contacts?chat=${sender.id}`,
    });

    this.save();
    return msg;
  }

  public getAttachmentMessage(attachmentId: string): StoredChatMessage | undefined {
    return (this.data.chatMessages || []).find(m => m.attachment?.id === attachmentId);
  }

  public getUnreadMessageCount(userId: string): number {
    return (this.data.chatMessages || []).filter(m => m.receiverId === userId && !m.isRead).length;
  }

  public initDemoDataIfNeeded(force: boolean = false): void {
    if (!force && this.data.users.length > 0) {
      return;
    }

    console.log('Seeding initial demo data for SplitSmart AI...');
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('Password@123', salt);

    const rahul: StoredUser = {
      id: 'usr_rahul',
      name: 'Rahul Sharma',
      username: '@rahulsharma_101',
      email: 'rahul@example.com',
      gender: 'male',
      passwordHash: demoPasswordHash,
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const priya: StoredUser = {
      id: 'usr_priya',
      name: 'Priya Patel',
      username: '@priyapatel_204',
      email: 'priya@example.com',
      gender: 'female',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const aman: StoredUser = {
      id: 'usr_aman',
      name: 'Aman Gupta',
      username: '@amangupta_305',
      email: 'aman@example.com',
      gender: 'male',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sneha: StoredUser = {
      id: 'usr_sneha',
      name: 'Sneha Roy',
      username: '@sneharoy_402',
      email: 'sneha@example.com',
      gender: 'female',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users = [rahul, priya, aman, sneha];

    const goaTrip: StoredGroup = {
      id: 'grp_goa2026',
      name: 'Goa Trip 2026',
      description: 'Annual beach vacation and adventures with college gang',
      category: 'Travel',
      currency: 'INR',
      creatorId: rahul.id,
      budget: 35000,
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

    this.data.contacts = [
      { id: 'cnt_1', userId: rahul.id, contactUserId: priya.id, createdAt: new Date(Date.now() - 25 * 86400000).toISOString() },
      { id: 'cnt_2', userId: priya.id, contactUserId: rahul.id, createdAt: new Date(Date.now() - 25 * 86400000).toISOString() },
      { id: 'cnt_3', userId: rahul.id, contactUserId: aman.id, createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
      { id: 'cnt_4', userId: aman.id, contactUserId: rahul.id, createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
    ];

    const demoReqId = 'freq_demo_sneha';
    this.data.friendRequests = [
      {
        id: demoReqId,
        senderId: sneha.id,
        senderName: sneha.name,
        senderUsername: sneha.username!,
        senderAvatarUrl: sneha.avatarUrl,
        receiverId: rahul.id,
        receiverName: rahul.name,
        receiverUsername: rahul.username!,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      }
    ];

    this.data.notifications.push({
      id: 'notif_demo_freq',
      userId: rahul.id,
      title: 'New Friend Request 👋',
      message: `${sneha.name} (${sneha.username}) sent you a friend request.`,
      type: 'FRIEND_REQUEST',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      link: '/contacts',
      metadata: {
        friendRequestId: demoReqId,
        senderId: sneha.id,
        senderName: sneha.name,
        senderUsername: sneha.username,
      },
    });

    const rahulPriyaConv = this.getConversationId(rahul.id, priya.id);
    this.data.chatMessages = [
      {
        id: 'msg_demo_1',
        conversationId: rahulPriyaConv,
        senderId: priya.id,
        senderName: priya.name,
        senderUsername: priya.username!,
        senderAvatarUrl: priya.avatarUrl,
        receiverId: rahul.id,
        receiverName: rahul.name,
        receiverUsername: rahul.username!,
        type: 'TEXT',
        text: 'Hey Rahul! Did you receive the settlement for Beach Resort Villa Booking?',
        createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg_demo_2',
        conversationId: rahulPriyaConv,
        senderId: rahul.id,
        senderName: rahul.name,
        senderUsername: rahul.username!,
        receiverId: priya.id,
        receiverName: priya.name,
        receiverUsername: priya.username!,
        receiverAvatarUrl: priya.avatarUrl,
        type: 'TEXT',
        text: 'Yes! All confirmed on PayPal Sandbox. Here is the verified payment receipt for your records:',
        createdAt: new Date(Date.now() - 35 * 3600000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg_demo_3',
        conversationId: rahulPriyaConv,
        senderId: rahul.id,
        senderName: rahul.name,
        senderUsername: rahul.username!,
        receiverId: priya.id,
        receiverName: priya.name,
        receiverUsername: priya.username!,
        receiverAvatarUrl: priya.avatarUrl,
        type: 'RECEIPT',
        receipt: {
          paymentId: pay1.id,
          reference: pay1.reference,
          amount: pay1.amount,
          currency: pay1.currency,
          groupName: 'Goa Trip 2026',
          date: pay1.createdAt,
          status: pay1.status,
          payerName: pay1.payerName,
          recipientName: pay1.recipientName,
          receiptNumber: pay1.metadata?.receiptNumber || 'REC-2026-88492',
        },
        createdAt: new Date(Date.now() - 34 * 3600000).toISOString(),
        isRead: true,
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
