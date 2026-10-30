import React from 'react';
import { RobotIllustration } from './RobotIllustration';
import { CreditCard, Wallet, Users, ArrowUpRight, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const HeroIllustration: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className="relative w-full max-w-[620px] aspect-[4/3] flex items-center justify-center select-none">
      {/* Background Ambient Glows & Soft Spheres */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-[#BFE9FF]/60 via-[#E9F5FE] to-[#DDF8EE]/40 rounded-full blur-3xl -z-10" />
      <div className="absolute top-8 left-12 w-20 h-20 bg-[#1685F8]/10 rounded-full blur-xl -z-10" />
      <div className="absolute bottom-10 right-10 w-28 h-28 bg-[#16B890]/15 rounded-full blur-2xl -z-10" />

      {/* Atmospheric Floating Clay Circles */}
      <div className="absolute top-4 right-1/4 w-8 h-8 rounded-full bg-gradient-to-br from-white to-[#BFE9FF] shadow-md animate-float-slow -z-10 border border-white/60" />
      <div className="absolute bottom-12 left-1/4 w-6 h-6 rounded-full bg-gradient-to-br from-[#16B890]/40 to-[#16B890] shadow-sm animate-float-delayed -z-10" />
      <div className="absolute top-1/3 left-6 w-4 h-4 rounded-full bg-[#1685F8] opacity-60 animate-bounce -z-10" />

      {/* Central Friendly 3D Robot Mascot */}
      <div className="relative z-20 scale-100 sm:scale-110 drop-shadow-2xl">
        <RobotIllustration size={compact ? 190 : 230} glow={true} />
      </div>

      {/* 1. FLOATING 3D WALLET & COINS (Top Left) */}
      <div className="absolute top-0 -left-4 sm:left-2 z-30 animate-float-slow bg-gradient-to-br from-[#1685F8] to-[#0E6FD8] text-white p-3.5 sm:p-4 rounded-2xl shadow-clay-card border border-white/30 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-blue-100">Smart Wallet</div>
            <div className="text-base sm:text-lg font-bold tracking-tight">₹48,250</div>
          </div>
        </div>
        {/* Little Floating Coin */}
        <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 border-2 border-white shadow-md flex items-center justify-center font-bold text-[10px] text-amber-900">
          ₹
        </div>
      </div>

      {/* 2. FLOATING VIRTUAL PAYMENT CARD (Top Right) */}
      <div className="absolute top-6 right-0 sm:-right-2 z-30 animate-float-delayed bg-gradient-to-br from-[#10274A] via-[#1A3B6B] to-[#0D1F3C] text-white p-4 rounded-2xl shadow-clay-card border border-white/20 w-44 sm:w-48">
        <div className="flex justify-between items-center mb-3">
          <div className="w-7 h-5 rounded bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm" />
          <span className="text-[10px] font-bold tracking-widest text-[#BFE9FF]">PAYPAL</span>
        </div>
        <div className="font-mono text-xs tracking-wider text-slate-300 mb-2">•••• 8849</div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[8px] uppercase tracking-wider text-slate-400">Cardholder</div>
            <div className="text-[11px] font-semibold text-white">Rahul Sharma</div>
          </div>
          <div className="text-[9px] font-mono text-[#BFE9FF]">09/29</div>
        </div>
      </div>

      {/* 3. FLOATING GROUP BALANCE CARD (Bottom Left) */}
      <div className="absolute bottom-2 -left-2 sm:left-4 z-30 animate-float-delayed bg-white/95 dark:bg-[#101010]/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-clay-card dark:shadow-none border border-[#D8E9FA] dark:border-[#303030] max-w-[210px] transition-colors">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#DDF8EE] dark:bg-[#141414] text-[#16B890] dark:text-[#34D399] flex items-center justify-center font-bold text-xs dark:border dark:border-[#303030]">
            🌴
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] truncate">Goa Trip 2026</h4>
            <p className="text-[10px] text-[#64748B] dark:text-[#737373]">4 active members</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[#D8E9FA]/60 dark:border-[#303030]">
          <div className="text-[10px] text-[#64748B] dark:text-[#737373]">Total Spent</div>
          <div className="text-xs font-bold text-[#1685F8] dark:text-[#2589FF]">₹24,800</div>
        </div>
        {/* Avatars row */}
        <div className="flex -space-x-1.5 mt-2">
          <img className="w-5 h-5 rounded-full border border-white dark:border-[#101010]" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80" alt="Rahul" />
          <img className="w-5 h-5 rounded-full border border-white dark:border-[#101010]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80" alt="Priya" />
          <img className="w-5 h-5 rounded-full border border-white dark:border-[#101010]" src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&auto=format&fit=crop&q=80" alt="Aman" />
          <div className="w-5 h-5 rounded-full bg-[#E9F5FE] dark:bg-[#141414] text-[#1685F8] dark:text-[#2589FF] border border-white dark:border-[#101010] flex items-center justify-center text-[9px] font-bold">
            +1
          </div>
        </div>
      </div>

      {/* 4. SETTLEMENT VERIFIED PILL (Bottom Right) */}
      <div className="absolute bottom-6 right-2 sm:right-6 z-30 animate-float-slow bg-white/95 dark:bg-[#101010]/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-clay-card dark:shadow-none border border-[#D8E9FA] dark:border-[#303030] flex items-center space-x-3 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-[#DDF8EE] dark:bg-[#141414] text-[#16B890] dark:text-[#34D399] dark:border dark:border-[#303030] flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#16B890] dark:text-[#34D399]">Settled via PayPal</div>
          <div className="text-xs font-bold text-[#10274A] dark:text-[#F5F5F5]">₹3,500 Cleared</div>
        </div>
      </div>
    </div>
  );
};
