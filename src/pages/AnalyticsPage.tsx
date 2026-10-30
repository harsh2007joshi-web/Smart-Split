import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  BarChart2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(res => setAnalyticsData(res))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const summary = analyticsData?.summary;
  const categories = analyticsData?.categoryBreakdown || [];
  const groups = analyticsData?.groupBreakdown || [];
  const monthly = analyticsData?.monthlySpending || [];
  const prediction = analyticsData?.spendingPrediction;

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
              Financial Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
              Live visualization of group expenditures, category allocations, and settlement trends
            </p>
          </div>

          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="clay-card p-5 bg-white dark:bg-[#101010] dark:border dark:border-[#303030]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#A1A1AA]">Total Group Volume</span>
              <div className="text-2xl font-black text-[#10274A] dark:text-[#F5F5F5] mt-2">
                ₹{(summary?.totalSpent || 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#16B890] dark:text-[#34D399] font-semibold mt-1 block">
                Across {summary?.activeGroupsCount || 0} active circles
              </span>
            </div>

            <div className="clay-card p-5 bg-white dark:bg-[#101010] dark:border dark:border-[#303030]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#A1A1AA]">You Paid Directly</span>
              <div className="text-2xl font-black text-[#1685F8] dark:text-[#2589FF] mt-2">
                ₹{(summary?.userPaidTotal || 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#64748B] dark:text-[#737373] font-semibold mt-1 block">
                Total upfront payments
              </span>
            </div>

            <div className="clay-card p-5 bg-white dark:bg-[#101010] dark:border dark:border-[#303030]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#A1A1AA]">Your Net Claim</span>
              <div className="text-2xl font-black text-[#16B890] dark:text-[#34D399] mt-2">
                +₹{(summary?.youAreOwed || 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#16B890] dark:text-[#34D399] font-semibold mt-1 block">
                To be collected
              </span>
            </div>

            <div className="clay-card p-5 bg-white dark:bg-[#101010] dark:border dark:border-[#303030]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#A1A1AA]">Your Net Payable</span>
              <div className="text-2xl font-black text-[#EF4444] dark:text-[#FB7185] mt-2">
                -₹{(summary?.youOwe || 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#EF4444] dark:text-[#FB7185] font-semibold mt-1 block">
                To be settled
              </span>
            </div>
          </div>

          {/* Monthly Spending Trend Area Chart */}
          <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">Monthly Spending Velocity</h3>
                <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">Total shared volume over time</p>
              </div>
              <div className="flex items-center space-x-1 text-xs text-[#1685F8] dark:text-[#2589FF] font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Consolidated</span>
              </div>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDark ? '#2589FF' : '#1685F8'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={isDark ? '#2589FF' : '#1685F8'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke={isDark ? '#737373' : '#64748B'} fontSize={11} tickLine={false} />
                  <YAxis stroke={isDark ? '#737373' : '#64748B'} fontSize={11} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#101010' : '#ffffff',
                      borderColor: isDark ? '#303030' : '#D8E9FA',
                      borderRadius: '12px',
                      color: isDark ? '#F5F5F5' : '#10274A',
                      fontSize: '12px',
                      boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
                    }}
                    itemStyle={{ color: isDark ? '#F5F5F5' : '#10274A' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Spent']}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={isDark ? '#2589FF' : '#1685F8'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#spendGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Spending Predictions & Forecast Card */}
          {prediction && (
            <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] dark:border dark:border-[#303030] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5] flex items-center space-x-2">
                      <span>AI Spending Forecast & Predictions</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E9F5FE] text-[#1685F8] dark:bg-[#2589FF]/15 dark:text-[#2589FF] border border-[#BFE9FF] dark:border-[#2589FF]/30">
                        Estimated
                      </span>
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
                      Transparent extrapolation based on verified expenses and daily spending velocity
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    prediction.trend === 'INCREASING'
                      ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700/40'
                      : prediction.trend === 'DECREASING'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-700/40'
                      : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-700/40'
                  }`}>
                    {prediction.trend === 'INCREASING' && '↗ Projected Upward Trend'}
                    {prediction.trend === 'DECREASING' && '↘ Projected Downward Trend'}
                    {prediction.trend === 'STABLE' && '→ Projected Stable Velocity'}
                  </span>
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                  <span className="text-xs font-semibold text-[#64748B] dark:text-[#737373]">Estimated Month-End Spending</span>
                  <div className="text-xl font-black text-[#1685F8] dark:text-[#2589FF] mt-1">
                    ₹{prediction.estimatedMonthEnd.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#737373] mt-0.5 block">
                    Based on ₹{prediction.dailyVelocity.toLocaleString()}/day over {prediction.daysRemainingInMonth} remaining days
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                  <span className="text-xs font-semibold text-[#64748B] dark:text-[#737373]">Historical Monthly Average</span>
                  <div className="text-xl font-black text-[#10274A] dark:text-[#F5F5F5] mt-1">
                    ₹{prediction.historicalAverage.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#737373] mt-0.5 block">
                    Baseline benchmark from past billing cycles
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                  <span className="text-xs font-semibold text-[#64748B] dark:text-[#737373]">Current Month Spend So Far</span>
                  <div className="text-xl font-black text-[#10274A] dark:text-[#F5F5F5] mt-1">
                    ₹{prediction.currentMonthSpent.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#16B890] dark:text-[#34D399] font-semibold mt-0.5 block">
                    Actual logged transactions
                  </span>
                </div>
              </div>

              {/* Budget Overrun Warning if applicable */}
              {prediction.budgetOverrunRisk && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/40 flex items-start space-x-2.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{prediction.budgetRiskMessage}</span>
                </div>
              )}

              {/* Disclaimer */}
              <div className="text-[11px] text-[#64748B] dark:text-[#737373] flex items-center space-x-1.5 pt-1 border-t border-[#D8E9FA]/50 dark:border-[#303030]">
                <Info className="w-3.5 h-3.5 shrink-0 text-[#1685F8] dark:text-[#2589FF]" />
                <span>{prediction.disclaimer}</span>
              </div>
            </div>
          )}

          {/* 2 Columns: Category Breakdown & Spending by Group */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Category Donut */}
            <div className="lg:col-span-6 clay-card p-6 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] space-y-4">
              <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">Category Breakdown</h3>
              <div className="w-full h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="amount"
                    >
                      {categories.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#101010' : '#ffffff',
                        borderColor: isDark ? '#303030' : '#D8E9FA',
                        borderRadius: '12px',
                        color: isDark ? '#F5F5F5' : '#10274A',
                        fontSize: '12px',
                        boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
                      }}
                      itemStyle={{ color: isDark ? '#F5F5F5' : '#10274A' }}
                      formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#D8E9FA]/60 dark:border-[#303030]">
                {categories.map((c: any) => (
                  <div key={c.category} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[#64748B] dark:text-[#A1A1AA] truncate">{c.category}</span>
                    <span className="font-bold text-[#10274A] dark:text-[#F5F5F5] ml-auto">₹{c.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending by Group Bar Chart */}
            <div className="lg:col-span-6 clay-card p-6 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] space-y-4">
              <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">Spending Across Groups</h3>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groups}>
                    <XAxis dataKey="name" stroke={isDark ? '#737373' : '#64748B'} fontSize={11} tickLine={false} />
                    <YAxis stroke={isDark ? '#737373' : '#64748B'} fontSize={11} tickLine={false} tickFormatter={v => `₹${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#101010' : '#ffffff',
                        borderColor: isDark ? '#303030' : '#D8E9FA',
                        borderRadius: '12px',
                        color: isDark ? '#F5F5F5' : '#10274A',
                        fontSize: '12px',
                        boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
                      }}
                      itemStyle={{ color: isDark ? '#F5F5F5' : '#10274A' }}
                      formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Total Spent']}
                    />
                    <Bar dataKey="spent" fill={isDark ? '#2589FF' : '#1685F8'} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="divide-y divide-[#D8E9FA]/50 dark:divide-[#303030] text-xs">
                {groups.map((g: any) => (
                  <div key={g.id} className="py-2 flex justify-between items-center">
                    <span className="font-semibold text-[#10274A] dark:text-[#F5F5F5]">{g.name}</span>
                    <span className="font-bold text-[#1685F8] dark:text-[#2589FF]">₹{g.spent.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
