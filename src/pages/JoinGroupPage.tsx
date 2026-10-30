import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { RobotIllustration } from '../components/illustrations/RobotIllustration';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  Wallet,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const JoinGroupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, demoLogin } = useAuth();

  const token = searchParams.get('token') || '';
  const groupId = searchParams.get('groupId') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [joinedGroup, setJoinedGroup] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoin = async () => {
    if (!token) {
      setErrorMessage('Invalid invitation link.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.joinGroup(token);
      setJoinedGroup(res.group);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not join group. The invitation may be expired or already used.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      handleJoin();
    }
  }, [isAuthenticated, token]);

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex flex-col justify-between selection:bg-[#BFE9FF] dark:selection:bg-[#2589FF]/30">
      {/* Header */}
      <header className="px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center shadow-clay-btn">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#10274A] dark:text-[#F5F5F5]">
            SplitSmart<span className="text-[#1685F8] dark:text-[#2589FF]"> AI</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Join Card */}
      <main className="max-w-md mx-auto px-4 py-8 sm:py-12 w-full flex-1 flex items-center justify-center">
        <div className="w-full bg-white dark:bg-[#101010] rounded-[28px] p-8 sm:p-10 shadow-clay-card border border-[#D8E9FA] dark:border-[#303030] text-center space-y-6">
          <div className="flex justify-center">
            <RobotIllustration size={100} glow={false} />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#DDF8EE] dark:bg-[#0D1F17] text-[#16B890] dark:text-[#34D399] border border-[#16B890]/30 dark:border-[#34D399]/30 inline-block mb-2">
              Trip Group Invitation
            </span>
            <h2 className="text-2xl font-black text-[#10274A] dark:text-[#F5F5F5]">
              You've Been Invited to SplitSmart AI!
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-1.5">
              Join your friends, track shared expenses, and split bills easily from any device.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FFE9EC] dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 font-medium flex items-center space-x-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* If already joined */}
          {joinedGroup ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#DDF8EE] dark:bg-[#0D1F17] border border-[#16B890]/40 dark:border-[#34D399]/40 text-left flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-[#16B890] dark:text-[#34D399] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                    Joined "{joinedGroup.name}"!
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                    You can now add expenses, split bills, and settle balances from your device.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/groups/${joinedGroup.id}`)}
                className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 shadow-clay-btn"
              >
                <span>Go to Trip Group</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {isAuthenticated ? (
                <button
                  onClick={handleJoin}
                  disabled={isLoading}
                  className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 shadow-clay-btn"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Accept Invitation & Join</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <>
                  <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
                    Please log in or create an account to access the group on your device.
                  </p>
                  <Link
                    to={`/signup?returnTo=${encodeURIComponent(`/join-group?token=${token}&groupId=${groupId}`)}`}
                    className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 shadow-clay-btn"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account to Join</span>
                  </Link>

                  <Link
                    to={`/login?returnTo=${encodeURIComponent(`/join-group?token=${token}&groupId=${groupId}`)}`}
                    className="clay-btn-secondary w-full py-3 text-xs font-bold flex items-center justify-center space-x-2 dark:text-[#2589FF]"
                  >
                    <LogIn className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                    <span>Already Have an Account? Log In</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#64748B] dark:text-[#737373]">
        © 2026 SplitSmart AI • PayPal AI Hackathon
      </footer>
    </div>
  );
};
