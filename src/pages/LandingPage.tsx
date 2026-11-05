import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { HeroIllustration } from '../components/illustrations/HeroIllustration';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Users,
  Scale,
  PieChart,
  Bot,
  Zap,
  LogIn,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex flex-col justify-between">
      <Navbar />

      <section className="relative pt-8 pb-20 sm:pt-14 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#10274A] dark:text-[#F5F5F5] leading-[1.12]">
                Split Expenses. <br />
                <span className="text-[#1685F8] dark:text-[#2589FF]">Smarter Together.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] dark:text-[#A1A1AA] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                AI-powered expense splitting with real payments via PayPal. Plan, track, and settle with ease — for trips, roommates, and more.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/signup"
                  className="clay-btn-primary px-8 py-4 text-base font-extrabold w-full sm:w-auto flex items-center justify-center space-x-2 shadow-clay-btn"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/login"
                  className="clay-btn-secondary px-6 py-4 text-base font-bold w-full sm:w-auto flex items-center justify-center space-x-2 dark:text-[#2589FF]"
                >
                  <LogIn className="w-5 h-5 text-[#1685F8] dark:text-[#2589FF]" />
                  <span>Log In to Account</span>
                </Link>
              </div>

              <div className="pt-6 border-t border-[#D8E9FA]/80 dark:border-[#303030] flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-xs sm:text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span>AI Assistant</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#DDF8EE] dark:bg-[#0D1F17] text-[#16B890] dark:text-[#34D399] flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span>PayPal Payments</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-24 bg-white/60 dark:bg-[#0B0B0B] border-y border-[#D8E9FA] dark:border-[#303030]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] border border-[#BFE9FF] dark:border-[#2589FF]/30">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10274A] dark:text-[#F5F5F5] mt-3">
              Fintech Intelligence Built for Shared Life
            </h2>
            <p className="text-[#64748B] dark:text-[#A1A1AA] text-base mt-3">
              Eliminate awkward payment reminders, spreadsheet headaches, and math errors with automated debt netting and sandbox PayPal settlements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="clay-card-hover p-8 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] flex items-center justify-center mb-6 shadow-sm">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#10274A] dark:text-[#F5F5F5] mb-3">Natural Language AI</h3>
                <p className="text-sm text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
                  Type "Rahul paid ₹2,400 for dinner yesterday with Priya and Aman" and our AI instantly extracts amounts, splits, and categories.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D8E9FA] dark:border-[#303030] flex items-center text-xs font-bold text-[#1685F8] dark:text-[#2589FF]">
                <span>Try prompt assistant</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="clay-card-hover p-8 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#DDF8EE] dark:bg-[#0D1F17] text-[#16B890] dark:text-[#34D399] flex items-center justify-center mb-6 shadow-sm">
                  <Scale className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#10274A] dark:text-[#F5F5F5] mb-3">Smart Settlement Engine</h3>
                <p className="text-sm text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
                  Our mathematical debt simplification graph reduces 10 tangled multi-person debts into just 2 minimal, direct transfers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D8E9FA] dark:border-[#303030] flex items-center text-xs font-bold text-[#16B890] dark:text-[#34D399]">
                <span>Zero transaction waste</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="clay-card-hover p-8 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FFE9EC] dark:bg-[#2589FF]/10 text-[#EF4444] dark:text-[#2589FF] flex items-center justify-center mb-6 shadow-sm">
                  <CreditCard className="w-7 h-7 text-[#1685F8] dark:text-[#2589FF]" />
                </div>
                <h3 className="text-xl font-bold text-[#10274A] dark:text-[#F5F5F5] mb-3">PayPal & 3D Card Checkout</h3>
                <p className="text-sm text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
                  Pay directly via verified PayPal Sandbox or our interactive 3D card checkout with realistic CVV flip and transaction logging.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D8E9FA] dark:border-[#303030] flex items-center text-xs font-bold text-[#1685F8] dark:text-[#2589FF]">
                <span>PCI-compliant secure vault</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-[#DDF8EE] dark:bg-[#0D1F17] text-[#16B890] dark:text-[#34D399] border border-[#16B890]/30 dark:border-[#34D399]/30">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10274A] dark:text-[#F5F5F5] mt-3">
              From Shared Trip to Zero Balance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="clay-card p-8 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] relative">
              <span className="text-4xl font-black text-[#1685F8]/20 dark:text-[#2589FF]/10 absolute top-6 right-6">01</span>
              <div className="w-12 h-12 rounded-xl bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5] mb-2">Create Group & Add Bills</h4>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA]">
                Start a group for your trip, house, or project. Split equally, by percentages, or custom amounts.
              </p>
            </div>

            <div className="clay-card p-8 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] relative">
              <span className="text-4xl font-black text-[#1685F8]/20 dark:text-[#2589FF]/10 absolute top-6 right-6">02</span>
              <div className="w-12 h-12 rounded-xl bg-[#DDF8EE] dark:bg-[#0D1F17] text-[#16B890] dark:text-[#34D399] flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5] mb-2">AI Calculates Net Balances</h4>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA]">
                Our engine automatically nets what everyone paid versus what they owe, minimizing settlement transfers.
              </p>
            </div>

            <div className="clay-card p-8 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] relative">
              <span className="text-4xl font-black text-[#1685F8]/20 dark:text-[#2589FF]/10 absolute top-6 right-6">03</span>
              <div className="w-12 h-12 rounded-xl bg-[#FFE9EC] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-[#10274A] dark:text-[#F5F5F5] mb-2">One-Click PayPal Settlement</h4>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA]">
                Settle up directly using PayPal sandbox or Debit/Credit card with verified server receipts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gradient-to-tr from-[#10274A] to-[#1685F8] dark:from-[#0B0B0B] dark:to-[#162740] text-white dark:border-y dark:border-[#303030]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to split expenses the smarter way?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto">
            Join SplitSmart AI today. Perfect for roommates, weekend trips, and project collaborations.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-2xl bg-white text-[#1685F8] hover:bg-blue-50 font-extrabold text-base shadow-xl transition-all"
            >
              Get Started Free Now
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-base transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-[#080808] border-t border-[#D8E9FA] dark:border-[#303030] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-[#10274A] dark:text-[#F5F5F5]">
              SplitSmart<span className="text-[#1685F8] dark:text-[#2589FF]"> AI</span>
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#737373]">
            © 2026 SplitSmart AI. Built for the PayPal AI Hackathon. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-[#64748B] dark:text-[#A1A1AA] font-semibold">
            <a href="#features" className="hover:text-[#1685F8] dark:hover:text-[#2589FF]">Privacy Policy</a>
            <a href="#features" className="hover:text-[#1685F8] dark:hover:text-[#2589FF]">Terms of Service</a>
            <a href="#features" className="hover:text-[#1685F8] dark:hover:text-[#2589FF]">Security Vault</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
