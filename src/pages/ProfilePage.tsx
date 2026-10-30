import React, { useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  ShieldCheck,
  Mail,
  Calendar,
  RefreshCcw,
  LogOut,
  CreditCard,
  Lock,
  CheckCircle,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleResetDemoData = async () => {
    if (window.confirm('Reset demo database to fresh initial hackathon state? (Goa Trip 2026, College Friends, Roommates)')) {
      setIsResetting(true);
      try {
        await api.resetDemoData();
        setResetMessage('Demo database successfully re-seeded with initial hackathon data.');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err: any) {
        alert(err.message || 'Failed to reset demo data');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-8 space-y-6 max-w-4xl w-full mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
              My Profile & Account
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
              Account credentials, verification status, and workspace settings
            </p>
          </div>

          {resetMessage && (
            <div className="p-3.5 rounded-2xl bg-[#DDF8EE] dark:bg-[#0D1F17] border border-[#16B890]/40 dark:border-[#34D399]/40 text-xs text-[#16B890] dark:text-[#34D399] font-bold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{resetMessage}</span>
            </div>
          )}

          {/* User Profile Card */}
          <div className="clay-card p-6 sm:p-8 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
              <div
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E9F5FE] to-[#D8E9FA] dark:from-[#141414] dark:to-[#1E293B] border-2 border-[#1685F8] dark:border-[#2589FF] shadow-md flex items-center justify-center text-3xl font-black text-[#1685F8] dark:text-[#2589FF] uppercase select-none flex-shrink-0"
                title={user?.name || 'User Profile'}
              >
                {(user?.name || 'User').trim().charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-xl font-black text-[#10274A] dark:text-[#F5F5F5]">{user?.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DDF8EE] dark:bg-[#0D1F17] text-[#16B890] dark:text-[#34D399] text-xs font-bold border border-[#16B890]/30 dark:border-[#34D399]/30 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user?.email}</span>
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#737373] flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}</span>
                </p>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="pt-6 border-t border-[#D8E9FA]/60 dark:border-[#303030] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                <div className="text-[#64748B] dark:text-[#A1A1AA] font-semibold">User Identification ID</div>
                <div className="text-sm font-mono font-bold text-[#10274A] dark:text-[#F5F5F5] mt-1">{user?.id}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                <div className="text-[#64748B] dark:text-[#A1A1AA] font-semibold">Primary Currency Setting</div>
                <div className="text-sm font-bold text-[#1685F8] dark:text-[#2589FF] mt-1">INR (₹) Indian Rupee</div>
              </div>
            </div>
          </div>

          {/* Hackathon Demo Management Card */}
          <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] flex items-center justify-center">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">Hackathon Demo Data Management</h4>
                <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">Reset all sample trip expenses, debts, and settlements to initial demo state</p>
              </div>
            </div>

            <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
              If you made experimental expenses, modified splits, or want to showcase the default Goa Trip 2026 and Roommates records to hackathon judges, click below to restore the pristine seed state.
            </p>

            <button
              onClick={handleResetDemoData}
              disabled={isResetting}
              className="clay-btn-secondary px-4 py-2.5 text-xs font-bold text-[#1685F8] dark:text-[#2589FF] flex items-center space-x-2"
            >
              <RefreshCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo Database'}</span>
            </button>
          </div>

          {/* Security & Logout */}
          <div className="clay-card p-6 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">Sign Out of Session</h4>
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">Securely clear active JWT authorization from this device</p>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 border border-transparent dark:border-red-900/30 transition-colors flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
