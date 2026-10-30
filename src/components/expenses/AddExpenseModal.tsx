import React, { useState, useEffect, useRef } from 'react';
import { Group, SplitMethod, GroupMember } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Check, Users, Sparkles, AlertCircle, Camera, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
  groups: Group[];
  preselectedGroupId?: string;
  initialData?: any;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseAdded,
  groups,
  preselectedGroupId,
  initialData,
}) => {
  if (!isOpen) return null;

  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    preselectedGroupId || (groups.length > 0 ? groups[0].id : '')
  );
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState(initialData?.amount ? String(initialData.amount) : '');
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');
  const [category, setCategory] = useState(initialData?.category || 'Food');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [payerId, setPayerId] = useState('');
  const [splitType, setSplitType] = useState<SplitMethod>(initialData?.splitType || 'EQUAL');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [customShares, setCustomShares] = useState<Record<string, number>>({});
  const [percentageShares, setPercentageShares] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Receipt Scanner & AI Quick Fill states
  const receiptFileRef = useRef<HTMLInputElement>(null);
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanNotice, setScanNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [taxAmount, setTaxAmount] = useState<number | undefined>(initialData?.taxAmount);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(initialData?.receiptUrl);

  // Duplicate detection state
  const [potentialDuplicate, setPotentialDuplicate] = useState<any>(null);

  // AI Quick Fill toggle & state
  const [showQuickFill, setShowQuickFill] = useState(false);
  const [quickFillPrompt, setQuickFillPrompt] = useState('');
  const [isQuickFilling, setIsQuickFilling] = useState(false);

  const currentGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

  useEffect(() => {
    if (currentGroup && currentGroup.members.length > 0) {
      const allIds = currentGroup.members.map(m => m.userId);
      const myMember = user ? currentGroup.members.find(m => m.userId === user.id || (m.email && m.email.toLowerCase() === user.email.toLowerCase())) : null;
      const defaultPayerId = myMember ? myMember.userId : (allIds.includes(payerId) ? payerId : currentGroup.members[0].userId);
      setPayerId(defaultPayerId);
      setSelectedMemberIds(allIds);

      // Default shares for percentage or custom
      const numAmt = parseFloat(amount) || 0;
      const count = allIds.length;
      if (count > 0) {
        const pShare = Math.round((100 / count) * 10) / 10;
        const cShare = Math.round((numAmt / count) * 100) / 100;
        const pMap: Record<string, number> = {};
        const cMap: Record<string, number> = {};
        allIds.forEach(id => {
          pMap[id] = pShare;
          cMap[id] = cShare;
        });
        setPercentageShares(pMap);
        setCustomShares(cMap);
      }
    }
  }, [currentGroup?.id]);

  const toggleMemberSelection = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      if (selectedMemberIds.length === 1) return; // Keep at least one
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Receipt image must be under 5MB.');
      return;
    }

    setIsScanningReceipt(true);
    setScanNotice(null);
    setErrorMessage('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          setReceiptUrl(base64Data);
          const res = await api.scanReceipt(base64Data, file.type);

          if (res.success) {
            if (res.title) setTitle(res.title);
            if (res.amount) setAmount(String(res.amount));
            if (res.currency) setCurrency(res.currency);
            if (res.category) setCategory(res.category);
            if (res.date) setDate(res.date);
            if (res.taxAmount) setTaxAmount(res.taxAmount);
            if (res.notes) setNotes(res.notes);

            setScanNotice({
              type: 'success',
              message: `Receipt scanned: Extracted ${res.currency || currency} ${res.amount} (${res.merchantName || res.title}). Review details below.`,
            });
          } else {
            setScanNotice({
              type: 'info',
              message: res.message || 'Receipt OCR requires GEMINI_API_KEY in .env. You can continue manual entry.',
            });
          }
        } catch (err: any) {
          setScanNotice({
            type: 'error',
            message: err.message || 'Could not scan receipt. Please enter details manually.',
          });
        } finally {
          setIsScanningReceipt(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsScanningReceipt(false);
      setErrorMessage('Error reading receipt file.');
    }
  };

  const handleQuickFill = async () => {
    if (!quickFillPrompt.trim() || isQuickFilling) return;
    setIsQuickFilling(true);
    setErrorMessage('');
    try {
      const res = await api.parseExpenseWithAI(quickFillPrompt);
      const parsed = res.parsedExpense;
      if (parsed) {
        if (parsed.title) setTitle(parsed.title);
        if (parsed.amount) setAmount(String(parsed.amount));
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.date) setDate(parsed.date);
        if (parsed.splitType) setSplitType(parsed.splitType);
        if (parsed.notes) setNotes(parsed.notes);

        if (currentGroup?.members) {
          const matchedPayer = currentGroup.members.find(
            m => m.name.toLowerCase().includes(parsed.payerName.toLowerCase()) ||
                 parsed.payerName.toLowerCase().includes(m.name.toLowerCase())
          );
          if (matchedPayer) setPayerId(matchedPayer.userId);
        }

        setScanNotice({
          type: 'success',
          message: `AI Quick-Fill: Extracted "${parsed.title}" for ${parsed.currency} ${parsed.amount}. Review details below.`,
        });
        setShowQuickFill(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'AI Quick-Fill could not parse the text.');
    } finally {
      setIsQuickFilling(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, bypassDuplicate: boolean = false) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setPotentialDuplicate(null);

    if (!title.trim()) {
      setErrorMessage('Please enter an expense title.');
      return;
    }

    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0.');
      return;
    }

    if (selectedMemberIds.length === 0) {
      setErrorMessage('Please select at least one participant.');
      return;
    }

    // Prepare participants array
    const participants = selectedMemberIds.map(uid => {
      const member = currentGroup.members.find(m => m.userId === uid);
      return {
        userId: uid,
        userName: member?.name || 'Member',
        shareAmount: splitType === 'CUSTOM' ? (customShares[uid] || 0) : undefined,
        percentage: splitType === 'PERCENTAGE' ? (percentageShares[uid] || 0) : undefined,
      };
    });

    // Client-side split validations
    if (splitType === 'CUSTOM') {
      const sum = participants.reduce((acc, p) => acc + (p.shareAmount || 0), 0);
      if (Math.abs(sum - numAmt) > 0.05) {
        setErrorMessage(`Custom shares must equal ${currency} ${numAmt.toLocaleString()}. Currently: ${currency} ${sum.toFixed(2)}`);
        return;
      }
    }

    if (splitType === 'PERCENTAGE') {
      const sum = participants.reduce((acc, p) => acc + (p.percentage || 0), 0);
      if (Math.abs(sum - 100) > 0.5) {
        setErrorMessage(`Percentages must add up to 100%. Currently: ${sum.toFixed(1)}%`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payer = currentGroup.members.find(m => m.userId === payerId);
      const res = await api.addExpense(currentGroup.id, {
        title,
        amount: numAmt,
        currency,
        payerId,
        payerName: payer?.name || 'Member',
        category,
        date,
        splitType,
        participants,
        notes,
        taxAmount,
        receiptUrl,
        allowDuplicate: bypassDuplicate,
      });

      if (res.warning === 'POTENTIAL_DUPLICATE' && !bypassDuplicate) {
        setPotentialDuplicate(res.duplicateExpense);
        setIsSubmitting(false);
        return;
      }

      onExpenseAdded();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#101010] rounded-3xl shadow-clay-float border border-[#D8E9FA] dark:border-[#303030] p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D8E9FA]/60 dark:border-[#303030]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center shadow-clay-btn">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5]">Add New Expense</h3>
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">Calculate and split across group members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5] rounded-xl hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Row: Scan Receipt & AI Quick Fill */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <input
            type="file"
            ref={receiptFileRef}
            onChange={handleReceiptUpload}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => receiptFileRef.current?.click()}
            disabled={isScanningReceipt}
            className="clay-btn-secondary flex-1 py-2 px-3 text-[11px] font-bold flex items-center justify-center space-x-1.5"
          >
            {isScanningReceipt ? (
              <>
                <div className="w-3 h-3 border-2 border-[#1685F8] border-t-transparent rounded-full animate-spin" />
                <span>Scanning Receipt...</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-[#1685F8] dark:text-[#2589FF]" />
                <span>Scan Receipt (OCR)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowQuickFill(!showQuickFill)}
            className="clay-btn-secondary flex-1 py-2 px-3 text-[11px] font-bold flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1685F8] dark:text-[#2589FF]" />
            <span>AI Quick-Fill</span>
          </button>
        </div>

        {/* AI Quick Fill Input Box */}
        {showQuickFill && (
          <div className="mt-3 p-3 rounded-2xl bg-[#E9F5FE] dark:bg-[#141414] border border-[#BFE9FF] dark:border-[#303030] space-y-2 animate-in fade-in">
            <div className="text-[11px] font-bold text-[#10274A] dark:text-[#F5F5F5] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#1685F8] dark:text-[#2589FF]" />
              <span>Describe in natural language:</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="e.g. Rahul paid ₹2400 for dinner with Priya and Aman"
                value={quickFillPrompt}
                onChange={e => setQuickFillPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleQuickFill(); } }}
                className="clay-input flex-1 px-3 py-1.5 text-xs text-[#10274A] dark:text-[#F5F5F5] dark:bg-[#0D0D0D]"
              />
              <button
                type="button"
                onClick={handleQuickFill}
                disabled={isQuickFilling || !quickFillPrompt.trim()}
                className="clay-btn-primary px-3 py-1.5 text-xs font-bold disabled:opacity-50"
              >
                {isQuickFilling ? 'Parsing...' : 'Fill'}
              </button>
            </div>
          </div>
        )}

        {/* Scan / Quick-Fill Notice */}
        {scanNotice && (
          <div className={`mt-3 p-3 rounded-2xl text-xs font-medium flex items-start space-x-2 border ${
            scanNotice.type === 'success'
              ? 'bg-[#DDF8EE] dark:bg-[#34D399]/15 border-[#16B890]/40 text-[#16B890] dark:text-[#34D399]'
              : scanNotice.type === 'error'
              ? 'bg-[#FFE9EC] dark:bg-red-950/20 border-red-200 text-red-600 dark:text-red-400'
              : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 text-blue-700 dark:text-blue-300'
          }`}>
            {scanNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{scanNotice.message}</span>
            <button type="button" onClick={() => setScanNotice(null)} className="text-xs font-bold px-1">✕</button>
          </div>
        )}

        {/* Duplicate Warning Alert Box */}
        {potentialDuplicate && (
          <div className="mt-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border-2 border-amber-300 dark:border-amber-700/50 space-y-2.5 animate-in fade-in">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                  Possible Duplicate Expense Detected
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  A similar expense <strong>"{potentialDuplicate.title}"</strong> ({potentialDuplicate.currency} {Number(potentialDuplicate.amount).toLocaleString()}) was recorded on {potentialDuplicate.date} by {potentialDuplicate.payerName}.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setPotentialDuplicate(null)}
                className="clay-btn-secondary px-3 py-1.5 text-xs font-bold"
              >
                Review & Edit
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(undefined, true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FFE9EC] dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-start space-x-2.5 text-xs text-red-600 dark:text-red-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Expense Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Select Group */}
          <div>
            <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">Group</label>
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#10274A] dark:text-[#F5F5F5] dark:bg-[#0D0D0D] dark:border-[#303030]"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">Expense Title</label>
              <input
                type="text"
                placeholder="e.g. Seafood Dinner"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#10274A] dark:text-[#F5F5F5] dark:bg-[#0D0D0D] dark:border-[#303030]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#1685F8] dark:text-[#2589FF] dark:bg-[#0D0D0D] dark:border-[#303030]"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#10274A] dark:text-[#F5F5F5] dark:bg-[#0D0D0D] dark:border-[#303030]"
              >
                <option value="Food">🍽️ Food & Dining</option>
                <option value="Travel">✈️ Travel & Transit</option>
                <option value="Accommodation">🏨 Accommodation</option>
                <option value="Entertainment">🎟️ Entertainment</option>
                <option value="Utilities">💡 Utilities & Bills</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Others">📦 Others</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#10274A] dark:text-[#F5F5F5] dark:bg-[#0D0D0D] dark:border-[#303030]"
              />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">Paid By</label>
            <select
              value={payerId}
              onChange={e => setPayerId(e.target.value)}
              className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#10274A] dark:text-[#F5F5F5] font-semibold dark:bg-[#0D0D0D] dark:border-[#303030]"
            >
              {currentGroup?.members.map(m => (
                <option key={m.userId} value={m.userId}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          {/* Split Method Tabs */}
          <div>
            <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">Split Method</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#F1F9FF] dark:bg-[#0D0D0D] rounded-2xl border border-[#D8E9FA] dark:border-[#303030]">
              {(['EQUAL', 'CUSTOM', 'PERCENTAGE'] as SplitMethod[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    splitType === type
                      ? 'bg-white dark:bg-[#1a1a1a] text-[#1685F8] dark:text-[#2589FF] shadow-sm border border-[#BFE9FF] dark:border-[#303030]'
                      : 'text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5]'
                  }`}
                >
                  {type === 'EQUAL' && 'Equal (=)'}
                  {type === 'CUSTOM' && 'Custom (₹)'}
                  {type === 'PERCENTAGE' && 'Percent (%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Split Participants List */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#10274A] dark:text-[#F5F5F5]">
              <span>Split Between</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#737373] font-normal">
                {selectedMemberIds.length} of {currentGroup?.members.length} members
              </span>
            </div>

            <div className="max-h-44 overflow-y-auto divide-y divide-[#D8E9FA]/50 dark:divide-[#303030] border border-[#D8E9FA] dark:border-[#303030] rounded-2xl p-2 bg-[#F8FCFF] dark:bg-[#0D0D0D]">
              {currentGroup?.members.map(member => {
                const isSelected = selectedMemberIds.includes(member.userId);
                return (
                  <div key={member.userId} className="py-2 px-1 flex items-center justify-between">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMemberSelection(member.userId)}
                        className="rounded text-[#1685F8] dark:text-[#2589FF] focus:ring-[#1685F8] w-4 h-4"
                      />
                      <span className="text-xs font-semibold text-[#10274A] dark:text-[#F5F5F5]">{member.name}</span>
                    </label>

                    {isSelected && splitType === 'EQUAL' && (
                      <span className="text-xs font-bold text-[#1685F8] dark:text-[#2589FF]">
                        {currency}{' '}
                        {selectedMemberIds.length > 0 && amount
                          ? (parseFloat(amount) / selectedMemberIds.length).toFixed(2)
                          : '0.00'}
                      </span>
                    )}

                    {isSelected && splitType === 'CUSTOM' && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-[#64748B] dark:text-[#737373]">{currency}</span>
                        <input
                          type="number"
                          step="0.01"
                          value={customShares[member.userId] ?? ''}
                          onChange={e =>
                            setCustomShares({
                              ...customShares,
                              [member.userId]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="clay-input w-20 px-2 py-1 text-xs text-right font-bold text-[#1685F8] dark:text-[#2589FF] dark:bg-[#141414] dark:border-[#303030]"
                        />
                      </div>
                    )}

                    {isSelected && splitType === 'PERCENTAGE' && (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.1"
                          value={percentageShares[member.userId] ?? ''}
                          onChange={e =>
                            setPercentageShares({
                              ...percentageShares,
                              [member.userId]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="clay-input w-16 px-2 py-1 text-xs text-right font-bold text-[#1685F8] dark:text-[#2589FF] dark:bg-[#141414] dark:border-[#303030]"
                        />
                        <span className="text-xs text-[#64748B] dark:text-[#737373]">%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-secondary px-4 py-2.5 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="clay-btn-primary px-6 py-2.5 text-xs font-bold flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
