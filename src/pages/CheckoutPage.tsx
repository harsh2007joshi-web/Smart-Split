import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { Card3D, PaymentState } from '../components/payment/Card3D';
import { ReceiptModal, ReceiptData } from '../components/payment/ReceiptModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Printer,
  Trash2,
  Zap,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Settlement details from URL
  const groupId = searchParams.get('groupId') || 'grp_goa2026';
  const groupName = searchParams.get('groupName') || 'Goa Trip 2026';
  const recipientId = searchParams.get('recipientId') || 'usr_rahul';
  const recipientName = searchParams.get('recipientName') || 'Rahul Sharma';
  const rawAmount = searchParams.get('amount') || '1200';
  const currency = searchParams.get('currency') || 'INR';
  const settlementId = searchParams.get('settlementId') || '';

  const amount = parseFloat(rawAmount) || 1200;

  // Payment method selection
  const [selectedMethod, setSelectedMethod] = useState<'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'GOOGLE_PAY'>('CREDIT_CARD');

  // Card form states
  const [cardholderName, setCardholderName] = useState(user?.name || 'Rahul Sharma');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('09/29');
  const [cvv, setCvv] = useState('884');
  const [isFlipped, setIsFlipped] = useState(false);

  // Payment animation state machine
  const [paymentState, setPaymentState] = useState<PaymentState>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [successReference, setSuccessReference] = useState('');

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);

  // Format card number with spaces as user types
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setExpiry(raw);
  };

  // Card payment submit
  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentState === 'PROCESSING' || paymentState === 'VALIDATING') return;

    setErrorMessage('');
    setPaymentState('VALIDATING');

    setTimeout(async () => {
      setPaymentState('PROCESSING');

      try {
        const res = await api.cardCheckout({
          amount,
          currency,
          groupId,
          recipientId,
          recipientName,
          settlementId,
          cardType: selectedMethod === 'DEBIT_CARD' ? 'DEBIT_CARD' : 'CREDIT_CARD',
          cardholderName,
          cardNumber,
          expiry,
          cvv,
        });

        setPaymentState('SUCCESS');
        setSuccessReference(res.payment.reference);
        if (res.receipt) {
          setActiveReceipt(res.receipt);
        }

        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1685F8', '#16B890', '#BFE9FF', '#FFD700'],
          });
        } catch (_) {}
      } catch (err: any) {
        setPaymentState('FAILURE');
        setErrorMessage(err.message || 'Payment gateway declined the card transaction.');
      }
    }, 1200);
  };

  // PayPal Sandbox flow
  const handlePayPalPayment = async () => {
    setPaymentState('PROCESSING');
    setErrorMessage('');

    try {
      const orderRes = await api.createPayPalOrder({
        amount,
        currency,
        groupId,
        recipientId,
        recipientName,
        settlementId,
      });

      setTimeout(async () => {
        try {
          const captureRes = await api.capturePayPalOrder({
            orderId: orderRes.orderId,
            groupId,
            recipientId,
            recipientName,
            amount,
            currency,
            settlementId,
          });

          setPaymentState('SUCCESS');
          setSuccessReference(captureRes.payment.reference);
          if (captureRes.receipt) {
            setActiveReceipt(captureRes.receipt);
          }

          try {
            confetti({
              particleCount: 140,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#0079C1', '#00457C', '#00DF9A', '#1685F8'],
            });
          } catch (_) {}
        } catch (captureErr: any) {
          setPaymentState('FAILURE');
          setErrorMessage(captureErr.message || 'PayPal sandbox order capture failed.');
        }
      }, 1800);
    } catch (err: any) {
      setPaymentState('FAILURE');
      setErrorMessage(err.message || 'Failed to initiate PayPal checkout.');
    }
  };

  // Google Pay settlement flow
  const handleGooglePayPayment = async () => {
    setPaymentState('VALIDATING');
    setErrorMessage('');

    setTimeout(async () => {
      setPaymentState('PROCESSING');
      try {
        const res = await api.googlePayCheckout({
          amount,
          currency,
          groupId,
          recipientId,
          recipientName,
          settlementId,
        });

        setPaymentState('SUCCESS');
        setSuccessReference(res.payment.reference);
        if (res.receipt) {
          setActiveReceipt(res.receipt);
        }

        try {
          confetti({
            particleCount: 130,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'],
          });
        } catch (_) {}
      } catch (err: any) {
        setPaymentState('FAILURE');
        setErrorMessage(err.message || 'Google Pay authorization declined.');
      }
    }, 1200);
  };

  // Delete trip after payment is completed
  const handleDeleteTripAfterPayment = async () => {
    if (!groupId) return;
    if (window.confirm(`Are you sure you want to permanently delete and close "${groupName}"? All debts in this trip are settled.`)) {
      setIsDeletingTrip(true);
      try {
        await api.deleteGroup(groupId);
        alert(`"${groupName}" has been successfully settled and deleted.`);
        navigate('/groups');
      } catch (err: any) {
        alert(err.message || 'Failed to delete trip.');
      } finally {
        setIsDeletingTrip(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Back link */}
          <Link
            to="/settlements"
            className="text-xs font-bold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Settlements</span>
          </Link>

          {/* Checkout Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                Secure Settlement Checkout
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA]">
                Reconcile group debt for <strong className="text-[#10274A] dark:text-[#F5F5F5]">{groupName}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] text-xs font-semibold text-[#1685F8] dark:text-[#2589FF]">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit SSL Secured</span>
            </div>
          </div>

          {/* Main Checkout Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ================= LEFT SIDE: 3D CARD ANIMATION & PREVIEW ================= */}
            <div className="lg:col-span-6 flex flex-col items-center space-y-6">
              {/* Payment Summary Box */}
              <div className="w-full clay-card p-6 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] space-y-3">
                <div className="flex justify-between items-center text-xs text-[#64748B] dark:text-[#A1A1AA]">
                  <span>Intended Recipient</span>
                  <strong className="text-[#10274A] dark:text-[#F5F5F5] text-sm">{recipientName}</strong>
                </div>
                <div className="flex justify-between items-center text-xs text-[#64748B] dark:text-[#A1A1AA]">
                  <span>Group Circle</span>
                  <span className="font-semibold text-[#10274A] dark:text-[#F5F5F5]">{groupName}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#D8E9FA] dark:border-[#303030] text-sm">
                  <span className="font-bold text-[#10274A] dark:text-[#F5F5F5]">Total to Settle</span>
                  <span className="text-2xl font-black text-[#1685F8] dark:text-[#2589FF]">
                    {currency} {amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 3D Claymorphic Animated Card Component */}
              <div className="w-full flex justify-center">
                <Card3D
                  cardholderName={cardholderName}
                  cardNumber={cardNumber}
                  expiry={expiry}
                  cvv={cvv}
                  isFlipped={isFlipped}
                  cardType={selectedMethod === 'DEBIT_CARD' ? 'DEBIT_CARD' : 'CREDIT_CARD'}
                  paymentState={paymentState}
                  errorMessage={errorMessage}
                  successReference={successReference}
                  onRetry={() => setPaymentState('IDLE')}
                />
              </div>

              {/* CVV Interactive Flip Hint */}
              <p className="text-[11px] text-[#64748B] dark:text-[#737373] text-center">
                💡 Entering the CVV field automatically rotates the 3D card to view the security signature strip.
              </p>
            </div>

            {/* ================= RIGHT SIDE: PAYMENT METHOD SELECTOR & FORM ================= */}
            <div className="lg:col-span-6 space-y-6">
              <div className="clay-card p-6 sm:p-8 bg-white dark:bg-[#101010] dark:border dark:border-[#303030] space-y-6">
                {/* Payment Method Tabs */}
                <div>
                  <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMethod('CREDIT_CARD');
                        setIsFlipped(false);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedMethod === 'CREDIT_CARD'
                          ? 'border-[#1685F8] dark:border-[#2589FF] bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] font-bold shadow-sm'
                          : 'border-[#D8E9FA] dark:border-[#303030] text-[#64748B] dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#141414]'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#1685F8] dark:text-[#2589FF]" />
                      <span className="text-[11px] block">Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMethod('DEBIT_CARD');
                        setIsFlipped(false);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedMethod === 'DEBIT_CARD'
                          ? 'border-[#1685F8] dark:border-[#2589FF] bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] font-bold shadow-sm'
                          : 'border-[#D8E9FA] dark:border-[#303030] text-[#64748B] dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#141414]'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#16B890] dark:text-[#34D399]" />
                      <span className="text-[11px] block">Debit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMethod('PAYPAL');
                        setIsFlipped(false);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedMethod === 'PAYPAL'
                          ? 'border-[#0079C1] bg-sky-50 dark:bg-sky-950/30 text-[#0079C1] font-bold shadow-sm'
                          : 'border-[#D8E9FA] dark:border-[#303030] text-[#64748B] dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#141414]'
                      }`}
                    >
                      <div className="font-extrabold text-sm tracking-tight text-[#0079C1] mb-1">
                        PayPal
                      </div>
                      <span className="text-[10px] block">Sandbox</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMethod('GOOGLE_PAY');
                        setIsFlipped(false);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedMethod === 'GOOGLE_PAY'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-bold shadow-sm'
                          : 'border-[#D8E9FA] dark:border-[#303030] text-[#64748B] dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#141414]'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-0.5 mb-1 font-black text-sm">
                        <span className="text-blue-500">G</span>
                        <span className="text-red-500">P</span>
                        <span className="text-amber-500">a</span>
                        <span className="text-green-500">y</span>
                      </div>
                      <span className="text-[10px] block">Google Pay</span>
                    </button>
                  </div>
                </div>

                {/* FORM FOR CREDIT & DEBIT CARD */}
                {(selectedMethod === 'CREDIT_CARD' || selectedMethod === 'DEBIT_CARD') && (
                  <form onSubmit={handleCardPayment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onFocus={() => setIsFlipped(false)}
                        onChange={e => setCardholderName(e.target.value)}
                        placeholder="Name as printed on card"
                        required
                        className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#10274A] dark:text-[#F5F5F5] uppercase dark:bg-[#0D0D0D] dark:border-[#303030]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onFocus={() => setIsFlipped(false)}
                        onChange={handleCardNumberChange}
                        placeholder="4242 •••• •••• 4242"
                        required
                        className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#10274A] dark:text-[#F5F5F5] font-mono tracking-wider font-semibold dark:bg-[#0D0D0D] dark:border-[#303030]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onFocus={() => setIsFlipped(false)}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          required
                          className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#10274A] dark:text-[#F5F5F5] font-mono dark:bg-[#0D0D0D] dark:border-[#303030]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">
                          CVV Code
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cvv}
                          onFocus={() => setIsFlipped(true)}
                          onBlur={() => setIsFlipped(false)}
                          onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          required
                          className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#10274A] dark:text-[#F5F5F5] font-mono font-bold dark:bg-[#0D0D0D] dark:border-[#303030]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={paymentState === 'PROCESSING' || paymentState === 'VALIDATING' || paymentState === 'SUCCESS'}
                      className="clay-btn-primary w-full py-4 text-sm font-bold flex items-center justify-center space-x-2 shadow-clay-btn mt-3 disabled:opacity-50"
                    >
                      {paymentState === 'PROCESSING' || paymentState === 'VALIDATING' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Card Settlement...</span>
                        </>
                      ) : paymentState === 'SUCCESS' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-white" />
                          <span>Payment Settled!</span>
                        </>
                      ) : (
                        <span>
                          Pay {currency} {amount.toLocaleString()} with {selectedMethod === 'DEBIT_CARD' ? 'Debit Card' : 'Credit Card'} →
                        </span>
                      )}
                    </button>
                  </form>
                )}

                {/* PAYPAL SANDBOX FLOW */}
                {selectedMethod === 'PAYPAL' && (
                  <div className="p-6 rounded-2xl bg-sky-50/50 dark:bg-[#0D0D0D] border border-sky-100 dark:border-[#303030] text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0079C1] text-white flex items-center justify-center mx-auto shadow-md font-black text-xl italic">
                      P
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">
                        Official PayPal Sandbox Checkout
                      </h4>
                      <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] mt-1 max-w-sm mx-auto">
                        Settling {currency} {amount.toLocaleString()} to {recipientName}. Our server securely creates and captures the PayPal v2 order.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayPalPayment}
                      disabled={paymentState === 'PROCESSING' || paymentState === 'SUCCESS'}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#0079C1] hover:bg-[#00457C] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      {paymentState === 'PROCESSING' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Capturing PayPal Order...</span>
                        </>
                      ) : paymentState === 'SUCCESS' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>PayPal Verified!</span>
                        </>
                      ) : (
                        <>
                          <span>Checkout with PayPal</span>
                          <ExternalLink className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-[10px] text-slate-500 dark:text-[#737373]">
                      Sandbox developer environment with server-side capture verification.
                    </div>
                  </div>
                )}

                {/* GOOGLE PAY (GPAY) FLOW */}
                {selectedMethod === 'GOOGLE_PAY' && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] text-center space-y-4">
                    <div className="w-16 h-12 rounded-xl bg-black text-white flex items-center justify-center mx-auto shadow-md">
                      <span className="font-black text-lg tracking-tight">G Pay</span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">
                        Google Pay Instant UPI & Card Checkout
                      </h4>
                      <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] mt-1 max-w-sm mx-auto">
                        Quick 1-tap settlement of {currency} {amount.toLocaleString()} directly to {recipientName}'s account.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGooglePayPayment}
                      disabled={paymentState === 'PROCESSING' || paymentState === 'VALIDATING' || paymentState === 'SUCCESS'}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#111827] dark:bg-[#1a1a1a] hover:bg-black dark:hover:bg-[#222222] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 border dark:border-[#303030]"
                    >
                      {paymentState === 'PROCESSING' || paymentState === 'VALIDATING' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authorizing Google Pay...</span>
                        </>
                      ) : paymentState === 'SUCCESS' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Google Pay Settled!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span>Pay {currency} {amount.toLocaleString()} with Google Pay</span>
                        </>
                      )}
                    </button>

                    <div className="text-[10px] text-slate-400 dark:text-[#737373]">
                      Supports UPI handles (VPA) and tokenized debit/credit cards through Google Wallet.
                    </div>
                  </div>
                )}
              </div>

              {/* Success Next Steps & Receipt/Delete Options */}
              {paymentState === 'SUCCESS' && (
                <div className="clay-card p-6 bg-[#DDF8EE] dark:bg-[#0D1F17] border-[#16B890]/40 dark:border-[#34D399]/40 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#16B890] text-white flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-[#10274A] dark:text-[#F5F5F5]">Settlement Verified & Complete!</h5>
                      <p className="text-xs text-[#10274A]/80 dark:text-[#A1A1AA]">
                        Reference: <code className="font-mono font-bold">{successReference || 'TXN-SETTLED'}</code>
                      </p>
                    </div>
                  </div>

                  {/* Actions: View Receipt + Delete Trip */}
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsReceiptOpen(true)}
                      className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#101010] text-[#10274A] dark:text-[#F5F5F5] border border-[#D8E9FA] dark:border-[#303030] text-xs font-bold flex items-center justify-center space-x-1.5 hover:bg-[#F1F9FF] dark:hover:bg-[#141414] transition-all shadow-sm"
                    >
                      <Printer className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                      <span>Print / View Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteTripAfterPayment}
                      disabled={isDeletingTrip}
                      className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-xs font-bold flex items-center justify-center space-x-1.5 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all shadow-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeletingTrip ? 'Deleting Trip...' : 'Delete & Close Trip'}</span>
                    </button>

                    <Link
                      to="/settlements"
                      className="px-4 py-2.5 rounded-xl bg-[#1685F8] dark:bg-[#2589FF] text-white text-xs font-bold flex items-center justify-center space-x-1 hover:bg-[#126ecf] dark:hover:bg-[#1f7ae6] transition-all shadow-sm"
                    >
                      <span>Return to Group</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Official Printable Settlement Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={activeReceipt}
      />
    </div>
  );
};