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
  LogOut,
  CreditCard,
  Lock,
  CheckCircle,
  Copy,
  Check,
  AtSign,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [copiedUsername, setCopiedUsername] = useState(false);

  const handleCopyUsername = () => {
    if (user?.username) {
      navigator.clipboard.writeText(user.username);
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-8 space-y-6 max-w-4xl w-full mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
              My Profile & Account
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
              Account credentials, verification status, and workspace settings
            </p>
          </div>

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
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#1685F8] dark:text-[#2589FF]">
                  <span>{user?.username || '@user'}</span>
                  <button
                    onClick={handleCopyUsername}
                    className="p-1 hover:bg-[#E9F5FE] dark:hover:bg-[#141414] rounded-md transition-colors"
                    title="Copy username"
                  >
                    {copiedUsername ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
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

            <div className="pt-6 border-t border-[#D8E9FA]/60 dark:border-[#303030] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                <div className="flex items-center justify-between text-[#64748B] dark:text-[#A1A1AA] font-semibold">
                  <span>Unique Username</span>
                  <button
                    onClick={handleCopyUsername}
                    className="text-[#1685F8] dark:text-[#2589FF] hover:underline flex items-center space-x-1 font-bold text-[11px]"
                    title="Copy unique username"
                  >
                    {copiedUsername ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUsername ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-sm font-mono font-black text-[#1685F8] dark:text-[#2589FF] mt-1">{user?.username || '@user'}</div>
                <div className="text-[10px] text-[#64748B] dark:text-[#737373] mt-1">Searchable by friends</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                <div className="text-[#64748B] dark:text-[#A1A1AA] font-semibold">User Identification ID</div>
                <div className="text-sm font-mono font-bold text-[#10274A] dark:text-[#F5F5F5] mt-1">{user?.id}</div>
                <div className="text-[10px] text-[#64748B] dark:text-[#737373] mt-1">System user ID</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
                <div className="text-[#64748B] dark:text-[#A1A1AA] font-semibold">Primary Currency Setting</div>
                <div className="text-sm font-bold text-[#1685F8] dark:text-[#2589FF] mt-1">INR (₹) Indian Rupee</div>
                <div className="text-[10px] text-[#16B890] dark:text-[#34D399] mt-1">Verified sandbox enabled</div>
              </div>
            </div>
          </div>

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
