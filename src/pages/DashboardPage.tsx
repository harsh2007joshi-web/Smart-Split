import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { DashboardData, Group } from '../types';
import { api } from '../services/api';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  CreditCard,
  Sparkles,
  TrendingUp,
  Plus,
  Scale,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [dashRes, groupsRes] = await Promise.all([
        api.getDashboard(),
        api.getGroups(),
      ]);
      setDashboardData(dashRes);
      setAllGroups(groupsRes.groups || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fmt = (val?: number) => {
    if (val === undefined || isNaN(val)) return '0';
    return val.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                  Good Morning, {user?.name?.split(' ')[0] || 'Friend'} 👋
                </h1>
                {user?.username && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#E9F5FE] dark:bg-[#141414] text-[#1685F8] dark:text-[#2589FF] font-mono text-xs font-bold border border-[#D8E9FA] dark:border-[#303030]">
                    <span>{user.username}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.username);
                        setCopiedUser(true);
                        setTimeout(() => setCopiedUser(false), 2000);
                      }}
                      className="hover:opacity-75"
                      title="Copy username"
                    >
                      {copiedUser ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                Here's your real-time financial overview and group settlements.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="clay-btn-primary px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-clay-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>

              <Link
                to="/settlements"
                className="clay-btn-secondary px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center space-x-1.5"
              >
                <Scale className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                <span>Settle Up</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="clay-card-hover p-6 bg-white dark:bg-[#101010] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#737373]">
                  Total Spent
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] dark:border dark:border-[#303030] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5]">
                  ₹{fmt(dashboardData?.totalSpent)}
                </div>
                <div className="flex items-center space-x-1 text-[11px] font-semibold text-[#16B890] dark:text-[#34D399] mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Across all your groups</span>
                </div>
              </div>
            </div>

            <div className="clay-card-hover p-6 bg-white dark:bg-[#101010] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#737373]">
                  You Owe
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FFE9EC] text-[#EF4444] dark:bg-[#141414] dark:text-[#FB7185] dark:border dark:border-[#303030] flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black text-[#EF4444] dark:text-[#FB7185]">
                  ₹{fmt(dashboardData?.youOwe)}
                </div>
                <div className="text-[11px] font-semibold text-[#64748B] dark:text-[#A1A1AA] mt-1">
                  {dashboardData?.youOwe && dashboardData.youOwe > 0 ? (
                    <Link to="/settlements" className="text-[#1685F8] dark:text-[#2589FF] hover:underline font-bold">
                      Pay via PayPal / Card →
                    </Link>
                  ) : (
                    <span className="text-[#16B890] dark:text-[#34D399] font-bold">Zero pending debts ✨</span>
                  )}
                </div>
              </div>
            </div>

            <div className="clay-card-hover p-6 bg-white dark:bg-[#101010] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#737373]">
                  You Are Owed
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#DDF8EE] text-[#16B890] dark:bg-[#141414] dark:text-[#34D399] dark:border dark:border-[#303030] flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black text-[#16B890] dark:text-[#34D399]">
                  ₹{fmt(dashboardData?.youAreOwed)}
                </div>
                <div className="text-[11px] font-semibold text-[#64748B] dark:text-[#A1A1AA] mt-1">
                  {dashboardData?.youAreOwed && dashboardData.youAreOwed > 0 ? (
                    <Link to="/settlements" className="text-[#1685F8] dark:text-[#2589FF] hover:underline font-bold">
                      Send payment reminders →
                    </Link>
                  ) : (
                    <span className="dark:text-[#737373]">All claims settled</span>
                  )}
                </div>
              </div>
            </div>

            <div className="clay-card-hover p-6 bg-white dark:bg-[#101010] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#737373]">
                  Active Groups
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] dark:border dark:border-[#303030] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5]">
                  {dashboardData?.totalGroups || 0}
                </div>
                <div className="text-[11px] font-semibold text-[#64748B] dark:text-[#A1A1AA] mt-1">
                  <Link to="/groups" className="text-[#1685F8] dark:text-[#2589FF] hover:underline font-bold">
                    Manage shared circles →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5]">Recent Groups</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#737373]">Your active expense-sharing circles</p>
                </div>
                <Link
                  to="/groups"
                  className="text-xs font-bold text-[#1685F8] dark:text-[#2589FF] hover:underline flex items-center space-x-1"
                >
                  <span>See All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3.5">
                {(!dashboardData?.recentGroups || dashboardData.recentGroups.length === 0) ? (
                  <div className="clay-card p-8 text-center bg-white dark:bg-[#101010] dark:border-[#303030]">
                    <p className="text-sm text-[#64748B] dark:text-[#737373]">No groups found.</p>
                    <Link
                      to="/groups"
                      className="mt-3 inline-block text-xs font-bold text-[#1685F8] dark:text-[#2589FF] underline"
                    >
                      + Create your first group
                    </Link>
                  </div>
                ) : (
                  dashboardData.recentGroups.map(group => (
                    <div
                      key={group.id}
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="clay-card-hover p-4 sm:p-5 bg-white dark:bg-[#101010] dark:border-[#303030] dark:hover:bg-[#141414] cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1685F8]/15 to-[#BFE9FF]/30 text-[#1685F8] dark:from-[#2589FF]/15 dark:to-[#141414] dark:text-[#2589FF] flex items-center justify-center font-bold text-lg border border-[#BFE9FF]/40 dark:border-[#303030]">
                          {group.category === 'Travel' && '✈️'}
                          {group.category === 'Entertainment' && '🎟️'}
                          {group.category === 'Utilities' && '🏠'}
                          {group.category === 'Food' && '🍽️'}
                          {!['Travel', 'Entertainment', 'Utilities', 'Food'].includes(group.category) && '👥'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">{group.name}</h4>
                          <p className="text-xs text-[#64748B] dark:text-[#737373]">
                            {group.members.length} members • {group.recentExpensesCount || 0} expenses
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm sm:text-base font-extrabold text-[#1685F8] dark:text-[#2589FF]">
                          {group.currency} {fmt(group.totalSpent)}
                        </div>
                        <span className="text-[10px] font-semibold text-[#16B890] dark:text-[#34D399] px-2 py-0.5 rounded-full bg-[#DDF8EE] dark:bg-[#34D399]/15">
                          Active
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5]">Spending by Category</h3>
                <p className="text-xs text-[#64748B] dark:text-[#737373]">Distribution of group expenditures</p>
              </div>

              <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030] relative flex flex-col items-center justify-center min-h-[340px]">
                {dashboardData?.categorySpending && dashboardData.categorySpending.some(c => c.amount > 0) ? (
                  <>
                    <div className="w-full h-56 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.categorySpending.filter(c => c.amount > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="amount"
                          >
                            {dashboardData.categorySpending.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isDark ? '#101010' : '#FFFFFF',
                              borderColor: isDark ? '#303030' : '#D8E9FA',
                              borderRadius: '16px',
                              color: isDark ? '#F5F5F5' : '#10274A',
                              boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.08)',
                            }}
                            itemStyle={{ color: isDark ? '#F5F5F5' : '#10274A' }}
                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#737373]">Total</span>
                        <span className="text-base sm:text-lg font-black text-[#10274A] dark:text-[#F5F5F5]">
                          ₹{fmt(dashboardData.totalSpent)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-[#D8E9FA]/60 dark:border-[#303030] text-xs">
                      {dashboardData.categorySpending.map(cat => (
                        <div key={cat.category} className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-[#64748B] dark:text-[#A1A1AA] truncate">{cat.category}</span>
                          <span className="font-bold text-[#10274A] dark:text-[#F5F5F5] ml-auto">{cat.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <PieChart className="w-12 h-12 text-[#BFE9FF] dark:text-[#303030] mx-auto mb-2" />
                    <p className="text-xs text-[#64748B] dark:text-[#737373]">No expense categories logged yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-[26px] bg-[#DDF8EE] dark:bg-[#101010] border border-[#16B890]/30 dark:border-[#303030] shadow-clay-card dark:shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#141414] text-[#16B890] dark:text-[#34D399] dark:border dark:border-[#303030] flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-base font-extrabold text-[#10274A] dark:text-[#F5F5F5]">
                    {dashboardData?.aiInsight?.title || 'AI Insight'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#141414] text-[#16B890] dark:text-[#34D399] text-[10px] font-bold border border-[#16B890]/20 dark:border-[#303030]">
                    {dashboardData?.aiInsight?.badge || 'Smart Optimization'}
                  </span>
                </div>
                <p className="text-sm text-[#10274A] dark:text-[#F5F5F5] font-semibold mt-1">
                  {dashboardData?.aiInsight?.description || 'Food is your biggest expense this month.'}
                </p>
                <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                  {dashboardData?.aiInsight?.recommendation}
                </p>
              </div>
            </div>

            <Link
              to="/ai-assistant"
              className="clay-btn-primary px-5 py-2.5 text-xs font-bold whitespace-nowrap shrink-0 shadow-sm"
            >
              Ask AI Assistant →
            </Link>
          </div>

          <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border-[#303030] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5]">Recent Activity</h3>
                <p className="text-xs text-[#64748B] dark:text-[#737373]">Latest expenses and payments across your groups</p>
              </div>
              <Link to="/transactions" className="text-xs font-bold text-[#1685F8] dark:text-[#2589FF] hover:underline">
                View History →
              </Link>
            </div>

            <div className="divide-y divide-[#D8E9FA]/60 dark:divide-[#303030]">
              {(!dashboardData?.recentActivities || dashboardData.recentActivities.length === 0) ? (
                <div className="py-6 text-center text-xs text-[#64748B] dark:text-[#737373]">
                  No recent activities recorded yet.
                </div>
              ) : (
                dashboardData.recentActivities.map(act => (
                  <div key={act.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] dark:border dark:border-[#303030] flex items-center justify-center">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                          {act.description}
                        </div>
                        <div className="text-[10px] text-[#64748B] dark:text-[#737373]">{act.time}</div>
                      </div>
                    </div>

                    {act.amount && (
                      <div className="text-xs sm:text-sm font-bold text-[#1685F8] dark:text-[#2589FF]">
                        {act.currency || 'INR'} {fmt(act.amount)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseAdded={fetchDashboard}
        groups={allGroups}
      />
    </div>
  );
};
