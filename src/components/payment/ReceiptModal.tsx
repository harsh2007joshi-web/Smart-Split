import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  reference: string;
  payerName: string;
  payerEmail?: string;
  recipientName: string;
  groupName: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  cardMasked?: string;
  verifiedStamp?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receipt }) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#101010] rounded-[28px] shadow-clay-float border border-[#D8E9FA] dark:border-[#303030] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Action Bar (hidden in print) */}
        <div className="print:hidden p-4 bg-[#F1F9FF] dark:bg-[#0D0D0D] border-b border-[#D8E9FA] dark:border-[#303030] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#1685F8] dark:text-[#2589FF]">
            <CheckCircle2 className="w-4 h-4 text-[#16B890] dark:text-[#34D399]" />
            <span>Official Settlement Receipt</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="clay-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center space-x-1 dark:text-[#2589FF]"
            >
              <Printer className="w-3.5 h-3.5 text-[#1685F8] dark:text-[#2589FF]" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5] rounded-xl hover:bg-white dark:hover:bg-[#141414]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 sm:p-10 space-y-6 text-[#10274A] dark:text-[#F5F5F5]" id="printable-receipt">
          {/* Receipt Header */}
          <div className="flex justify-between items-start border-b border-[#D8E9FA] dark:border-[#303030] pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center shadow-md font-bold">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                  SplitSmart<span className="text-[#1685F8] dark:text-[#2589FF]"> AI</span>
                </h2>
                <span className="text-[10px] text-[#64748B] dark:text-[#737373] uppercase tracking-wider font-semibold block">
                  Fintech Settlement Receipt
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-[#1685F8] dark:text-[#2589FF] font-mono">
                {receipt.receiptNumber}
              </div>
              <div className="text-[10px] text-[#64748B] dark:text-[#737373] mt-0.5">{formattedDate}</div>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-2 gap-4 py-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#737373] tracking-wider block mb-1">
                From (Payer)
              </span>
              <div className="font-bold text-sm text-[#10274A] dark:text-[#F5F5F5]">{receipt.payerName}</div>
              {receipt.payerEmail && (
                <div className="text-[11px] text-[#64748B] dark:text-[#A1A1AA] truncate">{receipt.payerEmail}</div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#737373] tracking-wider block mb-1">
                To (Recipient)
              </span>
              <div className="font-bold text-sm text-[#10274A] dark:text-[#F5F5F5]">{receipt.recipientName}</div>
              <div className="text-[11px] text-[#16B890] dark:text-[#34D399] font-semibold">Group Member</div>
            </div>
          </div>

          {/* Settlement Details */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#D8E9FA]/60 dark:border-[#303030]">
              <span className="text-[#64748B] dark:text-[#A1A1AA]">Trip / Group Circle:</span>
              <span className="font-bold text-[#10274A] dark:text-[#F5F5F5]">{receipt.groupName}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-[#D8E9FA]/60 dark:border-[#303030]">
              <span className="text-[#64748B] dark:text-[#A1A1AA]">Payment Method:</span>
              <span className="font-bold text-[#10274A] dark:text-[#F5F5F5] flex items-center space-x-1">
                <span>
                  {receipt.method === 'PAYPAL'
                    ? 'PayPal Sandbox Verified'
                    : receipt.method === 'GOOGLE_PAY'
                    ? 'Google Pay (UPI/VPA)'
                    : receipt.method.replace('_', ' ')}
                </span>
                {receipt.cardMasked && (
                  <span className="text-[10px] text-slate-400 dark:text-[#737373] font-mono">({receipt.cardMasked})</span>
                )}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-[#D8E9FA]/60 dark:border-[#303030]">
              <span className="text-[#64748B] dark:text-[#A1A1AA]">Transaction Reference:</span>
              <span className="font-mono font-bold text-[#1685F8] dark:text-[#2589FF]">{receipt.reference}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-[#D8E9FA]/60 dark:border-[#303030]">
              <span className="text-[#64748B] dark:text-[#A1A1AA]">Platform Service Fee:</span>
              <span className="font-semibold text-[#16B890] dark:text-[#34D399]">FREE (₹0.00)</span>
            </div>

            {/* Total Paid */}
            <div className="flex justify-between items-center pt-3 text-base">
              <span className="font-extrabold text-[#10274A] dark:text-[#F5F5F5]">Total Settled:</span>
              <span className="text-2xl font-black text-[#1685F8] dark:text-[#2589FF]">
                {receipt.currency} {Number(receipt.amount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Verification Badge Stamp */}
          <div className="p-3.5 rounded-2xl bg-[#DDF8EE] dark:bg-[#0D1F17] border border-[#16B890]/30 dark:border-[#34D399]/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#16B890] dark:text-[#34D399]" />
              <div>
                <div className="text-xs font-bold text-[#16B890] dark:text-[#34D399] uppercase tracking-wide">
                  {receipt.verifiedStamp || 'VERIFIED & SETTLED'}
                </div>
                <div className="text-[10px] text-[#64748B] dark:text-[#A1A1AA]">
                  Reconciled against SplitSmart AI debt ledger.
                </div>
              </div>
            </div>
            <span className="text-[11px] font-black text-[#16B890] dark:text-[#34D399] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white dark:bg-[#101010] border dark:border-[#34D399]/30">
              PAID
            </span>
          </div>

          {/* Bottom Security Note */}
          <div className="text-center text-[10px] text-slate-400 dark:text-[#737373] pt-2 border-t border-[#D8E9FA]/60 dark:border-[#303030]">
            SplitSmart AI • PayPal AI Hackathon Edition • Encrypted Financial Gateway
          </div>
        </div>
      </div>
    </div>
  );
};
