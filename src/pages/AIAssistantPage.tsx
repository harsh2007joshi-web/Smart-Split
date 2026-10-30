import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { RobotIllustration } from '../components/illustrations/RobotIllustration';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { Group, AIParsedExpense } from '../types';
import { api } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle,
  Edit3,
  Check,
  AlertCircle,
  Receipt,
  HelpCircle,
  Lightbulb,
  Mic,
  MicOff,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  parsedExpense?: AIParsedExpense;
  suggestedFollowUps?: string[];
  isConfirmed?: boolean;
  time: string;
}

export const AIAssistantPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedParsedExpenseForEdit, setSelectedParsedExpenseForEdit] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice('Voice recognition is not supported in this browser. Please use text entry.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English / global English support

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening... Speak your expense clearly.');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceNotice(event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Voice recognition ended.');
        setTimeout(() => setVoiceNotice(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceNotice(null);
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
      setVoiceNotice('Could not start microphone. Please use text entry.');
      setTimeout(() => setVoiceNotice(null), 4000);
    }
  };

  useEffect(() => {
    // Load groups
    api.getGroups().then(res => setGroups(res.groups || []));

    // Initial greeting
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'ASSISTANT',
        text: "Hi! I'm your SplitSmart AI Assistant. You can describe an expense in plain English to split it automatically, or ask questions about your group spending, balances, and debts.",
        suggestedFollowUps: [
          'Yesterday Rahul paid ₹2,400 for dinner with Priya and Aman',
          'Who owes me money?',
          'How much did we spend on food?',
          'Summarize Goa Trip 2026',
        ],
        time: 'Just now',
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'USER',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Check if user is describing an expense to add vs asking a question
      const isExpenseDescription =
        /paid|split|spent|bill|bought|dinner|lunch|flight|resort|uber|rent/i.test(query) &&
        /\d+/.test(query);

      if (isExpenseDescription) {
        const res = await api.parseExpenseWithAI(query);
        const parsed = res.parsedExpense;

        const assistantMsg: ChatMessage = {
          id: 'ast_' + Date.now(),
          sender: 'ASSISTANT',
          text: `I extracted the expense details for you. Please review and confirm to save it:`,
          parsedExpense: parsed,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        // Financial question
        const res = await api.askAIAssistant(query);
        const assistantMsg: ChatMessage = {
          id: 'ast_' + Date.now(),
          sender: 'ASSISTANT',
          text: res.answer,
          suggestedFollowUps: res.suggestedFollowUps,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ASSISTANT',
          text: 'Sorry, I encountered an issue while processing your request. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmExpense = async (msgId: string, parsed: AIParsedExpense, bypassDuplicate: boolean = false) => {
    try {
      // Pick target group based on AI detection or first group
      const targetGroup = (parsed as any).groupId
        ? (groups.find(g => g.id === (parsed as any).groupId) || groups[0])
        : groups[0];

      if (!targetGroup) {
        alert('Please create a group first.');
        return;
      }

      // Map participant names to userIds in target group
      const participants = parsed.splits.map(s => {
        const member = targetGroup.members.find(
          m => m.name.toLowerCase().includes(s.userName.toLowerCase()) ||
               s.userName.toLowerCase().includes(m.name.toLowerCase())
        );
        return {
          userId: member?.userId || targetGroup.members[0].userId,
          userName: s.userName,
          shareAmount: s.shareAmount,
        };
      });

      const payerMember = targetGroup.members.find(
        m => m.name.toLowerCase().includes(parsed.payerName.toLowerCase()) ||
             parsed.payerName.toLowerCase().includes(m.name.toLowerCase())
      ) || targetGroup.members[0];

      const res = await api.addExpense(targetGroup.id, {
        title: parsed.title,
        amount: parsed.amount,
        currency: parsed.currency,
        payerId: payerMember.userId,
        payerName: payerMember.name,
        category: parsed.category,
        date: parsed.date,
        splitType: 'EQUAL',
        participants,
        notes: parsed.notes,
        allowDuplicate: bypassDuplicate,
      });

      if (res.warning === 'POTENTIAL_DUPLICATE' && !bypassDuplicate) {
        if (window.confirm(`Possible Duplicate Detected:\n"${res.duplicateExpense.title}" (${res.duplicateExpense.currency} ${res.duplicateExpense.amount}) was already recorded on ${res.duplicateExpense.date}.\n\nDo you want to proceed and save this expense anyway?`)) {
          handleConfirmExpense(msgId, parsed, true);
        }
        return;
      }

      // Update message state
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, isConfirmed: true } : m))
      );

      // Add assistant confirmation response
      setMessages(prev => [
        ...prev,
        {
          id: 'ast_conf_' + Date.now(),
          sender: 'ASSISTANT',
          text: `✅ Done! "${parsed.title}" (${parsed.currency} ${parsed.amount.toLocaleString()}) has been recorded in ${targetGroup.name}. Group balances have been updated.`,
          suggestedFollowUps: ['Who owes me money?', 'How much did we spend on food?'],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      alert(err.message || 'Could not save expense');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0 h-screen">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Chat Header */}
        <div className="px-6 py-4 bg-white dark:bg-[#080808] border-b border-[#D8E9FA] dark:border-[#303030] flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] dark:border dark:border-[#303030] flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#10274A] dark:text-[#F5F5F5] flex items-center space-x-2">
                <span>SplitSmart AI Assistant</span>
                <span className="px-2 py-0.5 rounded-full bg-[#DDF8EE] text-[#16B890] dark:bg-[#34D399]/15 dark:text-[#34D399] text-[10px] font-bold">
                  Online
                </span>
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#737373]">Natural language expenses & real financial queries</p>
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'} items-start space-x-3`}
            >
              {msg.sender === 'ASSISTANT' && (
                <div className="shrink-0 mt-1">
                  <RobotIllustration size={44} glow={false} />
                </div>
              )}

              <div className="max-w-2xl space-y-2">
                {/* Text Bubble */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl text-sm leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'clay-btn-primary text-white rounded-tr-none'
                      : 'clay-card bg-white dark:bg-[#101010] text-[#10274A] dark:text-[#F5F5F5] dark:border-[#303030] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Parsed Expense Confirmation Card */}
                {msg.parsedExpense && (
                  <div className="clay-card p-5 bg-white dark:bg-[#101010] border-[#BFE9FF] dark:border-[#303030] space-y-3 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-[#D8E9FA]/60 dark:border-[#303030]">
                      <div className="flex items-center space-x-2">
                        <Receipt className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                        <span className="text-xs font-bold text-[#10274A] dark:text-[#F5F5F5]">Extracted Expense Proposal</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DDF8EE] text-[#16B890] dark:bg-[#34D399]/15 dark:text-[#34D399]">
                        {msg.parsedExpense.confidence * 100}% Confidence
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#64748B] dark:text-[#737373]">Title:</span>{' '}
                        <strong className="text-[#10274A] dark:text-[#F5F5F5]">{msg.parsedExpense.title}</strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] dark:text-[#737373]">Amount:</span>{' '}
                        <strong className="text-[#1685F8] dark:text-[#2589FF]">
                          {msg.parsedExpense.currency} {msg.parsedExpense.amount.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] dark:text-[#737373]">Payer:</span>{' '}
                        <strong className="text-[#10274A] dark:text-[#F5F5F5]">{msg.parsedExpense.payerName}</strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] dark:text-[#737373]">Category:</span>{' '}
                        <strong className="text-[#10274A] dark:text-[#F5F5F5]">{msg.parsedExpense.category}</strong>
                      </div>
                    </div>

                    {/* Shares Breakdown */}
                    <div className="p-2.5 rounded-xl bg-[#F1F9FF] dark:bg-[#141414] border border-[#D8E9FA] dark:border-[#303030] space-y-1">
                      <div className="text-[11px] font-bold text-[#64748B] dark:text-[#737373]">Proposed Equal Shares:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.parsedExpense.splits.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] text-[#10274A] dark:text-[#F5F5F5] font-medium"
                          >
                            {s.userName}: {msg.parsedExpense?.currency} {s.shareAmount}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Preview Action Buttons */}
                    {!msg.isConfirmed ? (
                      <div className="pt-2 flex items-center justify-end space-x-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParsedExpenseForEdit(msg.parsedExpense);
                            setIsEditModalOpen(true);
                          }}
                          className="clay-btn-secondary px-3.5 py-1.5 text-xs font-bold flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConfirmExpense(msg.id, msg.parsedExpense!)}
                          className="clay-btn-primary px-4 py-1.5 text-xs font-bold flex items-center space-x-1 shadow-clay-btn"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Expense</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center space-x-1.5 text-xs font-bold text-[#16B890] dark:text-[#34D399]">
                        <CheckCircle className="w-4 h-4" />
                        <span>Saved to Group Expenses</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {msg.suggestedFollowUps && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] text-[11px] font-semibold text-[#1685F8] dark:text-[#2589FF] hover:bg-[#E9F5FE] dark:hover:bg-[#181818] transition-colors shadow-sm dark:shadow-none"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <span className="block text-[10px] text-[#64748B] dark:text-[#737373] px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3 text-xs text-[#64748B] dark:text-[#737373]">
              <div className="w-8 h-8 rounded-full bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="clay-card px-4 py-2.5 bg-white dark:bg-[#101010] dark:border-[#303030] flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#1685F8] dark:bg-[#2589FF] animate-ping" />
                <span>SplitSmart AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Notice Popup if active or error */}
        {voiceNotice && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-[#141414] border-t border-[#BFE9FF] dark:border-[#303030] text-center text-xs font-semibold text-[#1685F8] dark:text-[#2589FF] animate-in fade-in flex items-center justify-center space-x-2">
            {isListening && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />}
            <span>{voiceNotice}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-[#080808] border-t border-[#D8E9FA] dark:border-[#303030] transition-colors">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2.5 max-w-4xl mx-auto"
          >
            <input
              type="text"
              placeholder={isListening ? 'Listening to speech...' : 'e.g. Rahul paid ₹2,400 for dinner with Priya and Aman...'}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className={`clay-input flex-1 px-4 py-3 text-xs sm:text-sm font-medium ${
                isListening ? 'border-[#1685F8] ring-2 ring-[#1685F8]/20 bg-blue-50/20' : ''
              }`}
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Voice-based expense entry'}
              className={`p-3 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-md'
                  : 'clay-btn-secondary text-[#1685F8] dark:text-[#2589FF]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="clay-btn-primary px-5 py-3 text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-clay-btn disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Edit Modal if user wants to tweak before confirming */}
      {selectedParsedExpenseForEdit && (
        <AddExpenseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onExpenseAdded={() => {
            setIsEditModalOpen(false);
            setMessages(prev => [
              ...prev,
              {
                id: 'ast_edited_' + Date.now(),
                sender: 'ASSISTANT',
                text: '✅ Your custom edited expense has been successfully recorded in the group.',
                time: 'Just now',
              },
            ]);
          }}
          groups={groups}
          initialData={selectedParsedExpenseForEdit}
        />
      )}
    </div>
  );
};
