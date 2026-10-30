import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Sparkles, LogIn, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, demoLogin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#F1F9FF]/85 dark:bg-[#080808]/90 border-b border-[#D8E9FA] dark:border-[#303030] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center shadow-clay-btn group-hover:scale-105 transition-transform">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#10274A] dark:text-[#F5F5F5]">
                SplitSmart<span className="text-[#1685F8] dark:text-[#2589FF]"> AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#DDF8EE] text-[#16B890] dark:bg-[#34D399]/15 dark:text-[#34D399] border border-[#16B890]/30 dark:border-[#34D399]/30 uppercase tracking-wider">
                PayPal AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#64748B] dark:text-[#737373] hidden sm:block">Split Expenses. Smarter Together.</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] transition-colors">
            How It Works
          </a>
          <a href="#ai-assistant" className="text-sm font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] transition-colors flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1685F8] dark:text-[#2589FF]" />
            <span>AI Assistant</span>
          </a>
          <a href="#smart-settlement" className="text-sm font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] transition-colors">
            Smart Settlement
          </a>
          <a href="#security" className="text-sm font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] transition-colors">
            Security
          </a>
        </nav>

        {/* Right CTA Actions & Theme Toggle */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Top-Right Theme Toggle */}
          <ThemeToggle />

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="clay-btn-primary px-5 py-2.5 text-sm font-bold flex items-center space-x-2"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={async () => {
                  await demoLogin();
                  navigate('/dashboard');
                }}
                className="hidden lg:inline-flex items-center space-x-1 text-xs font-semibold px-3 py-2 rounded-xl bg-[#DDF8EE] text-[#16B890] dark:bg-[#101010] dark:text-[#34D399] dark:border dark:border-[#303030] hover:bg-[#c9f3e4] dark:hover:bg-[#161616] transition-colors border border-[#16B890]/30"
                title="Instant access with preloaded Goa Trip & Roommates data"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Tour</span>
              </button>

              <Link
                to="/login"
                className="clay-btn-secondary px-4 py-2.5 text-sm font-bold flex items-center space-x-1.5"
              >
                <LogIn className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                <span>Log In</span>
              </Link>

              <Link
                to="/signup"
                className="clay-btn-primary px-5 py-2.5 text-sm font-bold flex items-center space-x-1.5"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
