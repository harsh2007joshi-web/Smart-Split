import { Router, Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();
router.use(authenticateToken);

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

router.post('/ask', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { question, history } = req.body;

    if (!question || !question.trim()) {
      res.status(400).json({ error: 'Question cannot be empty.' });
      return;
    }

    const user = req.user!;
    const userGroups = db.getGroupsForUser(user.id);

    const response = await aiService.answerFinancialQuestion(question, user, userGroups, history);

    res.json(response);
  } catch (err: any) {
    console.error('AI ask error:', err);
    res.status(500).json({ error: 'AI Assistant could not process your query.' });
  }
});

router.post('/scan-receipt', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Receipt image data is required.' });
      return;
    }

    const result = await aiService.scanReceipt(imageBase64, mimeType || 'image/jpeg');
    res.json(result);
  } catch (err: any) {
    console.error('Receipt scan error:', err);
    res.status(500).json({ error: 'Failed to process receipt image.' });
  }
});

router.get('/status', (req: AuthenticatedRequest, res: Response): void => {
  res.json(aiService.getStatus());
});

router.post('/configure-key', (req: AuthenticatedRequest, res: Response): void => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    res.status(400).json({ error: 'Please provide a valid Google Gemini API key.' });
    return;
  }
  aiService.setGeminiApiKey(apiKey.trim());
  res.json({ success: true, status: aiService.getStatus() });
});

export default router;
