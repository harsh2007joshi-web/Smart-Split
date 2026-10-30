import { Router, Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();
router.use(authenticateToken);

// 1. NATURAL LANGUAGE EXPENSE PARSING
router.post('/expense-parse', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      res.status(400).json({ error: 'Please enter expense description.' });
      return;
    }

    const user = req.user!;
    const userGroups = db.getGroupsForUser(user.id);

    const parsedResult = await aiService.parseExpenseText(prompt, userGroups, user);

    res.json({
      parsedExpense: parsedResult,
      groups: userGroups.map(g => ({ id: g.id, name: g.name, currency: g.currency, members: g.members })),
    });
  } catch (err: any) {
    console.error('AI expense parse error:', err);
    res.status(500).json({ error: 'Failed to parse natural language expense.' });
  }
});

// 2. FINANCIAL ASSISTANT Q&A
router.post('/ask', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      res.status(400).json({ error: 'Question cannot be empty.' });
      return;
    }

    const user = req.user!;
    const userGroups = db.getGroupsForUser(user.id);

    const response = await aiService.answerFinancialQuestion(question, user, userGroups);

    res.json(response);
  } catch (err: any) {
    console.error('AI ask error:', err);
    res.status(500).json({ error: 'AI Assistant could not process your query.' });
  }
});

export default router;
