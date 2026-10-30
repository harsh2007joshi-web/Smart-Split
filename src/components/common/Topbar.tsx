import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Search, Bell, Menu, Plus, CheckCircle, ExternalLink, X, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShareLinkModal } from './ShareLinkModal';
import { ThemeToggle } from './ThemeToggle';

interface TopbarProps {
  onToggleSidebar?: () => void;
  onOpenAddExpense?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, onOpenAddExpense }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/90 dark:bg-[#080808]/95 backdrop-blur-md border-b border-[#D8E9FA] dark:border-[#303030] px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-[#64748B] hover:text-[#10274A] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F5] rounded-xl hover:bg-slate-100 dark:hover:bg-[#141414]"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses, groups, members..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] rounded-xl focus:outline-none focus:border-[#1685F8] dark:focus:border-[#2589FF] focus:bg-white dark:focus:bg-[#101010] transition-all text-[#10274A] dark:text-[#F5F5F5] placeholder:text-[#64748B] dark:placeholder:text-[#737373]"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, ThemeToggle & Profile Pill */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Share Public Link / Email to Friend Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="clay-btn-secondary px-3 py-2 text-xs font-bold flex items-center space-x-1.5"
          title="Share link with friends or email directly"
        >
          <Share2 className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
          <span className="hidden sm:inline">Share Link</span>
        </button>

        {onOpenAddExpense && (
          <button
            onClick={onOpenAddExpense}
            className="clay-btn-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        )}

        {/* Minimalist Theme Toggle in Top Right */}
        <ThemeToggle />

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-[#D8E9FA] dark:border-[#303030] bg-white dark:bg-[#101010] hover:bg-[#F1F9FF] dark:hover:bg-[#141414] text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1685F8] dark:bg-[#2589FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#101010]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#101010] rounded-3xl shadow-clay-float dark:shadow-2xl border border-[#D8E9FA] dark:border-[#303030] overflow-hidden z-50">
              <div className="p-4 border-b border-[#D8E9FA]/60 dark:border-[#303030] flex items-center justify-between bg-[#F1F9FF] dark:bg-[#0B0B0B]">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-[#10274A] dark:text-[#F5F5F5]">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E9F5FE] dark:bg-[#2589FF]/15 text-[#1685F8] dark:text-[#2589FF] text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-[#1685F8] dark:text-[#2589FF] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#D8E9FA]/50 dark:divide-[#303030]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#64748B] dark:text-[#737373]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3.5 hover:bg-[#F1F9FF] dark:hover:bg-[#141414] transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-blue-50/40 dark:bg-[#2589FF]/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-xs font-bold text-[#10274A] dark:text-[#F5F5F5]">{n.title}</div>
                        <span className="text-[10px] text-[#64748B] dark:text-[#737373]">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-[#0B0B0B] text-center border-t border-[#D8E9FA]/60 dark:border-[#303030]">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-[#1685F8] dark:text-[#2589FF] hover:underline"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <Link
          to="/profile"
          className="flex items-center space-x-2.5 p-1.5 sm:pr-3 rounded-2xl border border-[#D8E9FA] dark:border-[#303030] bg-white dark:bg-[#101010] hover:bg-[#F1F9FF] dark:hover:bg-[#141414] transition-colors"
        >
          <div
            className="w-8 h-8 rounded-full bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] border border-[#1685F8] dark:border-[#2589FF] flex items-center justify-center text-xs font-black uppercase select-none flex-shrink-0"
            title={user?.name || 'User'}
          >
            {(user?.name || 'User').trim().charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] leading-tight">
              {user?.name || 'Rahul Sharma'}
            </div>
            <div className="text-[10px] text-[#16B890] dark:text-[#34D399] font-semibold">Active Member</div>
          </div>
        </Link>
      </div>

      <ShareLinkModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </header>
  );
};
