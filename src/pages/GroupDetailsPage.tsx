import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { Group, Expense, MemberBalance, SuggestedSettlement } from '../types';
import { api } from '../services/api';
import {
  Wallet,
  Users,
  Scale,
  Receipt,
  Plus,
  ArrowLeft,
  UserPlus,
  Trash2,
  Edit2,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';

export const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EXPENSES' | 'MEMBERS' | 'SETTLEMENTS'>('OVERVIEW');
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [suggestedSettlements, setSuggestedSettlements] = useState<SuggestedSettlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const [activeInviteUrl, setActiveInviteUrl] = useState('');
  const [lastInvitedEmail, setLastInvitedEmail] = useState('');
  const [inviteDispatchStatus, setInviteDispatchStatus] = useState<{ delivered: boolean; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isUpdatingDomain, setIsUpdatingDomain] = useState(false);
  const [domainSuccess, setDomainSuccess] = useState('');

  // Budget Management States
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);

  const fetchGroupDetails = async () => {
    if (!id) return;
    try {
      const data = await api.getGroupDetails(id);
      setGroup(data.group);
      setExpenses(data.expenses || []);
      setBalances(data.balances || []);
      setSuggestedSettlements(data.suggestedSettlements || []);
    } catch (err: any) {
      console.error(err);
      alert('Could not fetch group details.');
      navigate('/groups');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense? Balances will be recalculated.')) {
      try {
        await api.deleteExpense(expenseId);
        fetchGroupDetails();
      } catch (err: any) {
        alert(err.message || 'Failed to delete expense');
      }
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !inviteName || !inviteEmail) return;
    try {
      const res = await api.addMember(id, {
        name: inviteName,
        email: inviteEmail,
        clientBaseUrl: window.location.origin
      });
      setIsInviteOpen(false);
      const url = res.joinUrl || `${window.location.origin}/join-group?token=${res.invitationToken}&groupId=${id}`;
      setActiveInviteUrl(url);
      setLastInvitedEmail(inviteEmail);
      setInviteDispatchStatus(res.emailDispatch || null);
      setInviteSuccessMessage(`Invitation created for ${inviteEmail}!`);
      setInviteName('');
      setInviteEmail('');
      fetchGroupDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to invite member');
    }
  };

  const handleApplyDomain = async (domainToApply?: string) => {
    const raw = domainToApply || customDomainInput;
    if (!raw.trim()) return;
    let formatted = raw.trim();
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = 'https://' + formatted;
    }
    formatted = formatted.replace(/\/$/, '');
    setIsUpdatingDomain(true);
    try {
      await api.setPublicUrl(formatted);
      if (activeInviteUrl) {
        const pathPart = activeInviteUrl.replace(/^https?:\/\/[^\/]+/, '');
        const updated = `${formatted}${pathPart}`;
        setActiveInviteUrl(updated);
        if (lastInvitedEmail) {
          api.shareLink({
            email: lastInvitedEmail,
            friendName: 'Friend',
            targetUrl: updated,
            note: 'Updated public link to access the trip group from your device.'
          }).catch(() => {});
        }
      }
      setDomainSuccess(`Connected to ${formatted}!`);
      setTimeout(() => setDomainSuccess(''), 4500);
    } catch (err: any) {
      alert(err.message || 'Failed to update public URL');
    } finally {
      setIsUpdatingDomain(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeInviteUrl) return;
    navigator.clipboard.writeText(activeInviteUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const num = parseFloat(budgetValue);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid positive budget number.');
      return;
    }
    setIsUpdatingBudget(true);
    try {
      await api.updateGroupBudget(id, num);
      setIsBudgetModalOpen(false);
      fetchGroupDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update budget.');
    } finally {
      setIsUpdatingBudget(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!id || !group) return;
    const confirmText = suggestedSettlements.length > 0
      ? `This trip has ${suggestedSettlements.length} pending settlements. Are you sure you want to permanently delete and close "${group.name}"?`
      : `Are you sure you want to delete and close the trip "${group.name}"? All associated bills and records will be removed.`;

    if (window.confirm(confirmText)) {
      setIsDeleting(true);
      try {
        await api.deleteGroup(id);
        navigate('/groups');
      } catch (err: any) {
        alert(err.message || 'Failed to delete trip.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Link
                to="/groups"
                className="text-xs font-bold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to My Groups</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                {group?.name || 'Loading group...'}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA]">
                {group?.description || 'Shared expense circle'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsInviteOpen(true)}
                className="clay-btn-secondary px-3.5 py-2 text-xs sm:text-sm font-bold flex items-center space-x-1.5"
              >
                <UserPlus className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                <span>Invite Member</span>
              </button>

              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="clay-btn-primary px-4 py-2 text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-clay-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>

              <button
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-2xl bg-red-50 dark:bg-[#FB7185]/10 text-red-600 dark:text-[#FB7185] hover:bg-red-100 dark:hover:bg-[#FB7185]/20 border border-red-200 dark:border-[#FB7185]/30 transition-colors flex items-center space-x-1.5"
                title="Delete and close this trip after settlement"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Trip'}</span>
              </button>
            </div>
          </div>

          {/* Magic Invitation Link Banner (Visible immediately when inviting a friend) */}
          {activeInviteUrl && (
            <div className="clay-card p-5 bg-gradient-to-r from-[#DDF8EE] via-white to-[#F1F9FF] dark:from-[#101010] dark:via-[#141414] dark:to-[#101010] border-2 border-[#16B890]/50 dark:border-[#303030] space-y-3 shadow-clay-card dark:shadow-none animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl ${inviteDispatchStatus && !inviteDispatchStatus.delivered ? 'bg-amber-500' : 'bg-[#16B890] dark:bg-[#34D399]'} text-white flex items-center justify-center shadow-sm shrink-0`}>
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-[#10274A] dark:text-[#F5F5F5]">
                        {inviteDispatchStatus && !inviteDispatchStatus.delivered
                          ? 'Magic Join Link Ready to Share!'
                          : 'Trip Invitation Sent & Magic Join Link Ready!'}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inviteDispatchStatus && !inviteDispatchStatus.delivered ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300' : 'bg-[#16B890] dark:bg-[#34D399] text-white'}`}>
                        {inviteDispatchStatus && !inviteDispatchStatus.delivered ? 'Direct Link Ready' : 'Active Link'}
                      </span>
                    </div>
                    {inviteDispatchStatus && !inviteDispatchStatus.delivered ? (
                      <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                        <span className="font-semibold">Resend sandbox notice:</span> Free test mode only sends to the owner account (<code className="font-mono text-[11px]">harsh2007joshi@gmail.com</code>). <strong>Share the link below directly with {lastInvitedEmail} via WhatsApp or Telegram!</strong>
                      </p>
                    ) : (
                      <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                        Invitation email dispatched to <strong className="text-[#10274A] dark:text-[#F5F5F5]">{lastInvitedEmail}</strong>. You can also share the direct link below via WhatsApp, Telegram, or SMS:
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setActiveInviteUrl('')}
                  className="text-xs font-bold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5] px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#141414] transition-colors"
                >
                  Dismiss
                </button>
              </div>

              {/* Copyable URL input and action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={activeInviteUrl}
                    className="clay-input w-full px-3.5 py-2.5 text-xs font-mono font-semibold text-[#10274A] dark:text-[#F5F5F5] bg-white dark:bg-[#0D0D0D] border border-[#BFE9FF] dark:border-[#303030] select-all shadow-inner"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl bg-[#1685F8] dark:bg-[#2589FF] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-clay-btn hover:bg-[#126ecf] dark:hover:bg-[#1c78e3] transition-all shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Magic Link</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Join our trip "${group?.name || 'Trip'}" on SplitSmart AI to track shared expenses and split bills: ${activeInviteUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#128C7E] dark:text-[#34D399] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shrink-0 shadow-sm"
                >
                  <span>💬 WhatsApp</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(activeInviteUrl)}&text=${encodeURIComponent(`Hey! Join our trip "${group?.name || 'Trip'}" on SplitSmart AI:`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/30 text-[#0088cc] dark:text-[#2589FF] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shrink-0 shadow-sm"
                >
                  <span>✈️ Telegram</span>
                </a>
                <a
                  href={activeInviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] text-[#10274A] dark:text-[#F5F5F5] text-xs font-bold flex items-center justify-center space-x-1 hover:bg-[#F1F9FF] dark:hover:bg-[#141414] transition-all shadow-sm shrink-0"
                >
                  <ExternalLink className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                  <span>Test</span>
                </a>
              </div>

              {/* Localhost / Domain Alert & Public Domain Connector */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-[#141414] border border-amber-200 dark:border-[#303030] text-xs text-amber-900 dark:text-[#F5F5F5] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="leading-snug">
                    <span className="font-bold">⚠️ Sharing Across Devices:</span> Friends on other phones or laptops cannot reach <code className="bg-amber-100 dark:bg-[#202020] px-1 py-0.5 rounded font-mono font-bold">localhost</code>. Connect your public domain or tunnel below:
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyDomain('http://192.168.29.220:5173')}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#181818] border border-amber-300 dark:border-[#303030] hover:bg-amber-100/50 dark:hover:bg-[#222222] text-amber-900 dark:text-[#F5F5F5] font-bold text-[11px] shrink-0 flex items-center space-x-1 shadow-sm transition-all"
                  >
                    <span>📶 Use Local Wi-Fi IP (192.168.29.220)</span>
                  </button>
                </div>

                {domainSuccess && (
                  <div className="p-2.5 rounded-xl bg-[#DDF8EE] dark:bg-[#34D399]/15 border border-[#16B890]/40 dark:border-[#34D399]/30 text-[#16B890] dark:text-[#34D399] font-bold text-xs flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{domainSuccess} Invitation link and email updated!</span>
                  </div>
                )}

                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter public domain (e.g. https://yourdomain.com or Cloudflare tunnel link)"
                    value={customDomainInput}
                    onChange={e => setCustomDomainInput(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 bg-white dark:bg-[#0D0D0D] rounded-xl border border-[#D8E9FA] dark:border-[#303030] text-xs text-[#10274A] dark:text-[#F5F5F5] focus:outline-none focus:border-[#1685F8] dark:focus:border-[#2589FF]"
                  />
                  <button
                    type="button"
                    disabled={isUpdatingDomain || !customDomainInput.trim()}
                    onClick={() => handleApplyDomain()}
                    className="clay-btn-primary px-4 py-2 text-xs font-bold w-full sm:w-auto shrink-0 flex items-center justify-center space-x-1 shadow-clay-btn disabled:opacity-50"
                  >
                    {isUpdatingDomain ? (
                      <span>Connecting...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Connect Public Domain</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] text-amber-700/80 dark:text-[#737373]">
                  Tip: Run <code className="bg-amber-100/80 dark:bg-[#202020] px-1 py-0.5 rounded font-mono font-bold">npm run share</code> in terminal for a free instant Cloudflare tunnel, or enter your custom domain name.
                </div>
              </div>

              <div className="text-[11px] text-[#64748B] dark:text-[#737373] flex items-center space-x-1.5 pt-0.5">
                <span className="text-[#1685F8] dark:text-[#2589FF] font-bold">💡 Multi-Device Support:</span>
                <span>
                  Your friend can open this link from their mobile phone or laptop browser to instantly join this trip and log expenses from their own device.
                </span>
              </div>
            </div>
          )}

          {inviteSuccessMessage && !activeInviteUrl && (
            <div className="p-4 rounded-2xl bg-[#DDF8EE] dark:bg-[#34D399]/15 border border-[#16B890]/40 dark:border-[#34D399]/30 text-xs text-[#16B890] dark:text-[#34D399] font-bold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>{inviteSuccessMessage}</span>
              </div>
              <button
                onClick={() => setInviteSuccessMessage('')}
                className="text-xs hover:underline text-[#10274A] dark:text-[#F5F5F5]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Group 4 Tabs Navigation */}
          <div className="flex border-b border-[#D8E9FA] dark:border-[#303030] space-x-4 sm:space-x-8 text-sm font-bold">
            {(['OVERVIEW', 'EXPENSES', 'MEMBERS', 'SETTLEMENTS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 relative capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-[#1685F8] dark:text-[#2589FF] border-b-2 border-[#1685F8] dark:border-[#2589FF]'
                    : 'text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5]'
                }`}
              >
                {tab.toLowerCase()}
                {tab === 'EXPENSES' && ` (${expenses.length})`}
                {tab === 'MEMBERS' && ` (${group?.members.length || 0})`}
              </button>
            ))}
          </div>

          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Group Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030]">
                  <span className="text-xs font-bold text-[#64748B] dark:text-[#737373] uppercase tracking-wider">Total Group Spent</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] mt-2">
                    {group?.currency} {(group?.totalSpent || 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-[#16B890] dark:text-[#34D399] font-semibold mt-1 inline-block">
                    Across {expenses.length} recorded bills
                  </span>
                </div>

                <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030]">
                  <span className="text-xs font-bold text-[#64748B] dark:text-[#737373] uppercase tracking-wider">Group Members</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] mt-2">
                    {group?.members.length || 0}
                  </div>
                  <span className="text-[11px] text-[#64748B] dark:text-[#A1A1AA] font-semibold mt-1 inline-block">
                    {group?.currency} currency circle
                  </span>
                </div>

                <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030]">
                  <span className="text-xs font-bold text-[#64748B] dark:text-[#737373] uppercase tracking-wider">Pending Settlements</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#1685F8] dark:text-[#2589FF] mt-2">
                    {suggestedSettlements.length} Transfers
                  </div>
                  <button
                    onClick={() => setActiveTab('SETTLEMENTS')}
                    className="text-[11px] text-[#1685F8] dark:text-[#2589FF] hover:underline font-bold mt-1 inline-block"
                  >
                    View optimized transfers →
                  </button>
                </div>
              </div>

              {/* Group Budget Tracker Card */}
              <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] dark:border dark:border-[#303030] flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5] flex items-center space-x-2">
                        <span>Group Budget Tracker</span>
                        {group?.budget && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            (group.budgetUsedPercentage || 0) >= 100
                              ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                              : (group.budgetUsedPercentage || 0) >= 70
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-[#DDF8EE] text-[#16B890] dark:bg-[#34D399]/15 dark:text-[#34D399]'
                          }`}>
                            {group.budgetUsedPercentage || 0}% Used
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
                        Track total spend against group spending limits
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBudgetValue(group?.budget ? String(group.budget) : '30000');
                      setIsBudgetModalOpen(true);
                    }}
                    className="clay-btn-secondary px-3.5 py-1.5 text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#1685F8] dark:text-[#2589FF]" />
                    <span>{group?.budget ? 'Update Budget' : '+ Set Budget'}</span>
                  </button>
                </div>

                {group?.budget ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div className="p-3.5 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#737373]">Total Budget</span>
                        <div className="text-lg font-black text-[#10274A] dark:text-[#F5F5F5] mt-0.5">
                          {group.currency} {group.budget.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#737373]">Amount Spent</span>
                        <div className="text-lg font-black text-[#1685F8] dark:text-[#2589FF] mt-0.5">
                          {group.currency} {(group.totalSpent || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#737373]">Remaining</span>
                        <div className={`text-lg font-black mt-0.5 ${
                          (group.remainingBudget || 0) <= 0
                            ? 'text-red-500'
                            : 'text-[#16B890] dark:text-[#34D399]'
                        }`}>
                          {group.currency} {Math.max(0, group.budget - (group.totalSpent || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="w-full h-3 rounded-full bg-[#E9F5FE] dark:bg-[#181818] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            (group.budgetUsedPercentage || 0) >= 100
                              ? 'bg-red-500'
                              : (group.budgetUsedPercentage || 0) >= 70
                              ? 'bg-amber-500'
                              : 'bg-gradient-to-r from-[#1685F8] to-[#16B890]'
                          }`}
                          style={{ width: `${Math.min(100, group.budgetUsedPercentage || 0)}%` }}
                        />
                      </div>
                      {(group.budgetUsedPercentage || 0) >= 100 && (
                        <p className="text-[11px] font-bold text-red-500 dark:text-red-400">
                          ⚠️ Group has exceeded its planned budget by {group.currency} {((group.totalSpent || 0) - group.budget).toLocaleString()}.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] flex items-center justify-between text-xs text-[#64748B] dark:text-[#A1A1AA]">
                    <span>No spending budget configured yet for this trip.</span>
                    <button
                      onClick={() => {
                        setBudgetValue('30000');
                        setIsBudgetModalOpen(true);
                      }}
                      className="text-[#1685F8] dark:text-[#2589FF] font-bold hover:underline"
                    >
                      Set a budget limit →
                    </button>
                  </div>
                )}
              </div>

              {/* Member Balances Table */}
              <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030] space-y-4">
                <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">Member Balances & Settlements</h3>
                <div className="divide-y divide-[#D8E9FA]/60 dark:divide-[#303030]">
                  {balances.map(b => (
                    <div key={b.userId} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] font-bold flex items-center justify-center uppercase border border-[#BFE9FF] dark:border-[#303030]">
                          {b.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">{b.userName}</div>
                          <div className="text-xs text-[#64748B] dark:text-[#737373]">
                            Paid: {group?.currency} {b.totalPaid.toLocaleString()} • Share: {group?.currency} {b.totalShare?.toLocaleString() || '0'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {b.netBalance > 0.01 ? (
                          <div>
                            <span className="text-sm sm:text-base font-extrabold text-[#16B890] dark:text-[#34D399]">
                              +{group?.currency} {b.netBalance.toLocaleString()}
                            </span>
                            <span className="block text-[10px] text-[#16B890] dark:text-[#34D399] font-semibold">Gets back</span>
                          </div>
                        ) : b.netBalance < -0.01 ? (
                          <div>
                            <span className="text-sm sm:text-base font-extrabold text-[#EF4444] dark:text-[#FB7185]">
                              -{group?.currency} {Math.abs(b.netBalance).toLocaleString()}
                            </span>
                            <span className="block text-[10px] text-[#EF4444] dark:text-[#FB7185] font-semibold">Owes</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-[#64748B] dark:text-[#737373] px-2 py-1 rounded-full bg-slate-100 dark:bg-[#141414] dark:border dark:border-[#303030]">
                            Settled Up
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: EXPENSES ================= */}
          {activeTab === 'EXPENSES' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">All Recorded Expenses</h3>
                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>

              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <div className="clay-card p-10 text-center bg-white dark:bg-[#101010] dark:border-[#303030]">
                    <Receipt className="w-10 h-10 text-slate-300 dark:text-[#303030] mx-auto mb-2" />
                    <p className="text-sm text-[#64748B] dark:text-[#737373]">No expenses recorded for this group yet.</p>
                  </div>
                ) : (
                  expenses.map(exp => (
                    <div
                      key={exp.id}
                      className="clay-card-hover p-5 bg-white dark:bg-[#101010] dark:border-[#303030] dark:hover:bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] dark:border dark:border-[#303030] flex items-center justify-center font-bold text-lg shrink-0">
                          {exp.category === 'Food' && '🍽️'}
                          {exp.category === 'Travel' && '✈️'}
                          {exp.category === 'Accommodation' && '🏨'}
                          {exp.category === 'Entertainment' && '🎟️'}
                          {exp.category === 'Utilities' && '💡'}
                          {!['Food', 'Travel', 'Accommodation', 'Entertainment', 'Utilities'].includes(exp.category) && '📦'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">{exp.title}</h4>
                          <p className="text-xs text-[#64748B] dark:text-[#737373]">
                            Paid by <strong className="text-[#10274A] dark:text-[#F5F5F5]">{exp.payerName}</strong> on {exp.date} • Split {exp.splitType.toLowerCase()}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {exp.splits.map((s, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F9FF] dark:bg-[#141414] border border-[#D8E9FA] dark:border-[#303030] text-[#64748B] dark:text-[#A1A1AA]">
                                {s.userName}: {exp.currency} {s.shareAmount}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#D8E9FA]/60 dark:border-[#303030]">
                        <div className="text-base sm:text-lg font-black text-[#10274A] dark:text-[#F5F5F5]">
                          {exp.currency} {exp.amount.toLocaleString()}
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-400 dark:text-[#737373] hover:text-red-500 dark:hover:text-[#FB7185] rounded-lg transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: MEMBERS ================= */}
          {activeTab === 'MEMBERS' && (
            <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030] space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#D8E9FA]/60 dark:border-[#303030]">
                <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">Group Members</h3>
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="clay-btn-secondary px-3.5 py-1.5 text-xs font-bold flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#1685F8] dark:text-[#2589FF]" />
                  <span>Invite New Friend</span>
                </button>
              </div>

              <div className="divide-y divide-[#D8E9FA]/60 dark:divide-[#303030]">
                {group?.members.map(member => (
                  <div key={member.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] font-bold flex items-center justify-center uppercase border border-[#BFE9FF] dark:border-[#303030]">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">{member.name}</div>
                        <div className="text-xs text-[#64748B] dark:text-[#737373]">{member.email}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E9F5FE] text-[#1685F8] dark:bg-[#2589FF]/15 dark:text-[#2589FF] border border-[#BFE9FF] dark:border-[#2589FF]/30">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: SETTLEMENTS ================= */}
          {activeTab === 'SETTLEMENTS' && (
            <div className="space-y-4">
              <div className="clay-card p-6 bg-[#DDF8EE]/40 dark:bg-[#101010] border-[#16B890]/30 dark:border-[#303030] flex items-start space-x-3.5">
                <Scale className="w-5 h-5 text-[#16B890] dark:text-[#34D399] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">Smart Debt Simplification Active</h4>
                  <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                    Our settlement engine nets cross-member debts into direct minimal transactions. You can settle instantly via PayPal Sandbox or 3D Card checkout.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {suggestedSettlements.length === 0 ? (
                  <div className="clay-card p-10 text-center bg-white dark:bg-[#101010] dark:border-[#303030]">
                    <CheckCircle className="w-10 h-10 text-[#16B890] dark:text-[#34D399] mx-auto mb-2" />
                    <h4 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">All Cleared Up!</h4>
                    <p className="text-xs text-[#64748B] dark:text-[#737373] mt-1">There are no outstanding debts in this group.</p>
                  </div>
                ) : (
                  suggestedSettlements.map(s => (
                    <div
                      key={s.id}
                      className="clay-card p-5 bg-white dark:bg-[#101010] dark:border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] dark:border dark:border-[#303030] flex items-center justify-center font-bold">
                          ₹
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                            <span className="text-[#EF4444] dark:text-[#FB7185]">{s.fromUserName}</span> pays{' '}
                            <span className="text-[#16B890] dark:text-[#34D399]">{s.toUserName}</span>
                          </div>
                          <div className="text-xs text-[#64748B] dark:text-[#737373]">Optimized Direct Settlement</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 justify-between sm:justify-end">
                        <div className="text-lg font-black text-[#10274A] dark:text-[#F5F5F5]">
                          {s.currency} {s.amount.toLocaleString()}
                        </div>

                        <Link
                          to={`/checkout?groupId=${s.groupId}&recipientId=${s.toUserId}&recipientName=${encodeURIComponent(s.toUserName)}&amount=${s.amount}&currency=${s.currency}&groupName=${encodeURIComponent(s.groupName)}`}
                          className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center space-x-1 shadow-clay-btn"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Settle Now →</span>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Expense Modal */}
      {group && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onExpenseAdded={fetchGroupDetails}
          groups={[group]}
          preselectedGroupId={group.id}
        />
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#101010] rounded-3xl p-6 shadow-clay-float dark:shadow-none border border-[#D8E9FA] dark:border-[#303030]">
            <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5] mb-3">Invite Member</h3>
            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Friend's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sneha Roy"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  required
                  className="clay-input w-full px-3.5 py-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sneha@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                  className="clay-input w-full px-3.5 py-2 text-xs font-medium"
                />
                <p className="text-[11px] text-[#64748B] dark:text-[#737373] mt-1.5 flex items-center space-x-1">
                  <span>✉️</span>
                  <span>An invitation email with a magic join link will be sent to this address, plus an instant copyable link will appear on screen.</span>
                </p>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="clay-btn-secondary px-3 py-1.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary px-4 py-1.5 text-xs font-bold"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set / Update Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#101010] rounded-3xl shadow-clay-float border border-[#D8E9FA] dark:border-[#303030] p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E9FA] dark:border-[#303030]">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-[#1685F8] dark:text-[#2589FF]" />
                <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">Group Budget Limit</h3>
              </div>
              <button onClick={() => setIsBudgetModalOpen(false)} className="text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">
                  Total Planned Budget ({group?.currency || 'INR'})
                </label>
                <input
                  type="number"
                  step="100"
                  placeholder="30000"
                  value={budgetValue}
                  onChange={e => setBudgetValue(e.target.value)}
                  required
                  className="clay-input w-full px-3.5 py-2.5 text-sm font-bold text-[#1685F8] dark:text-[#2589FF] dark:bg-[#0D0D0D]"
                />
                <p className="text-[11px] text-[#64748B] dark:text-[#737373] mt-1.5">
                  Members will receive automated warnings when spending reaches 70% and 100% of this budget.
                </p>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="clay-btn-secondary px-3.5 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBudget}
                  className="clay-btn-primary px-4 py-2 text-xs font-bold disabled:opacity-50"
                >
                  {isUpdatingBudget ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
