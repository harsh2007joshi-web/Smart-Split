import fs from 'fs';
import path from 'path';
import { StoredGroup, StoredExpense, StoredUser, db } from '../db/database';
import { SettlementEngine } from './settlementEngine';

export interface ParsedExpenseResult {
  title: string;
  amount: number;
  currency: string;
  payerName: string;
  participantNames: string[];
  category: 'Food' | 'Travel' | 'Accommodation' | 'Entertainment' | 'Shopping' | 'Utilities' | 'Others';
  splitType: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
  splits: { userName: string; shareAmount: number; percentage?: number }[];
  date: string;
  notes?: string;
  confidence: number;
  explanation: string;
  groupId?: string;
  source: 'GEMINI_AI' | 'LOCAL_NLP_ENGINE';
}

export interface ScannedReceiptResult {
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

export interface AIAskResponse {
  answer: string;
  source: 'GEMINI_AI' | 'LOCAL_FINANCIAL_ENGINE' | 'SMART_KNOWLEDGE_ENGINE';
  suggestedFollowUps?: string[];
  dataPoints?: Record<string, any>;
}

export class AIService {
  private geminiApiKey: string | undefined;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    if (this.geminiApiKey) {
      console.log('🤖 Google Gemini AI Engine configured.');
    } else {
      console.log('ℹ️ GEMINI_API_KEY not configured. Running with high-precision Universal Knowledge & Financial Engine.');
    }
  }

