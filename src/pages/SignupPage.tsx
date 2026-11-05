import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  RefreshCw,
  Phone,
  Smartphone,
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { register, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationUserId, setVerificationUserId] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationPhone, setVerificationPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const queryEmail = searchParams.get('verifyEmail');
    const queryUserId = searchParams.get('userId');
    if (queryEmail && queryUserId) {
      setVerificationEmail(queryEmail);
      setVerificationUserId(queryUserId);
      setIsVerifying(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (!name.trim() || !email.trim() || !password || !confirmPassword || !cleanPhone) {
      setErrorMessage('Please fill in all required fields. Mobile phone number is mandatory.');
      return;
    }

    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await register({
        name: name.trim(),
        email: email.trim(),
        phoneNumber: cleanPhone,
        password,
        confirmPassword,
        agreeTerms,
      });

      setVerificationUserId(data.userId);
      setVerificationEmail(data.email);
      setVerificationPhone(phoneNumber.trim());
      setIsVerifying(true);
      setResendCooldown(45);
      const otp = data.otpCode || data.devCode || data.phoneDispatch?.otp || data.emailDispatch?.code;
      if (data.emailDispatch?.devMode || data.phoneDispatch?.devMode) {
        setVerificationMessage(`Verification OTP Code: [ ${otp} ] (Enter this 6-digit code below)`);
      } else {
        setVerificationMessage(`Verification code sent to ${data.phoneNumber ? `+91 ${cleanPhone} and ` : ''}${data.email}.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const targetIdx = Math.min(pasted.length, 5);
    document.getElementById(`otp-input-${targetIdx}`)?.focus();
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const code = otpDigits.join('');

    if (code.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmail(verificationUserId, code);
      navigate(returnTo || '/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await resendVerification(verificationUserId);
      setResendCooldown(60);
      setVerificationMessage(`New verification code sent to ${verificationEmail}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex flex-col justify-between selection:bg-[#BFE9FF] selection:text-[#10274A] dark:selection:bg-[#2589FF]/30 dark:selection:text-[#F5F5F5] transition-colors">
      {}
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
            to="/login"
            className="text-xs sm:text-sm font-bold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#1685F8] dark:hover:text-[#2589FF] transition-colors"
          >
            Already have an account? <span className="text-[#1685F8] dark:text-[#2589FF]">Log In</span>
          </Link>
        </div>
      </header>

      {}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {}
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

          {}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[440px] bg-white dark:bg-[#101010] rounded-[28px] p-8 sm:p-10 shadow-clay-card dark:shadow-none border border-[#D8E9FA] dark:border-[#303030] relative transition-colors">
              {!isVerifying ? (
                <>
                  {}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white shadow-clay-btn mb-3">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                      Create your account
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-1">
                      Start splitting expenses smarter with SplitSmart AI.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-[#FFE9EC] dark:bg-[#FB7185]/10 border border-red-200 dark:border-[#FB7185]/30 flex items-start space-x-2.5 text-xs text-red-600 dark:text-[#FB7185] font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {}
                    <div>
                      <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium"
                      />
                    </div>

                    {}
                    <div>
                      <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium"
                      />
                    </div>

                    {}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5]">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-[#16B890] dark:text-[#34D399] bg-[#DDF8EE] dark:bg-[#34D399]/15 px-2 py-0.5 rounded-full">
                          Mandatory for OTP
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-[#64748B] dark:text-[#737373]">
                          +91
                        </div>
                        <input
                          type="tel"
                          required
                          minLength={10}
                          maxLength={10}
                          pattern="[0-9]{10}"
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                          placeholder="9876543210 (10 digits required)"
                          className="clay-input w-full pl-12 pr-3.5 py-2.5 text-xs sm:text-sm font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-[#64748B] dark:text-[#737373] mt-1">
                        Mandatory: We send your 6-digit verification OTP to this phone number
                      </p>
                    </div>

                    {}
                    <div>
                      <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          required
                          className="clay-input w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-medium"
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

                    {}
                    <div>
                      <label className="block text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className="clay-input w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium"
                      />
                    </div>

                    {}
                    <div className="flex items-start space-x-2 pt-1 text-xs">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={e => setAgreeTerms(e.target.checked)}
                        required
                        className="rounded text-[#1685F8] dark:text-[#2589FF] focus:ring-[#1685F8] dark:focus:ring-[#2589FF] mt-0.5 w-4 h-4 dark:bg-[#0D0D0D] dark:border-[#303030]"
                      />
                      <span className="text-[#64748B] dark:text-[#A1A1AA]">
                        I agree to the <span className="text-[#1685F8] dark:text-[#2589FF] font-semibold">Terms of Service</span> and <span className="text-[#1685F8] dark:text-[#2589FF] font-semibold">Privacy Policy</span>.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="clay-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 mt-3 shadow-clay-btn"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 text-center text-xs text-[#64748B] dark:text-[#737373]">
                    <span>Already have an account? </span>
                    <Link to={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login'} className="font-bold text-[#1685F8] dark:text-[#2589FF] hover:underline">
                      Log In
                    </Link>
                  </div>
                </>
              ) : (

                <div>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DDF8EE] dark:bg-[#141414] text-[#16B890] dark:text-[#34D399] dark:border dark:border-[#303030] mb-3">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                      Verify Your Account
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-1">
                      Enter the 6-digit code sent via <strong className="text-[#1685F8] dark:text-[#2589FF]">2Factor.in SMS</strong> to{' '}
                      {verificationPhone ? <strong className="text-[#10274A] dark:text-[#F5F5F5]">+91 {verificationPhone}</strong> : null}
                      {verificationPhone && verificationEmail ? ' & ' : ''}
                      <strong className="text-[#10274A] dark:text-[#F5F5F5]">{verificationEmail}</strong>
                    </p>
                  </div>

                  {verificationMessage && (
                    <div className="mb-4 p-3 rounded-2xl bg-blue-50 dark:bg-[#2589FF]/10 border border-[#BFE9FF] dark:border-[#2589FF]/30 text-xs text-[#1685F8] dark:text-[#2589FF] text-center font-medium">
                      {verificationMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mb-4 p-3 rounded-2xl bg-[#FFE9EC] dark:bg-[#FB7185]/10 border border-red-200 dark:border-[#FB7185]/30 text-xs text-red-600 dark:text-[#FB7185] font-medium flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerifySubmit} className="space-y-6">
                    {}
                    <div className="flex justify-between items-center gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(idx, e.target.value)}
                          onKeyDown={e => handleKeyDown(idx, e)}
                          onPaste={idx === 0 ? handlePaste : undefined}
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
                        <span>Verify & Continue →</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center text-xs text-[#64748B] dark:text-[#737373] space-y-2">
                    <p>
                      Didn't receive the code?{' '}
                      {resendCooldown > 0 ? (
                        <span className="text-[#64748B] dark:text-[#737373] font-semibold">Resend in {resendCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="font-bold text-[#1685F8] dark:text-[#2589FF] hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </p>
                    <p>
                      <button
                        type="button"
                        onClick={() => setIsVerifying(false)}
                        className="text-slate-400 dark:text-[#737373] hover:text-[#10274A] dark:hover:text-[#F5F5F5]"
                      >
                        ← Change Email
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#64748B]">
        © 2026 SplitSmart AI. PayPal AI Hackathon.
      </footer>
    </div>
  );
};
