import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  Users,
  Bot,
  Scale,
  Receipt,
  PieChart,
  Bell,
  UserCheck,
  LogOut,
  Wallet,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';
import { api } from '../../services/api';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const { user, logout, demoLogin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Groups', path: '/groups', icon: Users },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot, badge: 'AI' },
    { label: 'Settlements', path: '/settlements', icon: Scale },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { label: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
    { label: 'Profile', path: '/profile', icon: UserCheck },
  ];

  const handleResetDemo = async () => {
    if (window.confirm('Reset demo data to initial hackathon state?')) {
      await api.resetDemoData();
      window.location.reload();
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#0B0B0B] border-r border-[#D8E9FA] dark:border-[#303030] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div>
        {/* Top Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#D8E9FA]/60 dark:border-[#303030]">
          <NavLink to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center shadow-clay-btn">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#10274A] dark:text-[#F5F5F5]">
                SplitSmart<span className="text-[#1685F8] dark:text-[#2589FF]"> AI</span>
              </span>
              <span className="block text-[10px] text-[#64748B] dark:text-[#737373] font-medium tracking-wide">
                Fintech Platform
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E9F5FE] text-[#1685F8] shadow-sm border border-[#BFE9FF] dark:bg-[#101010] dark:text-[#2589FF] dark:border-[#303030]'
                      : 'text-[#64748B] hover:text-[#10274A] hover:bg-slate-50 dark:text-[#A1A1AA] dark:hover:text-[#F5F5F5] dark:hover:bg-[#101010]'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#DDF8EE] text-[#16B890] dark:bg-[#2589FF]/15 dark:text-[#2589FF]">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#1685F8] dark:bg-[#2589FF] text-white text-[10px] font-bold flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions Card */}
      <div className="p-4 border-t border-[#D8E9FA]/60 dark:border-[#303030] space-y-3">
        {/* Demo reset / reload */}
        <div className="flex items-center justify-between px-2 text-[11px] text-[#64748B] dark:text-[#737373]">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#16B890] dark:bg-[#34D399] animate-pulse" />
            <span>Sandbox Mode</span>
          </span>
          <button
            onClick={handleResetDemo}
            className="hover:text-[#1685F8] dark:hover:text-[#2589FF] font-medium flex items-center space-x-1"
            title="Reset sample groups and expenses"
          >
            <RefreshCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-2xl bg-[#F1F9FF] dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <div
              className="w-9 h-9 rounded-full bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] border border-[#1685F8] dark:border-[#2589FF] flex items-center justify-center text-sm font-black uppercase flex-shrink-0 select-none"
              title={user?.name || 'User'}
            >
              {(user?.name || 'User').trim().charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] truncate">
                {user?.name || 'Rahul Sharma'}
              </div>
              <div className="text-[10px] text-[#64748B] dark:text-[#737373] truncate">
                {user?.email || 'user@example.com'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 text-[#64748B] hover:text-red-500 dark:text-[#A1A1AA] dark:hover:text-[#FB7185] rounded-lg hover:bg-white dark:hover:bg-[#181818] transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
