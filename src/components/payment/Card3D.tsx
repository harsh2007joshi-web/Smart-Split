import React from 'react';
import { ShieldCheck, Wifi, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export type PaymentState = 'IDLE' | 'VALIDATING' | 'PROCESSING' | 'SUCCESS' | 'FAILURE' | 'CANCELLED';

interface Card3DProps {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  isFlipped: boolean;
  cardType?: 'CREDIT_CARD' | 'DEBIT_CARD';
  paymentState: PaymentState;
  errorMessage?: string;
  successReference?: string;
  onRetry?: () => void;
}

export const Card3D: React.FC<Card3DProps> = ({
  cardholderName,
  cardNumber,
  expiry,
  cvv,
  isFlipped,
  cardType = 'CREDIT_CARD',
  paymentState,
  errorMessage,
  successReference,
  onRetry,
}) => {

  const getCardNetwork = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'MASTERCARD';
    if (/^3[47]/.test(clean)) return 'AMEX';
    return 'VISA';
  };

  const network = getCardNetwork(cardNumber);

  const getFormattedNumber = () => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (!clean) return '•••• •••• •••• ••••';
    const parts = [];
    for (let i = 0; i < 16; i += 4) {
      const slice = clean.slice(i, i + 4);
      if (slice) {
        parts.push(slice.padEnd(4, '•'));
      } else {
        parts.push('••••');
      }
    }
    return parts.join(' ');
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="card-perspective-container w-full max-w-[380px] h-[220px] relative">
        {paymentState === 'PROCESSING' && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#1685F8] via-[#16B890] to-[#0E6FD8] rounded-[24px] blur-xl opacity-75 animate-pulse -z-10" />
        )}

        {paymentState === 'SUCCESS' && (
          <div className="absolute inset-0 bg-[#16B890] rounded-[24px] blur-xl opacity-60 animate-pulse -z-10" />
        )}

        <div
          className={`flip-card-inner relative w-full h-full duration-700 transition-transform ${
            isFlipped ? 'is-flipped' : ''
          } ${
            paymentState === 'PROCESSING' ? 'animate-pulse-subtle scale-[1.02]' : ''
          }`}
        >
          <div className="card-face bg-gradient-to-tr from-[#0F223D] via-[#163863] to-[#1685F8] text-white p-6 shadow-clay-float border border-white/20 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transform -skew-x-12 translate-x-1/2" />

            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 p-1 border border-amber-300 shadow-inner flex flex-col justify-between">
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                </div>
                <Wifi className="w-5 h-5 text-blue-200 rotate-90 opacity-80" />
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#BFE9FF] px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                  {cardType === 'DEBIT_CARD' ? 'DEBIT' : 'CREDIT'}
                </span>
              </div>
            </div>

            <div className="relative z-10 my-auto">
              <div className="font-mono text-lg sm:text-xl font-bold tracking-[3px] text-white/95 drop-shadow">
                {getFormattedNumber()}
              </div>
            </div>

            <div className="flex justify-between items-end relative z-10">
              <div className="max-w-[170px]">
                <div className="text-[9px] uppercase tracking-wider text-blue-200/80 font-medium">Cardholder Name</div>
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide truncate text-white drop-shadow">
                  {cardholderName || 'YOUR FULL NAME'}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-blue-200/80 font-medium">Expires</div>
                  <div className="text-xs sm:text-sm font-mono font-semibold text-white">
                    {expiry || 'MM/YY'}
                  </div>
                </div>

                <div className="font-black italic tracking-tighter text-sm sm:text-base px-2 py-0.5 rounded bg-white/15 backdrop-blur-sm border border-white/20 text-white">
                  {network === 'VISA' && 'VISA'}
                  {network === 'MASTERCARD' && 'MC'}
                  {network === 'AMEX' && 'AMEX'}
                </div>
              </div>
            </div>
          </div>

          <div className="card-face card-face-back bg-gradient-to-tr from-[#0B182B] via-[#10274A] to-[#1A3E6B] text-white pt-5 shadow-clay-float border border-white/20 flex flex-col justify-between overflow-hidden">
            <div className="w-full h-11 bg-black/90 shadow-inner" />

            <div className="px-6 my-auto">
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-9 bg-white/90 rounded-sm flex items-center px-3 italic font-serif text-[#10274A] text-xs font-semibold shadow-inner">
                  Authorized Signature
                </div>
                <div className="w-14 h-9 bg-white rounded-sm border-2 border-[#1685F8] flex items-center justify-center font-mono text-sm font-bold text-[#10274A] shadow-inner">
                  {cvv ? cvv : '•••'}
                </div>
              </div>
              <div className="text-[9px] text-slate-400 mt-1.5 flex justify-between">
                <span>Not valid unless signed</span>
                <span>Security CVV2</span>
              </div>
            </div>

            <div className="px-6 pb-4 flex justify-between items-center text-[8px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16B890]" />
                <span>256-Bit Encrypted Payment Vault</span>
              </div>
              <div className="font-mono text-[9px] text-blue-300 font-semibold">
                SplitSmart AI
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 w-full max-w-[380px]">
        {paymentState === 'VALIDATING' && (
          <div className="clay-card p-3.5 bg-blue-50/80 border-[#BFE9FF] flex items-center space-x-3 text-xs text-[#1685F8] font-medium animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1685F8]" />
            <span>Validating card credentials and security parameters...</span>
          </div>
        )}

        {paymentState === 'PROCESSING' && (
          <div className="clay-card p-4 bg-[#E9F5FE] border-[#BFE9FF] flex items-center space-x-3 text-sm text-[#10274A] font-semibold">
            <div className="relative flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-[#1685F8] border-t-transparent animate-spin" />
              <div className="absolute inset-0 bg-[#1685F8]/30 rounded-full blur animate-ping" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1685F8] uppercase tracking-wider">Processing Payment</div>
              <div className="text-xs text-[#64748B]">Communicating with bank payment gateway...</div>
            </div>
          </div>
        )}

        {paymentState === 'SUCCESS' && (
          <div className="clay-card p-4 bg-[#DDF8EE]/90 border-[#16B890]/40 flex items-start space-x-3 text-sm text-[#10274A]">
            <CheckCircle className="w-5 h-5 text-[#16B890] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold text-[#16B890] uppercase tracking-wider">Payment Verified & Settled!</div>
              <div className="text-xs text-[#10274A] font-medium mt-0.5">
                Transaction Ref: <span className="font-mono font-bold">{successReference || 'SS-TXN-VERIFIED'}</span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Group balance updated and instant receipt sent to all participants.
              </div>
            </div>
          </div>
        )}

        {paymentState === 'FAILURE' && (
          <div className="clay-card p-4 bg-[#FFE9EC] border-red-300 flex items-start space-x-3 text-sm text-[#10274A]">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Transaction Failed</div>
              <div className="text-xs text-[#64748B] mt-0.5">{errorMessage || 'Your card issuer declined the transaction.'}</div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" /> Try Again Safely
                </button>
              )}
            </div>
          </div>
        )}

        {paymentState === 'CANCELLED' && (
          <div className="clay-card p-3.5 bg-slate-50 border-slate-200 flex items-center space-x-3 text-xs text-[#64748B]">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span>Payment checkout cancelled. Your settlement balance remains pending.</span>
          </div>
        )}
      </div>
    </div>
  );
};
