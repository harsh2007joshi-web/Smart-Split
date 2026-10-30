import { Router, Response } from 'express';
import { db, StoredGroup } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { SettlementEngine } from '../services/settlementEngine';
import { emailService } from '../services/email';

const router = Router();
router.use(authenticateToken);

// 1. GET ALL GROUPS FOR USER
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const groups = db.getGroupsForUser(userId);

    const enrichedGroups = groups.map(g => {
      const expenses = db.getExpensesForGroup(g.id);
      const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        ...g,
        totalSpent,
        recentExpensesCount: expenses.length,
      };
    });

    res.json({ groups: enrichedGroups });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve groups.' });
  }
});

// 2. CREATE A NEW GROUP
router.post('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name, description, category, currency, initialMembers } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Group name is required.' });
      return;
    }

    const group = db.createGroup({
      name: name.trim(),
      description: description?.trim() || '',
      category: category || 'General',
      currency: currency || 'INR',
      creator: req.user!,
      initialMembers: initialMembers || [],
    });

    // Notify user
    db.createNotification({
      userId: req.user!.id,
      title: 'Group Created',
      message: `You created the group "${group.name}". Invite friends to start splitting expenses.`,
      type: 'INVITATION',
      link: `/groups/${group.id}`,
    });

    res.status(201).json({
      message: 'Group created successfully!',
      group: {
        ...group,
        totalSpent: 0,
        recentExpensesCount: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creating group.' });
  }
});

// 3. GET SINGLE GROUP DETAILS WITH BALANCES AND SETTLEMENTS
router.get('/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const groupId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const group = db.getGroupById(groupId);

    if (!group) {
      res.status(404).json({ error: 'Group not found.' });
      return;
    }

    // Verify membership authorization
    const userEmail = req.user!.email.toLowerCase().trim();
    const isMember = group.members.some(m => m.userId === req.user!.id || (m.email && m.email.toLowerCase().trim() === userEmail));
    if (!isMember) {
      res.status(403).json({ error: 'You are not authorized to access this group.' });
      return;
    }
    db.syncUserWithGroups(req.user!);

    const expenses = db.getExpensesForGroup(groupId);
    const settlements = db.getSettlementsForGroup(groupId);

    // Compute balances & optimized settlements
    const balances = SettlementEngine.calculateBalances(group, expenses, settlements);
    const optimizedTransfers = SettlementEngine.optimizeTransfers(balances, group.currency);

    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const budget = group.budget || 0;
    const remainingBudget = budget > 0 ? Math.max(0, budget - totalSpent) : 0;
    const budgetUsedPercentage = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

    res.json({
      group: {
        ...group,
        totalSpent,
        budget,
        remainingBudget,
        budgetUsedPercentage,
      },
      expenses,
      settlements,
      balances,
      suggestedSettlements: optimizedTransfers.map((t, idx) => ({
        id: `sug_${groupId}_${idx}`,
        groupId,
        groupName: group.name,
        fromUserId: t.fromUserId,
        fromUserName: t.fromUserName,
        toUserId: t.toUserId,
        toUserName: t.toUserName,
        amount: t.amount,
        currency: t.currency,
        status: 'PENDING',
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve group details.' });
  }
});

// 4. ADD / INVITE MEMBER TO GROUP WITH EMAIL INVITATION
router.post('/:id/members', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Member name and email are required.' });
      return;
    }

    const group = db.getGroupById(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found.' });
      return;
    }

    const newMember = db.addMemberToGroup(groupId, { name, email });
    if (!newMember) {
      res.status(400).json({ error: 'Could not add member.' });
      return;
    }

    // Generate unique invitation token & magic join link
    const invitation = db.createGroupInvitation(groupId, group.name, req.user!.name, email);
    
    // Automatically use configured public URL (e.g. from tunnel or domain), clientBaseUrl, browser origin/referer, or fallback to localhost
    const clientOrigin = (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer).origin : '');
    const clientBaseUrl = typeof req.body.clientBaseUrl === 'string' && req.body.clientBaseUrl.trim() !== ''
      ? req.body.clientBaseUrl.trim().replace(/\/$/, '')
      : '';
    const baseUrl = (process.env.APP_URL && process.env.APP_URL.trim() !== '')
      ? process.env.APP_URL.trim().replace(/\/$/, '')
      : (clientBaseUrl || (clientOrigin ? clientOrigin.replace(/\/$/, '') : 'http://localhost:5173'));

    const joinUrl = `${baseUrl}/join-group?token=${invitation.token}&groupId=${groupId}`;

    // Send invitation email to friend's mailbox
    const emailResult = await emailService.sendGroupInvitation({
      to: email.trim(),
      memberName: name.trim(),
      inviterName: req.user!.name,
      groupName: group.name,
      joinUrl,
    });

    // If invited user already exists, also send in-app notification
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      db.createNotification({
        userId: existingUser.id,
        title: 'Trip Group Invitation',
        message: `${req.user!.name} invited you to "${group.name}". You can now log expenses and track balances from any device!`,
        type: 'INVITATION',
        link: `/groups/${group.id}`,
      });
    }

    res.status(201).json({
      message: emailResult.delivered
        ? `Invitation successfully sent to ${name} (${email}) with magic join link!`
        : `Member added! ${emailResult.message}`,
      member: newMember,
      invitationToken: invitation.token,
      joinUrl,
      emailDispatch: emailResult,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add and invite member.' });
  }
});

// 5. ACCEPT GROUP INVITATION (Allows friend to join from any device)
router.post('/join', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: 'Invitation token is required.' });
      return;
    }

    const result = db.acceptGroupInvitation(token, req.user!);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json({
      success: true,
      message: result.message,
      group: result.group,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join group.' });
  }
});

// 6. DELETE TRIP / GROUP (Option after payments are done)
router.delete('/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const groupId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const result = db.deleteGroup(groupId, req.user!.id);

    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete trip group.' });
  }
});

// 7. SET OR UPDATE GROUP BUDGET
router.put('/:id/budget', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const groupId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { budget } = req.body;
    const numBudget = parseFloat(budget);

    if (isNaN(numBudget) || numBudget < 0) {
      res.status(400).json({ error: 'Valid positive budget number is required.' });
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
      res.status(403).json({ error: 'Unauthorized to update this group.' });
      return;
    }

    const updated = db.updateGroup(groupId, { budget: numBudget });
    res.json({ message: 'Budget updated successfully.', group: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update group budget.' });
  }
});

export default router;
