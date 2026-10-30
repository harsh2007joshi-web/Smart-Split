import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { SuggestedSettlement } from '../types';
import { api } from '../services/api';
import {
  Scale,
  CreditCard,
  Bell,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const SettlementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suggestedSettlements, setSuggestedSettlements] = useState<any[]>([]);
  const [completedSettlements, setCompletedSettlements] = useState<any[]>([]);
  const [remindedMap, setRemindedMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettlements = async () => {
    try {
      const res = await api.getSettlements();
      setSuggestedSettlements(res.suggestedSettlements || []);
      setCompletedSettlements(res.completedSettlements || []);
    } catch (err) {
      console.error('Failed to fetch settlements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleRemind = async (settlement: any) => {
    try {
      await api.remindSettlement({
        toUserId: settlement.fromUserId,
        amount: settlement.amount,
        currency: settlement.currency,
        groupName: settlement.groupName,
      });
      setRemindedMap(prev => ({ ...prev, [settlement.id]: true }));
    } catch (err) {
      alert('Could not send reminder');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                Settlements Engine
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                Optimized mathematical debt netting with instant PayPal Sandbox & 3D Card settlements
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DDF8EE] dark:bg-[#34D399]/15 text-[#16B890] dark:text-[#34D399] border border-[#16B890]/30 dark:border-[#34D399]/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Discrepancy Reconciliation Active</span>
            </div>
          </div>

          {/* Smart Netting Explainer Card */}
          <div className="clay-card p-6 bg-gradient-to-r from-blue-500/10 via-blue-50/60 to-emerald-50/30 dark:from-[#101010] dark:via-[#141414] dark:to-[#101010] border-[#BFE9FF] dark:border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center shadow-clay-btn shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">
                  Deterministic Debt Simplification
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] max-w-2xl mt-0.5">
                  Instead of multiple participants sending money back and forth, our algorithm calculates the net balance of every member and reduces total transactions to the mathematical minimum.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Suggested Settlements */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5]">
                Suggested Transfers ({suggestedSettlements.length})
              </h2>
            </div>

            {suggestedSettlements.length === 0 ? (
              <div className="clay-card p-12 text-center bg-white dark:bg-[#101010] dark:border-[#303030]">
                <CheckCircle2 className="w-12 h-12 text-[#16B890] dark:text-[#34D399] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">All Debts Cleared</h3>
                <p className="text-xs text-[#64748B] dark:text-[#737373] mt-1">
                  There are no outstanding transfers pending in any of your groups.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {suggestedSettlements.map(s => (
                  <div
                    key={s.id}
                    className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030] flex flex-col justify-between space-y-4 border-[#D8E9FA]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-[#1685F8] dark:text-[#2589FF] px-2.5 py-1 rounded-full bg-[#E9F5FE] dark:bg-[#2589FF]/15 border border-[#BFE9FF] dark:border-[#2589FF]/30">
                          {s.groupName}
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/40">
                          Pending Settlement
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-[#FB7185]/15 text-red-600 dark:text-[#FB7185] font-bold flex items-center justify-center border border-red-100 dark:border-[#FB7185]/30">
                            {s.fromUserName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs text-[#64748B] dark:text-[#737373]">Debtor</div>
                            <div className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">{s.fromUserName}</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center px-3">
                          <span className="text-xs font-black text-[#1685F8] dark:text-[#2589FF]">pays</span>
                          <ArrowRight className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-xs text-[#64748B] dark:text-[#737373]">Recipient</div>
                            <div className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">{s.toUserName}</div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-[#34D399]/15 text-emerald-600 dark:text-[#34D399] font-bold flex items-center justify-center border border-emerald-100 dark:border-[#34D399]/30">
                            {s.toUserName.charAt(0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#D8E9FA]/60 dark:border-[#303030] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[#64748B] dark:text-[#737373]">Settlement Amount</div>
                        <div className="text-xl font-black text-[#10274A] dark:text-[#F5F5F5]">
                          {s.currency} {s.amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleRemind(s)}
                          disabled={remindedMap[s.id]}
                          className="clay-btn-secondary px-3 py-2 text-xs font-bold flex items-center space-x-1"
                        >
                          {remindedMap[s.id] ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#16B890] dark:text-[#34D399]" />
                              <span>Reminded</span>
                            </>
                          ) : (
                            <>
                              <Bell className="w-3.5 h-3.5" />
                              <span>Remind</span>
                            </>
                          )}
                        </button>

                        <Link
                          to={`/checkout?groupId=${s.groupId}&recipientId=${s.toUserId}&recipientName=${encodeURIComponent(s.toUserName)}&amount=${s.amount}&currency=${s.currency}&groupName=${encodeURIComponent(s.groupName)}&settlementId=${s.id}`}
                          className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center space-x-1 shadow-clay-btn"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Settlements Section */}
          <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030] space-y-4">
            <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">
              Verified Completed Settlements ({completedSettlements.length})
            </h3>
            {completedSettlements.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#737373] py-4 text-center">
                No settlements completed yet. Use the Pay Now button above to settle.
              </p>
            ) : (
              <div className="divide-y divide-[#D8E9FA]/60 dark:divide-[#303030]">
                {completedSettlements.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#DDF8EE] dark:bg-[#34D399]/15 text-[#16B890] dark:text-[#34D399] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                          {item.fromUserName} settled {item.currency} {Number(item.amount).toLocaleString()} with {item.toUserName}
                        </div>
                        <div className="text-[10px] text-[#64748B] dark:text-[#737373]">
                          Group: {item.groupName} • Ref: {item.paymentId || 'TXN-SETTLED'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DDF8EE] dark:bg-[#34D399]/15 text-[#16B890] dark:text-[#34D399]">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
