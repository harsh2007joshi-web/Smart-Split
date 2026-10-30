import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCircle2,
  Receipt,
  Users,
  Scale,
  CreditCard,
  AlertCircle,
  Check,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filtered = notifications.filter(n => (filter === 'ALL' ? true : !n.isRead));

  const getIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <CheckCircle2 className="w-5 h-5 text-[#16B890]" />;
      case 'EXPENSE':
        return <Receipt className="w-5 h-5 text-[#1685F8]" />;
      case 'SETTLEMENT':
        return <Scale className="w-5 h-5 text-amber-500" />;
      case 'INVITATION':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-[#64748B]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-8 space-y-6 max-w-4xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                Notifications
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                Activity updates, bill additions, and settlement alerts
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="flex p-1 bg-white dark:bg-[#101010] rounded-2xl border border-[#D8E9FA] dark:border-[#303030] text-xs font-bold">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filter === 'ALL'
                      ? 'bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF]'
                      : 'text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5]'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('UNREAD')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filter === 'UNREAD'
                      ? 'bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF]'
                      : 'text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5]'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="clay-btn-secondary px-3.5 py-1.5 text-xs font-bold text-[#1685F8] dark:text-[#2589FF]"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="clay-card bg-white dark:bg-[#101010] dark:border dark:border-[#303030] divide-y divide-[#D8E9FA]/60 dark:divide-[#303030] overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-[#64748B] dark:text-[#737373]">
                <Bell className="w-10 h-10 text-slate-300 dark:text-[#303030] mx-auto mb-2" />
                <p className="text-sm font-semibold">No notifications to display.</p>
              </div>
            ) : (
              filtered.map(n => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#F1F9FF] dark:hover:bg-[#141414] transition-colors ${
                    !n.isRead ? 'bg-blue-50/30 dark:bg-[#2589FF]/5' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">{n.title}</h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#1685F8] dark:bg-[#2589FF]" />
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] mt-1 leading-relaxed">{n.message}</p>
                      {n.link && (
                        <Link
                          to={n.link}
                          className="inline-block mt-2 text-xs font-bold text-[#1685F8] dark:text-[#2589FF] hover:underline"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-[#64748B] dark:text-[#737373] whitespace-nowrap shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
