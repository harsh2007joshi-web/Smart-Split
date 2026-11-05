import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { PaymentTransaction, Group } from '../types';
import { api } from '../services/api';
import { ReceiptModal, ReceiptData } from '../components/payment/ReceiptModal';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  CreditCard,
  Download,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      const [txRes, grpRes] = await Promise.all([
        api.getTransactions(),
        api.getGroups(),
      ]);
      setTransactions(txRes.transactions || []);
      setGroups(grpRes.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleOpenReceipt = async (t: PaymentTransaction) => {
    try {
      const res = await api.getReceipt(t.reference);
      if (res.receipt) {
        setSelectedReceipt(res.receipt);
        setIsReceiptOpen(true);
      }
    } catch (e) {

      setSelectedReceipt({
        receiptNumber: t.metadata?.receiptNumber || `REC-2026-${t.id.slice(-6).toUpperCase()}`,
        date: t.createdAt,
        reference: t.reference,
        payerName: t.payerName,
        recipientName: t.recipientName,
        groupName: t.groupName || 'Direct Settlement',
        amount: t.amount,
        currency: t.currency,
        method: t.method,
        status: t.status,
        verifiedStamp: t.status === 'COMPLETED' ? 'OFFICIALLY VERIFIED & SETTLED' : t.status,
      });
      setIsReceiptOpen(true);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || t.method === methodFilter;
    const matchesGroup = groupFilter === 'ALL' || t.groupId === groupFilter || t.groupName === groupFilter;

    let matchesDate = true;
    const tTime = new Date(t.createdAt).getTime();
    const now = Date.now();
    if (dateFilter === '7_DAYS') {
      matchesDate = tTime >= now - 7 * 86400000;
    } else if (dateFilter === '30_DAYS') {
      matchesDate = tTime >= now - 30 * 86400000;
    } else if (dateFilter === 'THIS_MONTH') {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      matchesDate = tTime >= startOfMonth;
    }

    const matchesSearch =
      searchTerm === '' ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.groupName && t.groupName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesMethod && matchesGroup && matchesDate && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                Transaction History
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                Verified payment receipts, settlements, and settlement audit logs
              </p>
            </div>
          </div>

          <div className="clay-card p-4 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#64748B] dark:text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference or name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="clay-input w-full pl-9 pr-3 py-2 text-xs dark:bg-[#0D0D0D] dark:border-[#303030] dark:text-[#F5F5F5]"
              />
            </div>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="clay-input px-3 py-2 text-xs font-semibold text-[#10274A] dark:text-[#F5F5F5] dark:bg-[#0D0D0D] dark:border-[#303030]"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                className="clay-input px-3 py-2 text-xs font-semibold text-[#10274A] dark:text-[#F5F5F5] dark:bg-[#0D0D0D] dark:border-[#303030]"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="PAYPAL">PayPal</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="GOOGLE_PAY">Google Pay</option>
              </select>

              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="clay-input px-3 py-2 text-xs font-semibold text-[#10274A] dark:text-[#F5F5F5] dark:bg-[#0D0D0D] dark:border-[#303030]"
              >
                <option value="ALL">All Time</option>
                <option value="7_DAYS">Last 7 Days</option>
                <option value="30_DAYS">Last 30 Days</option>
                <option value="THIS_MONTH">This Month</option>
              </select>

              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="clay-input px-3 py-2 text-xs font-semibold text-[#10274A] dark:text-[#F5F5F5] dark:bg-[#0D0D0D] dark:border-[#303030]"
              >
                <option value="ALL">All Groups</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="clay-card bg-white dark:bg-[#101010] dark:border dark:border-[#303030] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F1F9FF] dark:bg-[#0D0D0D] border-b border-[#D8E9FA] dark:border-[#303030] text-[#64748B] dark:text-[#A1A1AA] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Transaction Ref</th>
                    <th className="py-3.5 px-4">Participants</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-center">Receipt</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E9FA]/50 dark:divide-[#303030]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#64748B] dark:text-[#737373]">
                        No matching transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(t => (
                      <tr
                        key={t.id}
                        onClick={() => handleOpenReceipt(t)}
                        className="hover:bg-blue-50/30 dark:hover:bg-[#141414] transition-colors cursor-pointer"
                        title="Click to view verified payment receipt"
                      >
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#1685F8] dark:text-[#2589FF]">
                          {t.reference}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#10274A] dark:text-[#F5F5F5]">
                            {t.payerName} → {t.recipientName}
                          </div>
                          <div className="text-[10px] text-[#64748B] dark:text-[#A1A1AA]">{t.groupName || 'Direct'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#10274A] dark:text-[#F5F5F5] flex items-center space-x-1">
                            <CreditCard className="w-3.5 h-3.5 text-[#1685F8] dark:text-[#2589FF]" />
                            <span>
                              {t.method === 'PAYPAL' ? 'PayPal Sandbox' : t.method.replace('_', ' ')}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-sm text-[#10274A] dark:text-[#F5F5F5]">
                          {t.currency} {t.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] dark:text-[#A1A1AA]">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleOpenReceipt(t); }}
                            className="p-1.5 rounded-lg hover:bg-[#E9F5FE] dark:hover:bg-[#181818] text-[#1685F8] dark:text-[#2589FF] transition-colors inline-flex items-center space-x-1 text-[11px] font-bold"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          {t.status === 'COMPLETED' && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#DDF8EE] dark:bg-[#0D1F17] text-[#16B890] dark:text-[#34D399] border dark:border-[#34D399]/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Completed</span>
                            </span>
                          )}
                          {t.status === 'PENDING' && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border dark:border-amber-700/30">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                          {t.status === 'FAILED' && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFE9EC] dark:bg-red-950/20 text-red-600 dark:text-red-400 border dark:border-red-700/30">
                              <AlertCircle className="w-3 h-3" />
                              <span>Failed</span>
                            </span>
                          )}
                          {t.status === 'CANCELLED' && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#141414] text-slate-500 dark:text-[#737373] border dark:border-[#303030]">
                              <XCircle className="w-3 h-3" />
                              <span>Cancelled</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};