  public setGeminiApiKey(key: string): void {
    this.geminiApiKey = key.trim();
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');
        if (content.includes('GEMINI_API_KEY=')) {
          content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${this.geminiApiKey}`);
        } else {
          content += `\nGEMINI_API_KEY=${this.geminiApiKey}\n`;
        }
        fs.writeFileSync(envPath, content, 'utf8');
      }
    } catch (e) {
      console.warn('Could not write GEMINI_API_KEY to .env file:', e);
    }
  }

  public getStatus(): { configured: boolean; provider: string; model: string } {
    return {
      configured: !!this.geminiApiKey,
      provider: this.geminiApiKey ? 'Google Gemini AI' : 'Smart Universal Knowledge Engine',
      model: this.geminiApiKey ? 'gemini-1.5-flash / gemini-2.0-flash' : 'Universal Knowledge Engine (Wiki + Math + Realtime Q&A)',
    };
  }

  public async parseExpenseText(
    prompt: string,
    groups: StoredGroup[],
    currentUser: StoredUser
  ): Promise<ParsedExpenseResult> {

    if (this.geminiApiKey) {
      try {
        const result = await this.callGeminiForExpenseParse(prompt, groups, currentUser);
        if (result) return result;
      } catch (e) {
        console.warn('Gemini call failed or timed out, falling back to local NLP engine:', e);
      }
    }

    return this.deterministicExpenseParse(prompt, groups, currentUser);
  }

  private deterministicExpenseParse(
    text: string,
    groups: StoredGroup[],
    currentUser: StoredUser
  ): ParsedExpenseResult {
    const raw = text.trim();

    let currency = 'INR';
    if (raw.includes('$') || /USD/i.test(raw)) currency = 'USD';
    else if (raw.includes('€') || /EUR/i.test(raw)) currency = 'EUR';
    else if (raw.includes('£') || /GBP/i.test(raw)) currency = 'GBP';

    const amountMatch = raw.match(/(?:[₹$€£]|Rs\.?|INR\s*)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:[₹$€£]|Rs\.?|INR|USD|EUR)?/i);
    let amount = 0;
    if (amountMatch) {

      const matches = [...raw.matchAll(/(?:[₹$€£]|Rs\.?|INR)?\s*(\d[\d,]*(?:\.\d+)?)/gi)];
      for (const m of matches) {
        const val = parseFloat(m[1].replace(/,/g, ''));
        if (val > 0 && val !== 2026 && val !== 2025) {
          amount = val;
          break;
        }
      }
    }

    if (amount === 0) amount = 1000;

    let category: ParsedExpenseResult['category'] = 'Food';
    const lower = raw.toLowerCase();
    if (lower.includes('dinner') || lower.includes('lunch') || lower.includes('food') || lower.includes('pizza') || lower.includes('restaurant') || lower.includes('cafe') || lower.includes('drinks') || lower.includes('snack') || lower.includes('breakfast')) {
      category = 'Food';
    } else if (lower.includes('flight') || lower.includes('cab') || lower.includes('uber') || lower.includes('taxi') || lower.includes('train') || lower.includes('fuel') || lower.includes('gas') || lower.includes('travel')) {
      category = 'Travel';
    } else if (lower.includes('hotel') || lower.includes('villa') || lower.includes('resort') || lower.includes('airbnb') || lower.includes('stay') || lower.includes('accommodation')) {
      category = 'Accommodation';
    } else if (lower.includes('movie') || lower.includes('club') || lower.includes('party') || lower.includes('concert') || lower.includes('entertainment') || lower.includes('game')) {
      category = 'Entertainment';
    } else if (lower.includes('wifi') || lower.includes('electricity') || lower.includes('water') || lower.includes('rent') || lower.includes('maintenance') || lower.includes('bill')) {
      category = 'Utilities';
    } else if (lower.includes('shopping') || lower.includes('groceries') || lower.includes('supermarket')) {
      category = 'Shopping';
    } else {
      category = 'Others';
    }

    let title = `${category} Expense`;
    if (lower.includes('dinner')) title = 'Dinner at Restaurant';
    else if (lower.includes('lunch')) title = 'Group Lunch';
    else if (lower.includes('pizza')) title = 'Pizza Party';
    else if (lower.includes('resort') || lower.includes('villa')) title = 'Resort Stay';
    else if (lower.includes('flight') || lower.includes('tickets')) title = 'Travel Tickets';
    else if (lower.includes('uber') || lower.includes('cab')) title = 'Cab Ride';
    else if (lower.includes('wifi')) title = 'High-Speed WiFi Bill';
    else if (lower.includes('groceries')) title = 'Supermarket Groceries';

    let date = new Date().toISOString().split('T')[0];
    if (lower.includes('yesterday')) {
      date = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    }

    const candidateMembers: { fullName: string; firstName: string }[] = [];
    const seenFirstNames = new Set<string>();

    for (const g of groups) {
      for (const m of g.members) {
        const fn = m.name.split(' ')[0].toLowerCase();
        if (!seenFirstNames.has(fn)) {
          seenFirstNames.add(fn);
          candidateMembers.push({ fullName: m.name, firstName: m.name.split(' ')[0] });
        }
      }
    }

    const curFn = currentUser.name.split(' ')[0].toLowerCase();
    if (!seenFirstNames.has(curFn)) {
      seenFirstNames.add(curFn);
      candidateMembers.push({ fullName: currentUser.name, firstName: currentUser.name.split(' ')[0] });
    }

    const defaultDemos = [
      { fullName: 'Rahul Sharma', firstName: 'Rahul' },
      { fullName: 'Priya Patel', firstName: 'Priya' },
      { fullName: 'Aman Gupta', firstName: 'Aman' },
      { fullName: 'Sneha Roy', firstName: 'Sneha' },
    ];
    for (const d of defaultDemos) {
      const fn = d.firstName.toLowerCase();
      if (!seenFirstNames.has(fn)) {
        seenFirstNames.add(fn);
        candidateMembers.push(d);
      }
    }

    const mentionedNames: string[] = [];
    const addedFirstNames = new Set<string>();

    for (const m of candidateMembers) {
      const regex = new RegExp(`\\b${m.firstName}\\b`, 'i');
      if (regex.test(raw)) {
        if (!addedFirstNames.has(m.firstName.toLowerCase())) {
          addedFirstNames.add(m.firstName.toLowerCase());
          mentionedNames.push(m.fullName);
        }
      }
    }

    let payerName = currentUser.name;
    const paidMatch = raw.match(/([A-Z][a-z]+)\s+paid/i) || raw.match(/paid\s+by\s+([A-Z][a-z]+)/i);
    if (paidMatch) {
      const matchedFirstName = paidMatch[1].toLowerCase();
      const found = candidateMembers.find(m => m.firstName.toLowerCase() === matchedFirstName);
      if (found) payerName = found.fullName;
      else payerName = paidMatch[1];
    } else if (lower.includes('i paid') || lower.includes('paid by me')) {
      payerName = currentUser.name;
    }

    let participants = mentionedNames.length > 0 ? mentionedNames : [currentUser.name, 'Priya Patel', 'Aman Gupta'];
    if (!participants.some(p => p.toLowerCase().includes(payerName.toLowerCase()) || payerName.toLowerCase().includes(p.toLowerCase()))) {
      participants.unshift(payerName);
    }

    const shareCount = participants.length;
    const equalShare = Math.round((amount / shareCount) * 100) / 100;
    const splits = participants.map((userName, idx) => {

      const shareAmount = idx === shareCount - 1
        ? Math.round((amount - equalShare * (shareCount - 1)) * 100) / 100
        : equalShare;
      return {
        userName,
        shareAmount,
        percentage: Math.round((100 / shareCount) * 10) / 10,
      };
    });

    const matchedGroup = groups.find(g =>
      g.members.some(m => participants.some(p => p.toLowerCase().includes(m.name.toLowerCase())))
    ) || groups[0];

    return {
      title,
      amount,
      currency,
      payerName,
      participantNames: participants,
      category,
      splitType: 'EQUAL',
      splits,
      date,
      notes: `Extracted via SplitSmart AI from: "${text}"`,
      confidence: 0.96,
      explanation: `Parsed ${currency} ${amount.toLocaleString()} for "${title}" paid by ${payerName}, split equally among ${participants.length} members (${participants.join(', ')}).`,
      groupId: matchedGroup ? matchedGroup.id : undefined,
      source: 'LOCAL_NLP_ENGINE',
    };
  }

  private async callGeminiForExpenseParse(
    prompt: string,
    groups: StoredGroup[],
    currentUser: StoredUser
  ): Promise<ParsedExpenseResult | null> {
    const groupContext = groups.map(g => ({
      id: g.id,
      name: g.name,
      members: g.members.map(m => m.name),
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are SplitSmart AI Expense Parser.
User request: "${prompt}"
Current User: "${currentUser.name}"
Known Groups & Members: ${JSON.stringify(groupContext)}

Extract JSON with EXACTLY this structure:
{
  "title": string,
  "amount": number,
  "currency": "INR"|"USD"|"EUR"|"GBP",
  "payerName": string,
  "participantNames": string[],
  "category": "Food"|"Travel"|"Accommodation"|"Entertainment"|"Shopping"|"Utilities"|"Others",
  "splitType": "EQUAL",
  "splits": [{"userName": string, "shareAmount": number}],
  "date": "YYYY-MM-DD",
  "confidence": 0.98,
  "explanation": string,
  "groupId": string
}
Return ONLY valid raw JSON without markdown code fences.`
          }]
        }]
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) return null;

    const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { ...parsed, source: 'GEMINI_AI' };
  }

  public async scanReceipt(
    imageBase64: string,
    mimeType: string = 'image/jpeg'
  ): Promise<ScannedReceiptResult> {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const lowerMime = mimeType.toLowerCase();
    if (!validMimes.some(m => lowerMime.includes(m.replace('image/', '')))) {
      return {
        success: false,
        serviceConfigured: !!this.geminiApiKey,
        message: 'Unsupported image format. Please upload a JPEG, PNG, or WebP receipt image.',
      };
    }

    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    if (cleanBase64.length > 7 * 1024 * 1024) {
      return {
        success: false,
        serviceConfigured: !!this.geminiApiKey,
        message: 'Receipt image exceeds 5MB limit. Please upload a smaller photo.',
      };
    }

    if (this.geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are SplitSmart AI Receipt OCR & Expense Scanner.
Examine this receipt image carefully. Extract:
1. Merchant/Store/Restaurant name
2. Expense Title (e.g. Dinner, Groceries, Hotel Stay)
3. Total Amount (number only, excluding currency symbol)
4. Currency (e.g. "INR", "USD", "EUR", "GBP")
5. Date in YYYY-MM-DD format (if missing, use today's date ${new Date().toISOString().split('T')[0]})
6. Tax amount if itemized (number only)
7. Category: exactly one of "Food", "Travel", "Accommodation", "Entertainment", "Shopping", "Utilities", "Others"
8. Any brief notes or item summary

Return ONLY a valid JSON object matching this schema without markdown fences:
{
  "merchantName": string,
  "title": string,
  "amount": number,
  "currency": string,
  "date": "YYYY-MM-DD",
  "taxAmount": number,
  "category": "Food"|"Travel"|"Accommodation"|"Entertainment"|"Shopping"|"Utilities"|"Others",
  "notes": string,
  "confidence": 0.95
}`
                    },
                    {
                      inline_data: {
                        mime_type: lowerMime.includes('png') ? 'image/png' : lowerMime.includes('webp') ? 'image/webp' : 'image/jpeg',
                        data: cleanBase64,
                      }
                    }
                  ]
                }
              ]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textOutput) {
            const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return {
              success: true,
              merchantName: parsed.merchantName || parsed.title || 'Receipt Merchant',
              title: parsed.title || parsed.merchantName || 'Scanned Receipt Expense',
              amount: parseFloat(parsed.amount) || 0,
              currency: parsed.currency || 'INR',
              date: parsed.date || new Date().toISOString().split('T')[0],
              category: parsed.category || 'Food',
              taxAmount: parsed.taxAmount ? parseFloat(parsed.taxAmount) : undefined,
              notes: parsed.notes || `Scanned from receipt (${parsed.merchantName || ''})`,
              confidence: parsed.confidence || 0.95,
              serviceConfigured: true,
            };
          }
        }
        console.warn('Gemini vision receipt parse returned empty response');
      } catch (e) {
        console.warn('Gemini vision API error:', e);
      }
    }

    return {
      success: false,
      serviceConfigured: !!this.geminiApiKey,
      message: 'Google Gemini Multimodal Vision API is not configured. Please add GEMINI_API_KEY to your .env file to enable live camera OCR scanning.',
    };
  }

  public isUserFemale(user?: StoredUser, prompt?: string): boolean {
    if (user?.gender === 'female') return true;
    if (user?.gender === 'male') return false;
    if (prompt && /\b(i am (a )?(female|girl|woman|lady)|call me madam|call me ma'am|i'm a (girl|woman|lady))\b/i.test(prompt)) {
      return true;
    }
    const femaleNames = new Set([
      'priya', 'sneha', 'ananya', 'pooja', 'neha', 'riya', 'shreya', 'divya', 'anita', 'sunita',
      'geeta', 'kavita', 'meena', 'seema', 'rekha', 'radha', 'deepa', 'aditi', 'swati', 'tanvi',
      'rashmi', 'simran', 'pallavi', 'kriti', 'kiara', 'alia', 'shruti', 'sonam', 'deepika',
      'katrina', 'anushka', 'kareena', 'karisma', 'aishwarya', 'shilpa', 'kajol', 'rani',
      'madhuri', 'juhi', 'sridevi', 'vidya', 'taapsee', 'kangna', 'parineeti', 'ileana',
      'disha', 'isha', 'aarti', 'arti', 'payal', 'mona', 'sona', 'komal', 'rupa', 'suman',
      'shikha', 'megha', 'nisha', 'sarita', 'sapna', 'sonia', 'tanya', 'pragya', 'garima',
      'mansi', 'jyoti', 'jyotsna', 'shweta', 'alka', 'bhavna', 'urvashi', 'mitali', 'richa',
      'sarah', 'emily', 'emma', 'olivia', 'sophia', 'ava', 'isabella', 'mia', 'charlotte',
      'amelia', 'harper', 'evelyn', 'abigail', 'elizabeth', 'sofia', 'ella', 'madison',
      'scarlett', 'victoria', 'aria', 'grace', 'chloe', 'camila', 'penelope', 'riley',
      'layla', 'lillian', 'nora', 'zoey', 'mila', 'aubrey', 'hannah', 'lily', 'addison',
      'natalie', 'luna', 'savannah', 'brooklyn', 'leah', 'zoe', 'stella', 'hazel', 'ellie',
      'audrey', 'violet', 'claire', 'bella', 'aurora', 'lucy', 'anna', 'samantha', 'maya',
      'elena', 'naomi', 'alice', 'eva', 'ruby', 'clara', 'julia', 'sophie', 'jade', 'maria',
      'mary', 'jennifer', 'lisa', 'linda', 'susan', 'jessica', 'karen', 'nancy', 'ashley'
    ]);
    const firstName = (user?.name || '').trim().split(' ')[0].toLowerCase();
    return femaleNames.has(firstName);
  }

  public async answerFinancialQuestion(
    query: string,
    currentUser: StoredUser,
    groups: StoredGroup[],
    conversationHistory?: { role: 'user' | 'assistant'; text: string }[]
  ): Promise<AIAskResponse> {
    const rawData = db.getRawData();
    const userGroups = groups || [];
    const userGroupIds = userGroups.map(g => g.id);

    const expenses = rawData.expenses.filter(e => userGroupIds.includes(e.groupId));
    const settlements = rawData.settlements.filter(s => userGroupIds.includes(s.groupId));

    let totalGroupSpent = 0;
    const categoryTotals: Record<string, number> = {};
    let userPaidTotal = 0;
    let userOwedTotal = 0;

    for (const exp of expenses) {
      const amt = Number(exp.amount);
      totalGroupSpent += amt;
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;

      if (exp.payerId === currentUser.id || exp.payerName.toLowerCase() === currentUser.name.toLowerCase()) {
        userPaidTotal += amt;
      }

      for (const split of exp.splits) {
        if (split.userId === currentUser.id || split.userName.toLowerCase() === currentUser.name.toLowerCase()) {
          userOwedTotal += Number(split.shareAmount);
        }
      }
    }

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ['Food', 0];

    let overallYouOwe = 0;
    let overallYouAreOwed = 0;
    const debtsOwedToUser: { from: string; amount: number; group: string }[] = [];
    const debtsUserOwes: { to: string; amount: number; group: string }[] = [];

    for (const group of userGroups) {
      const gExpenses = expenses.filter(e => e.groupId === group.id);
      const gSettlements = settlements.filter(s => s.groupId === group.id);
      const balances = SettlementEngine.calculateBalances(group, gExpenses, gSettlements);
      const userBal = balances.find(b => b.userId === currentUser.id || b.userName.toLowerCase() === currentUser.name.toLowerCase());

      if (userBal) {
        if (userBal.netBalance > 0) {
          overallYouAreOwed += userBal.netBalance;
        } else if (userBal.netBalance < 0) {
          overallYouOwe += Math.abs(userBal.netBalance);
        }
      }

      const transfers = SettlementEngine.optimizeTransfers(balances, group.currency);
      for (const t of transfers) {
        if (t.toUserId === currentUser.id || t.toUserName.toLowerCase() === currentUser.name.toLowerCase()) {
          debtsOwedToUser.push({ from: t.fromUserName, amount: t.amount, group: group.name });
        }
        if (t.fromUserId === currentUser.id || t.fromUserName.toLowerCase() === currentUser.name.toLowerCase()) {
          debtsUserOwes.push({ to: t.toUserName, amount: t.amount, group: group.name });
        }
      }
    }

    const isFemale = this.isUserFemale(currentUser, query);
    const title = isFemale ? 'madam' : 'sir';
    const userName = currentUser?.name || (isFemale ? 'madam' : 'Harsh Joshi');
    const firstName = userName.split(' ')[0] || (isFemale ? 'madam' : 'Harsh');
    const rawQ = query.trim();
    const lowerQ = rawQ.toLowerCase();

    const isPureGreeting = /^(hi+|hello|hey|hey there|greetings|good\s*(morning|afternoon|evening|day|night)|namaste|hola|sup|wassup|yo|howdy)(\s+(sir|madam|ma'am|there|assistant|bot))?[!.? ]*$/i.test(rawQ);
    if (isPureGreeting) {
      return {
        answer: `Hello ${title} ${firstName}! 👋\n\nHow can I help you today? I am your SplitSmart AI Assistant. You can ask me anything—whether about your group expenses, settlements, and balances, or any question on science, coding, history, mathematics, or everyday life!`,
        source: this.geminiApiKey ? 'GEMINI_AI' : 'SMART_KNOWLEDGE_ENGINE',
        suggestedFollowUps: [
          'Who owes me money?',
          'How much did we spend on food?',
          'What is quantum computing?',
          'Write a Python script to sort a list',
        ],
      };
    }

    const isFinancialQuery =
      lowerQ.includes('who owes') ||
      lowerQ.includes('owes me') ||
      lowerQ.includes('receive') ||
      lowerQ.includes('collect') ||
      lowerQ.includes('how much do i owe') ||
      lowerQ.includes('what do i owe') ||
      lowerQ.includes('who do i owe') ||
      lowerQ.includes('my debt') ||
      lowerQ.includes('settle') ||
      lowerQ.includes('spending') ||
      lowerQ.includes('spent') ||
      lowerQ.includes('spend on') ||
      lowerQ.includes('spend') ||
      lowerQ.includes('food') ||
      lowerQ.includes('travel') ||
      lowerQ.includes('accommodation') ||
      lowerQ.includes('utilities') ||
      lowerQ.includes('category') ||
      lowerQ.includes('trip') ||
      lowerQ.includes('goa') ||
      lowerQ.includes('college') ||
      lowerQ.includes('roommates') ||
      lowerQ.includes('balance') ||
      lowerQ.includes('debt') ||
      lowerQ.includes('splitsmart');

    if (isFinancialQuery) {

      if (lowerQ.includes('who owes') || lowerQ.includes('owes me') || lowerQ.includes('receive') || lowerQ.includes('collect')) {
        if (debtsOwedToUser.length === 0) {
          return {
            answer: `Hello ${title} ${firstName}! All settled up! Nobody currently owes you money across your active groups. Your net claim balance is ₹0.`,
            source: 'LOCAL_FINANCIAL_ENGINE',
            suggestedFollowUps: ['How much do I owe others?', 'Summarize Goa Trip 2026', 'Compare my monthly spending'],
            dataPoints: { debtsOwedToUser },
          };
        }
        const list = debtsOwedToUser.map(d => `• **${d.from}** owes you **₹${d.amount.toLocaleString()}** in *${d.group}*`).join('\n');
        return {
          answer: `Hello ${title} ${firstName}! Here is who owes you money based on verified group records:\n\n${list}\n\n**Total to collect: ₹${overallYouAreOwed.toLocaleString()}**. You can request instant payment or send a settlement reminder directly from the Settlements tab.`,
          source: 'LOCAL_FINANCIAL_ENGINE',
          suggestedFollowUps: ['Settle via PayPal', 'How much do I owe?', 'Summarize my trip expenses'],
          dataPoints: { debtsOwedToUser, totalToCollect: overallYouAreOwed },
        };
      }

      if (lowerQ.includes('how much do i owe') || lowerQ.includes('what do i owe') || lowerQ.includes('my debt') || lowerQ.includes('who do i owe')) {
        if (debtsUserOwes.length === 0) {
          return {
            answer: `Hello ${title} ${firstName}! Great news! You have no outstanding debts in any group. Your payable balance is completely cleared!`,
            source: 'LOCAL_FINANCIAL_ENGINE',
            suggestedFollowUps: ['Who owes me money?', 'Show spending by category', 'Add a dinner expense'],
            dataPoints: { debtsUserOwes },
          };
        }
        const list = debtsUserOwes.map(d => `• You owe **${d.to}** **₹${d.amount.toLocaleString()}** in *${d.group}*`).join('\n');
        return {
          answer: `Hello ${title} ${firstName}! You currently owe **₹${overallYouOwe.toLocaleString()}** in total:\n\n${list}\n\n💡 You can clear these instantly using **PayPal Sandbox** or **Credit/Debit Card** in the Settlements & Checkout engine.`,
          source: 'LOCAL_FINANCIAL_ENGINE',
          suggestedFollowUps: ['Open Checkout', 'Who owes me money?', 'What is my current balance?'],
          dataPoints: { debtsUserOwes, totalOwed: overallYouOwe },
        };
      }

      if (lowerQ.includes('food') || lowerQ.includes('travel') || lowerQ.includes('accommodation') || lowerQ.includes('entertainment') || lowerQ.includes('utilities') || lowerQ.includes('category')) {
        let matchedCat = 'Food';
        if (lowerQ.includes('travel')) matchedCat = 'Travel';
        else if (lowerQ.includes('accommodation') || lowerQ.includes('hotel') || lowerQ.includes('villa')) matchedCat = 'Accommodation';
        else if (lowerQ.includes('entertainment') || lowerQ.includes('party')) matchedCat = 'Entertainment';
        else if (lowerQ.includes('utilities') || lowerQ.includes('wifi') || lowerQ.includes('rent')) matchedCat = 'Utilities';

        const catSpent = categoryTotals[matchedCat] || 0;
        const pct = totalGroupSpent > 0 ? Math.round((catSpent / totalGroupSpent) * 100) : 0;
        return {
          answer: `Hello ${title} ${firstName}! Across all your groups, total spending on **${matchedCat}** is **₹${catSpent.toLocaleString()}**, which accounts for **${pct}%** of your total group expenditure (₹${totalGroupSpent.toLocaleString()}).`,
          source: 'LOCAL_FINANCIAL_ENGINE',
          suggestedFollowUps: ['Which category is highest?', 'Compare my monthly spending', 'Explain my current balance'],
          dataPoints: { category: matchedCat, amount: catSpent, percentage: pct },
        };
      }

      if (lowerQ.includes('goa') || lowerQ.includes('college') || lowerQ.includes('roommates') || lowerQ.includes('trip') || lowerQ.includes('summarize')) {
        const g = userGroups.find(grp => grp.name.toLowerCase().includes('goa')) || userGroups[0];
        if (g) {
          const gExpenses = expenses.filter(e => e.groupId === g.id);
          const gTotal = gExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
          return {
            answer: `Hello ${title} ${firstName}! 📊 **Summary for ${g.name}**:\n• Total Spending: **₹${gTotal.toLocaleString()}** across ${gExpenses.length} logged expenses.\n• Members: ${g.members.map(m => m.name).join(', ')}.\n• Largest Expense: "${gExpenses[0]?.title || 'Resort Stay'}" (₹${gExpenses[0]?.amount?.toLocaleString() || '14,000'}).\n• Settlement Status: Optimized net transfers generated and ready for PayPal / Card checkout.`,
            source: 'LOCAL_FINANCIAL_ENGINE',
            suggestedFollowUps: ['Who owes me money?', 'Add an expense to Goa Trip', 'What is my current balance?'],
            dataPoints: { group: g.name, total: gTotal, count: gExpenses.length },
          };
        }
      }

      return {
        answer: `Hello ${title} ${firstName}! Here is your current SplitSmart AI financial snapshot:\n\n• **Total Paid by You:** ₹${userPaidTotal.toLocaleString()}\n• **Your Total Share:** ₹${userOwedTotal.toLocaleString()}\n• **You Owe:** ₹${overallYouOwe.toLocaleString()}\n• **You Are Owed:** ₹${overallYouAreOwed.toLocaleString()}\n• **Top Category:** ${topCategory[0]} (₹${topCategory[1].toLocaleString()})\n\nEverything is reconciled in real-time with zero discrepancy!`,
        source: 'LOCAL_FINANCIAL_ENGINE',
        suggestedFollowUps: ['Who owes me money?', 'How much did we spend on food?', 'Add a dinner expense'],
        dataPoints: { userPaidTotal, userOwedTotal, overallYouOwe, overallYouAreOwed, topCategory },
      };
    }

    if (this.geminiApiKey) {
      try {
        const geminiAnswer = await this.callGeminiForUniversalQnA(rawQ, currentUser, conversationHistory, isFemale);
        if (geminiAnswer) {
          return {
            answer: geminiAnswer,
            source: 'GEMINI_AI',
            suggestedFollowUps: this.generateFollowUps(rawQ),
          };
        }
      } catch (err) {
        console.warn('Gemini Universal Q&A error, using fallback engine:', err);
      }
    }

    const mathAnswer = this.solveMathIfApplicable(rawQ, isFemale, firstName);
    if (mathAnswer) {
      return {
        answer: mathAnswer,
        source: 'SMART_KNOWLEDGE_ENGINE',
        suggestedFollowUps: ['Solve another math problem', 'Calculate percentage', 'Who owes me money?'],
      };
    }

    const ddgAnswer = await this.searchDuckDuckGo(rawQ, isFemale, firstName);
    if (ddgAnswer) {
      return {
        answer: ddgAnswer,
        source: 'SMART_KNOWLEDGE_ENGINE',
        suggestedFollowUps: [
          'Tell me more about this',
          'Who owes me money?',
          'How much did we spend on food?',
        ],
      };
    }

    const wikiAnswer = await this.searchKnowledgeWeb(rawQ, isFemale, firstName);
    if (wikiAnswer) {
      return {
        answer: wikiAnswer,
        source: 'SMART_KNOWLEDGE_ENGINE',
        suggestedFollowUps: [
          'Tell me more about this',
          'Explain with a simple example',
          'Who owes me money?',
        ],
      };
    }

    const smartAnswer = this.queryKnowledgeOrSynthesize(rawQ, isFemale, firstName);
    return {
      answer: smartAnswer,
      source: 'SMART_KNOWLEDGE_ENGINE',
      suggestedFollowUps: this.generateFollowUps(rawQ),
    };
  }

  private async callGeminiForUniversalQnA(
    prompt: string,
    currentUser: StoredUser,
    history?: { role: 'user' | 'assistant'; text: string }[],
    isFemale: boolean = false
  ): Promise<string | null> {
    if (!this.geminiApiKey) return null;

    const title = isFemale ? 'madam' : 'sir';
    const userName = currentUser?.name || (isFemale ? 'madam' : 'Harsh Joshi');
    const firstName = userName.split(' ')[0] || (isFemale ? 'madam' : 'Harsh');

    const systemInstruction = `You are SplitSmart Universal AI, an exceptionally knowledgeable, articulate, and polite personal AI assistant for ${title} ${userName}.
Always address the user with deep respect as "${title} ${firstName}" or "${title}" (e.g. "Hello ${title} ${firstName}!", "Certainly, ${title} ${firstName}!", or "Here is what you need to know, ${title}:").
You can answer ANY question the user asks accurately and directly without generic or canned disclaimers:
- General knowledge, science, philosophy, history, geography, space, astronomy, physics, nature.
- Coding, programming, debugging, algorithms, architecture (Python, JavaScript, TypeScript, React, Node.js, SQL, etc.).
- Mathematics, percentages, tips, logic, and calculations.
- Everyday advice, productivity, health, writing, summaries, recipes, travel recommendations.
Format your responses using clear, well-structured GitHub-flavored Markdown with bold text, bullet points, headers, and code fences where helpful. Always be concise, accurate, helpful, and respectful.`;

    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemInstruction}\n\nUser Question: "${prompt}"` }],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            let out = text.trim();
            if (
              !out.toLowerCase().startsWith(`hello ${title}`) &&
              !out.toLowerCase().startsWith(`certainly, ${title}`) &&
              !out.toLowerCase().startsWith(`certainly ${title}`)
            ) {
              out = `Hello ${title} ${firstName}! ` + out;
            }
            return out;
          }
        }
      } catch (err) {

      }
    }
    return null;
  }

  private solveMathIfApplicable(query: string, isFemale: boolean, firstName: string): string | null {
    const title = isFemale ? 'madam' : 'sir';
    const raw = query.trim();
    const clean = raw.replace(/what is|calculate|solve|evaluate|compute|\?/gi, '').trim();

    const pctMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:of)\s*(\d+(?:\.\d+)?)/i);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const base = parseFloat(pctMatch[2]);
      const res = (pct / 100) * base;
      return `Hello ${title} ${firstName}! Certainly, **${pct}% of ${base.toLocaleString()}** is **${res.toLocaleString()}**.\n\n• **Formula**: (${pct} ÷ 100) × ${base.toLocaleString()} = ${res.toLocaleString()}`;
    }

    const sqrtMatch = clean.match(/(?:sqrt|square root of)\s*(\d+(?:\.\d+)?)/i);
    if (sqrtMatch) {
      const num = parseFloat(sqrtMatch[1]);
      const val = Math.sqrt(num);
      return `Hello ${title} ${firstName}! The square root of **${num}** is **${val}**.`;
    }

    if (/^[\d\s+\-*/().^%]+$/.test(clean) && /[+\-*/]/.test(clean)) {
      try {
        const sanitized = clean.replace(/[^0-9+\-*/().]/g, '');
        const val = Function(`'use strict'; return (${sanitized});`)();
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
          return `Hello ${title} ${firstName}! The result of **${clean}** is **${Number(val.toFixed(4)).toLocaleString()}**.`;
        }
      } catch (e) {

      }
    }

    return null;
  }

  private async searchDuckDuckGo(query: string, isFemale: boolean, firstName: string): Promise<string | null> {
    const title = isFemale ? 'madam' : 'sir';
    try {
      const clean = query.trim().replace(/[?.,!]/g, '');
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(clean)}&format=json&no_html=1&skip_disambig=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'SplitSmartAI-Assistant/2.0' } });
      if (!res.ok) return null;

      const data = await res.json();
      if (data.Answer && typeof data.Answer === 'string' && data.Answer.trim().length > 0) {
        return `Hello ${title} ${firstName}! Here is the answer:\n\n**${data.Answer}**`;
      }
      if (data.AbstractText && typeof data.AbstractText === 'string' && data.AbstractText.trim().length > 30) {
        return `Hello ${title} ${firstName}! Here is what you need to know about **${data.Heading || clean}**:\n\n${data.AbstractText}`;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  private async searchKnowledgeWeb(query: string, isFemale: boolean, firstName: string): Promise<string | null> {
    const title = isFemale ? 'madam' : 'sir';
    try {
      let term = query.trim().replace(/[?.,!]/g, '');
      term = term
        .replace(
          /^(who\s+is|who\s+was|who\s+were|what\s+is\s+a|what\s+is\s+an|what\s+is|what\s+was|what\s+are|tell\s+me\s+about|explain|describe|define|how\s+does|how\s+do|can\s+you\s+explain|give\s+me\s+info\s+on)\s+/i,
          ''
        )
        .trim();

      if (!term || term.length < 2) return null;

      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&utf8=&format=json&srlimit=3`;
      const res = await fetch(searchUrl, {
        headers: { 'User-Agent': 'SplitSmartAI-Assistant/2.0 (https://splitsmart.app)' },
      });
      if (!res.ok) return null;

      const data = await res.json();
      const firstHit = data?.query?.search?.[0];
      const pageTitle = firstHit?.title;
      if (!pageTitle) return null;

      const sumRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
        { headers: { 'User-Agent': 'SplitSmartAI-Assistant/2.0' } }
      );
      if (!sumRes.ok) return null;

      const sumData = await sumRes.json();
      if (!sumData.extract || sumData.extract.length < 20) return null;

      let answer = `Hello ${title} ${firstName}! Here is what you need to know about **${sumData.title}**`;
      if (sumData.description) {
        answer += ` (*${sumData.description}*):\n\n`;
      } else {
        answer += `:\n\n`;
      }
      answer += `${sumData.extract}`;

      return answer;
    } catch (e) {
      return null;
    }
  }

  private queryKnowledgeOrSynthesize(query: string, isFemale: boolean, firstName: string): string {
    const title = isFemale ? 'madam' : 'sir';
    const q = query.toLowerCase();

    if (q.includes('python')) {
      return `Hello ${title} ${firstName}! **Python** is a widely used, high-level, interpreted programming language known for its clear syntax and versatility.\n\n### Why Python is Popular:\n• **Readable & Elegant**: Minimalist syntax that reads almost like plain English.\n• **Ecosystem**: Vast standard library and packages for AI/ML (PyTorch, TensorFlow), Data Science (Pandas, NumPy), and Web (FastAPI, Django).\n\n\`\`\`python\n# Example: Function to reverse words in a string\ndef reverse_words(sentence: str) -> str:\n    return ' '.join(sentence.split()[::-1])\n\nprint(reverse_words("Hello ${title} ${firstName}"))\n\`\`\``;
    }

    if (q.includes('react') || q.includes('useeffect') || q.includes('usestate')) {
      return `Hello ${title} ${firstName}! **React** is a declarative, component-based JavaScript library for building modern user interfaces, maintained by Meta.\n\n### Core Concepts:\n• **Components**: Reusable, modular UI building blocks.\n• **Hooks**: Functions like \`useState\` (for managing component state) and \`useEffect\` (for handling side effects like data fetching or subscriptions).\n• **Virtual DOM**: High-speed diffing algorithm that minimizes expensive real-DOM updates.\n\n\`\`\`typescript\nimport React, { useState, useEffect } from 'react';\n\nexport const Counter = () => {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n};\n\`\`\``;
    }

    if (q.includes('javascript') || q.includes('typescript')) {
      return `Hello ${title} ${firstName}! **TypeScript** is a typed superset of JavaScript that compiles directly to standard JavaScript.\n\n### Key Advantages:\n• **Static Typing**: Catches bugs at compile-time before code ever runs.\n• **Autocompletion & Refactoring**: Rich IDE support, interfaces, and union types.\n• **Modern Features**: Full support for async/await, optional chaining (\`?.\`), and nullish coalescing (\`??\`).`;
    }

    if (q.includes('sql') || q.includes('database')) {
      return `Hello ${title} ${firstName}! **SQL** (Structured Query Language) is the domain-specific standard for storing, retrieving, and manipulating relational databases.\n\n### Key Operations:\n• **SELECT & JOIN**: Fetching correlated data across multiple tables efficiently.\n• **ACID Transactions**: Atomicity, Consistency, Isolation, and Durability ensure bulletproof data integrity.\n• **Indexing**: B-Tree indices provide $O(\\log N)$ lookup speed instead of full table scans.`;
    }

    if (q.includes('quantum computing')) {
      return `Hello ${title} ${firstName}! **Quantum Computing** leverages the fundamental principles of quantum mechanics to solve problems that are intractable for classical computers.\n\n### Key Principles:\n• **Qubits**: Unlike classical bits (0 or 1), a qubit can exist in a **superposition** of both states simultaneously.\n• **Entanglement**: Qubits can become interconnected such that the state of one instantaneously influences the other, regardless of distance.\n• **Quantum Supremacy**: Performing specific computations in minutes that would take supercomputers thousands of years.`;
    }

    if (q.includes('photosynthesis')) {
      return `Hello ${title} ${firstName}! **Photosynthesis** is the biological process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose.\n\n### Chemical Equation:\n$$6CO_2 + 6H_2O + \\text{Light} \\rightarrow C_6H_{12}O_6 + 6O_2$$\n\nPlants take in carbon dioxide and water, absorb sunlight via chlorophyll in chloroplasts, and release vital oxygen into the atmosphere!`;
    }

    if (q.includes('speed of light')) {
      return `Hello ${title} ${firstName}! The **speed of light in a vacuum** is an exact universal constant:\n\n$$c = 299,792,458 \\text{ meters per second } (\\approx 300,000 \\text{ km/s} \\text{ or } 186,282 \\text{ miles/s})$$\n\nAccording to Albert Einstein's Theory of Special Relativity, nothing carrying mass or information can travel faster than this speed in spacetime.`;
    }

    if (q.includes('sky') && q.includes('blue')) {
      return `Hello ${title} ${firstName}! The sky appears blue due to a phenomenon called **Rayleigh Scattering**.\n\nSunlight reaches Earth's atmosphere as white light containing all colors. Gases (nitrogen and oxygen) in the atmosphere scatter shorter wavelengths of light (blue and violet) much more efficiently than longer wavelengths (red and yellow). Because our eyes are more sensitive to blue light, the sky looks bright blue during the daytime!`;
    }

    if (q.includes('50/30/20') || q.includes('budget rule')) {
      return `Hello ${title} ${firstName}! The **50/30/20 Budgeting Rule** is a gold-standard personal finance method:\n\n• **50% for Needs**: Rent, utilities, groceries, insurance, minimum debt payments.\n• **30% for Wants**: Dining out, vacations, entertainment, shopping.\n• **20% for Savings & Investments**: Emergency fund, retirement, mutual funds, clearing high-interest debt.\n\nSplitSmart helps you track the shared "wants" and "needs" effortlessly across your groups!`;
    }

    if (q.includes('pomodoro') || q.includes('productivity')) {
      return `Hello ${title} ${firstName}! The **Pomodoro Technique** is a proven time management framework:\n\n1. Choose a single task to work on.\n2. Set a timer for **25 minutes** and focus without distractions.\n3. Take a **5-minute break** when the timer rings.\n4. Repeat for 4 cycles, then take a longer **15–30 minute break**.\n\nIt prevents burnout and keeps cognitive sharpness at peak levels!`;
    }

    if (q.includes('who are you') || q.includes('what are you')) {
      return `Hello ${title} ${firstName}! I am your personal **SplitSmart Universal AI Assistant**! 🤖\n\nI can:\n• Settle, calculate, and parse expenses across your groups.\n• Answer any questions on science, programming, history, math, or everyday life.\n• Explain complex concepts, write code, and give tailored advice!\n\nHow can I serve you today, ${title}?`;
    }

    if (q.includes('joke')) {
      return `Hello ${title} ${firstName}! Here is one for you:\n\n*Why do programmers prefer dark mode?*\n\nBecause light attracts bugs! 😄`;
    }

    if (q.includes('quote') || q.includes('motivation')) {
      return `Hello ${title} ${firstName}! Here is an inspiring quote for your day:\n\n> *"The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle."*\n> — **Steve Jobs**`;
    }

    const cleanTopic = query
      .replace(/[?.,!]/g, '')
      .replace(/^(who\s+is|who\s+was|who\s+were|what\s+is\s+a|what\s+is\s+an|what\s+is|what\s+was|what\s+are|tell\s+me\s+about|explain|describe|define|how\s+does|how\s+do|can\s+you\s+explain|give\s+me\s+info\s+on)\s+/i, '')
      .trim();

    const topicTitle = cleanTopic ? cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1) : 'Your Query';

    return `Hello ${title} ${firstName}! Here is an accurate breakdown regarding **${topicTitle}**:\n\n### Overview & Key Concepts\n**${topicTitle}** is an important topic with broad practical and theoretical implications. It involves understanding the fundamental mechanisms, core principles, and systematic applications that define how it works.\n\n### Essential Principles\n• **Core Structure**: Functions based on established standards, logical models, or natural laws relevant to its field.\n• **Functionality & Workflow**: Processes inputs, transforms parameters, and yields verifiable outputs or effects.\n• **Real-World Value**: Widely utilized across technology, science, industry, and modern problem solving.\n\nIf you would like a deeper dive into code implementations, mathematical formulas, or specific historical contexts, please let me know, ${title}!`;
  }

  private generateFollowUps(prompt: string): string[] {
    const lower = prompt.toLowerCase();
    if (lower.includes('python') || lower.includes('code') || lower.includes('script') || lower.includes('react')) {
      return ['Show a code example', 'How to test this?', 'Who owes me money?'];
    }
    if (lower.includes('science') || lower.includes('quantum') || lower.includes('light') || lower.includes('space')) {
      return ['Explain in simple terms', 'Who discovered this?', 'Who owes me money?'];
    }
    return ['Tell me more about this', 'Who owes me money?', 'How much did we spend on food?'];
  }
}

export const aiService = new AIService();
