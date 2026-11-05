import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeroIllustration } from '../components/illustrations/HeroIllustration';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  Wallet,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Bot,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password, rememberMe });
      navigate(returnTo || '/dashboard');
    } catch (err: any) {
      if (err.data?.requiresVerification) {
        if (err.data.signupToken) {
          sessionStorage.setItem('splitsmart_signup_token', err.data.signupToken);
        }
        if (err.data.email) {
          sessionStorage.setItem('splitsmart_signup_email', err.data.email);
        }
        if (err.data.userId) {
          sessionStorage.setItem('splitsmart_signup_userid', err.data.userId);
        }
        navigate(`/signup?verifyEmail=${encodeURIComponent(err.data.email)}&userId=${err.data.userId}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`);
      } else {
        setErrorMessage(err.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex flex-col justify-between selection:bg-[#BFE9FF] selection:text-[#10274A] dark:selection:bg-[#2589FF]/30 dark:selection:text-[#F5F5F5] transition-colors">
      <header className="px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center shadow-clay-btn group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-[#10274A] dark:text-[#F5F5F5]">
              SplitSmart<span className="text-[#1685F8] dark:text-[#2589FF]"> AI</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Link
            to="/"
            className="text-xs sm:text-sm font-bold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="w-full max-w-[500px]">
              <HeroIllustration compact={true} />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#10274A] dark:text-[#F5F5F5]">
                Split Expenses.
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1685F8] dark:text-[#2589FF]">
                Smarter Together.
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#64748B] dark:text-[#A1A1AA] max-w-lg leading-relaxed">
              AI-powered expense splitting with real payments via PayPal. Plan, track, and settle with ease — for trips, roommates and more.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-[#10274A] dark:text-[#F5F5F5] pt-2">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] shadow-sm dark:shadow-none">
                <div className="w-5 h-5 rounded-full bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] flex items-center justify-center">
                  <Bot className="w-3 h-3" />
                </div>
                <span>AI Assistant</span>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] shadow-sm dark:shadow-none">
                <div className="w-5 h-5 rounded-full bg-[#DDF8EE] text-[#16B890] dark:bg-[#141414] dark:text-[#34D399] flex items-center justify-center">
                  <CreditCard className="w-3 h-3" />
                </div>
                <span>PayPal Payments</span>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] shadow-sm dark:shadow-none">
                <div className="w-5 h-5 rounded-full bg-[#E9F5FE] text-[#1685F8] dark:bg-[#141414] dark:text-[#2589FF] flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span>Secure & Private</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[440px] bg-white dark:bg-[#101010] rounded-[28px] p-8 sm:p-10 shadow-clay-card dark:shadow-none border border-[#D8E9FA] dark:border-[#303030] relative transition-colors">
              <div className="text-center mb-7">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white shadow-clay-btn mb-4">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                  Welcome back! 👋
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-1.5">
                  Log in to continue managing your shared expenses.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#FFE9EC] dark:bg-[#FB7185]/10 border border-red-200 dark:border-[#FB7185]/30 flex items-start space-x-2.5 text-xs text-red-600 dark:text-[#FB7185] font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="clay-input w-full px-4 py-3 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="clay-input w-full px-4 py-3 pr-10 text-xs sm:text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#737373] hover:text-[#10274A] dark:hover:text-[#F5F5F5]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded text-[#1685F8] dark:text-[#2589FF] focus:ring-[#1685F8] dark:focus:ring-[#2589FF] w-4 h-4 border-[#D8E9FA] dark:border-[#303030] dark:bg-[#0D0D0D]"
                    />
                    <span className="text-[#64748B] dark:text-[#A1A1AA] font-medium">Remember me</span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="font-bold text-[#1685F8] dark:text-[#2589FF] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 mt-2 shadow-clay-btn"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Log In</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D8E9FA] dark:border-[#303030]" />
                </div>
                <span className="relative bg-white dark:bg-[#101010] px-3 text-xs text-[#64748B] dark:text-[#737373] font-semibold uppercase">
                  or
                </span>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() =>
                    alert('Google OAuth integration can be linked in production by configuring GOOGLE_CLIENT_ID in the backend environment.')
                  }
                  className="w-full py-3 px-4 rounded-2xl border border-[#D8E9FA] dark:border-[#303030] bg-white dark:bg-[#101010] hover:bg-slate-50 dark:hover:bg-[#141414] text-xs sm:text-sm font-bold text-[#10274A] dark:text-[#F5F5F5] flex items-center justify-center space-x-2.5 shadow-sm dark:shadow-none transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="mt-7 text-center text-xs text-[#64748B] dark:text-[#737373]">
                <span>Don't have an account? </span>
                <Link
                  to={returnTo ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : '/signup'}
                  className="font-bold text-[#1685F8] dark:text-[#2589FF] hover:underline"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#64748B] dark:text-[#737373]">
        © 2026 SplitSmart AI. PayPal AI Hackathon.
      </footer>
    </div>
  );
};
