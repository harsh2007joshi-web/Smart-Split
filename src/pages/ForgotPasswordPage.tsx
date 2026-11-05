import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { HeroIllustration } from '../components/illustrations/HeroIllustration';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  Wallet,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lock,
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.forgotPassword(email.trim());
      setChallengeId(data.challengeId);
      setStep(2);
      setResendTimer(60);
      if (data.emailDispatch?.devMode) {
        setInfoMessage('Development Mode: Check server console terminal for the 6-digit OTP code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate password recovery.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[index] = val.slice(-1);
    setOtpDigits(next);

    if (val && index < 5) {
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`reset-otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const next = [...otpDigits];
    for (let i = 0; i < paste.length; i++) next[i] = paste[i];
    setOtpDigits(next);
    document.getElementById(`reset-otp-${Math.min(paste.length, 5)}`)?.focus();
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const code = otpDigits.join('');

    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.verifyResetOtp(challengeId, code);
      setResetToken(res.resetToken);
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const data = await api.forgotPassword(email.trim());
      setChallengeId(data.challengeId);
      setResendTimer(60);
      setInfoMessage('A new 6-digit OTP code has been dispatched.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend OTP.');
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword({ resetToken, newPassword, confirmPassword });
      setStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex flex-col justify-between selection:bg-[#BFE9FF] selection:text-[#10274A] dark:selection:bg-[#2589FF]/30 dark:selection:text-[#F5F5F5] transition-colors">
      <header className="px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center shadow-clay-btn">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#10274A] dark:text-[#F5F5F5]">
            SplitSmart<span className="text-[#1685F8] dark:text-[#2589FF]"> AI</span>
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="text-xs sm:text-sm font-bold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] transition-colors"
          >
            Remember your password? <span className="text-[#1685F8] dark:text-[#2589FF]">Log In</span>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 sm:py-14 w-full flex-1 flex items-center justify-center">
        <div className="w-full bg-white dark:bg-[#101010] rounded-[28px] p-8 sm:p-10 shadow-clay-card dark:shadow-none border border-[#D8E9FA] dark:border-[#303030] transition-colors">
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E9F5FE] dark:bg-[#141414] text-[#1685F8] dark:text-[#2589FF] dark:border dark:border-[#303030] inline-flex items-center justify-center mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-[#10274A] dark:text-[#F5F5F5]">Forgot your password?</h2>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-1.5">
                  Enter your registered email address to recover your account.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-2xl bg-[#FFE9EC] dark:bg-[#FB7185]/10 border border-red-200 dark:border-[#FB7185]/30 text-xs text-red-600 dark:text-[#FB7185] font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 shadow-clay-btn mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send OTP Code →</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#DDF8EE] dark:bg-[#141414] text-[#16B890] dark:text-[#34D399] dark:border dark:border-[#303030] inline-flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-[#10274A] dark:text-[#F5F5F5]">Enter Recovery Code</h2>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-1.5">
                  We sent a 6-digit security code to <br />
                  <strong className="text-[#10274A] dark:text-[#F5F5F5]">{email}</strong>
                </p>
              </div>

              {infoMessage && (
                <div className="mb-4 p-3 rounded-2xl bg-blue-50 dark:bg-[#2589FF]/10 border border-[#BFE9FF] dark:border-[#2589FF]/30 text-xs text-[#1685F8] dark:text-[#2589FF] text-center font-medium">
                  {infoMessage}
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-2xl bg-[#FFE9EC] dark:bg-[#FB7185]/10 border border-red-200 dark:border-[#FB7185]/30 text-xs text-red-600 dark:text-[#FB7185] font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                <div className="flex justify-between items-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`reset-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-[#10274A] dark:text-[#F5F5F5] bg-[#F1F9FF] dark:bg-[#0D0D0D] border-2 border-[#D8E9FA] dark:border-[#303030] rounded-xl focus:border-[#1685F8] dark:focus:border-[#2589FF] focus:bg-white dark:focus:bg-[#101010] focus:outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 shadow-clay-btn"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Verify Code →</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-[#64748B] dark:text-[#737373] space-y-2">
                <p>
                  Didn't receive the OTP?{' '}
                  {resendTimer > 0 ? (
                    <span className="font-semibold text-[#64748B] dark:text-[#737373]">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-[#1685F8] dark:text-[#2589FF] hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </p>
                <p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-400 dark:text-[#737373] hover:text-[#10274A] dark:hover:text-[#F5F5F5]"
                  >
                    ← Change Email
                  </button>
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E9F5FE] dark:bg-[#141414] text-[#1685F8] dark:text-[#2589FF] dark:border dark:border-[#303030] inline-flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-[#10274A] dark:text-[#F5F5F5]">Create New Password</h2>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-1.5">
                  Set a strong new password for your SplitSmart AI account.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-2xl bg-[#FFE9EC] dark:bg-[#FB7185]/10 border border-red-200 dark:border-[#FB7185]/30 text-xs text-red-600 dark:text-[#FB7185] font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="clay-input w-full px-4 py-3 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="clay-input w-full px-4 py-3 text-xs sm:text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 shadow-clay-btn mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Reset Password →</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#DDF8EE] dark:bg-[#141414] text-[#16B890] dark:text-[#34D399] dark:border dark:border-[#303030] inline-flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-[#10274A] dark:text-[#F5F5F5]">Password Reset Complete!</h2>
              <p className="text-sm text-[#64748B] dark:text-[#A1A1AA] mt-2 max-w-sm mx-auto">
                Your password has been successfully updated. You can now securely log in to your account.
              </p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="clay-btn-primary inline-flex px-8 py-3.5 text-sm font-bold shadow-clay-btn"
                >
                  Log In to SplitSmart AI →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#64748B] dark:text-[#737373]">
        © 2026 SplitSmart AI. PayPal AI Hackathon.
      </footer>
    </div>
  );
};
