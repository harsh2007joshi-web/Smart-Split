import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Share2,
  Mail,
  Copy,
  Check,
  Send,
  X,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  defaultTitle?: string;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  initialUrl,
  defaultTitle = 'Share Link with Friends',
}) => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const [activeUrl, setActiveUrl] = useState(initialUrl || currentOrigin);
  const shareableUrl = activeUrl;

  const [copied, setCopied] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailStatus, setEmailStatus] = useState<{ configured: boolean; provider: string; appUrl?: string } | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isUpdatingDomain, setIsUpdatingDomain] = useState(false);
  const [domainSuccess, setDomainSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getEmailStatus()
        .then(res => {
          setEmailStatus(res);
          if (res.appUrl && (!initialUrl || initialUrl.includes('localhost'))) {
            const pathPart = (initialUrl || window.location.pathname).replace(/^https?:\/\/[^\/]+/, '');
            setActiveUrl(`${res.appUrl.replace(/\/$/, '')}${pathPart}`);
          }
        })
        .catch(() => setEmailStatus({ configured: false, provider: 'Local Dev Mode' }));
      setSuccessMessage('');
      setErrorMessage('');
    }
  }, [isOpen, initialUrl]);

  const handleApplyDomain = async (domainToApply?: string) => {
    const raw = domainToApply || customDomainInput;
    if (!raw.trim()) return;
    let formatted = raw.trim();
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = 'https://' + formatted;
    }
    formatted = formatted.replace(/\/$/, '');
    setIsUpdatingDomain(true);
    try {
      await api.setPublicUrl(formatted);
      const pathPart = activeUrl.replace(/^https?:\/\/[^\/]+/, '');
      const updated = `${formatted}${pathPart}`;
      setActiveUrl(updated);
      setDomainSuccess(`Connected to ${formatted}!`);
      setTimeout(() => setDomainSuccess(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update public URL');
    } finally {
      setIsUpdatingDomain(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmail.trim()) {
      setErrorMessage('Please enter your friend\'s email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.shareLink({
        email: friendEmail.trim(),
        friendName: friendName.trim() || undefined,
        targetUrl: shareableUrl,
        note: note.trim() || undefined,
      });

      if (res.emailDispatch && !res.emailDispatch.delivered) {
        setErrorMessage(res.message || 'Resend test mode only delivers to harsh2007joshi@gmail.com. Share this link directly via WhatsApp or copy above!');
      } else {
        setSuccessMessage(res.message || `Link successfully sent to ${friendEmail}!`);
        setFriendEmail('');
        setFriendName('');
        setNote('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch email. Please check server logs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#101010] rounded-3xl p-6 sm:p-8 shadow-clay-card border border-[#D8E9FA] dark:border-[#303030] relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5] hover:bg-[#F1F9FF] dark:hover:bg-[#141414] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white flex items-center justify-center shadow-clay-btn">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#10274A] dark:text-[#F5F5F5]">{defaultTitle}</h3>
            <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">Share this normal public link so friends can open it anywhere</p>
          </div>
        </div>

        {/* API Status Pill */}
        <div className="mb-5 p-3 rounded-2xl bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                emailStatus?.configured ? 'bg-[#16B890] animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-[#10274A] dark:text-[#F5F5F5]">
              Email API: {emailStatus?.provider || 'Checking connection...'}
            </span>
          </div>
          {emailStatus?.configured ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#DDF8EE] dark:bg-[#0D1F17] text-[#16B890] dark:text-[#34D399]">
              Live Mailer
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
              Dev Mode
            </span>
          )}
        </div>

        {/* Section 1: Direct Link & Copy */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-bold text-[#10274A] dark:text-[#F5F5F5] flex items-center justify-between">
            <span>Direct Public Link</span>
            <span className="text-[10px] text-[#64748B] dark:text-[#737373] font-normal">Friend can open in any browser</span>
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] rounded-2xl px-3.5 py-2.5 text-xs text-[#10274A] dark:text-[#F5F5F5] font-mono truncate select-all">
              {shareableUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
                copied
                  ? 'bg-[#DDF8EE] dark:bg-[#0D1F17] text-[#16B890] dark:text-[#34D399] border border-[#16B890]/40 dark:border-[#34D399]/40'
                  : 'clay-btn-secondary'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp & Telegram Quick Share */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Here is the SplitSmart AI link: ${shareableUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#34D399] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-[#25D366]/20"
            >
              <span>💬 WhatsApp Friend</span>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(`SplitSmart AI Link:`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] dark:text-[#2589FF] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-[#0088cc]/20"
            >
              <span>✈️ Telegram</span>
            </a>
          </div>

          {/* Localhost / Domain Alert & Public Domain Connector */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-[#14120B] border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="leading-snug">
                <span className="font-bold">⚠️ Sharing Across Devices:</span> Friends cannot open <code className="bg-amber-100 dark:bg-amber-950/60 px-1 py-0.5 rounded font-mono font-bold">localhost</code>. Connect your public domain or tunnel below:
              </div>
              <button
                type="button"
                onClick={() => handleApplyDomain('http://192.168.29.220:5173')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-amber-300 dark:border-amber-800/60 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-[11px] shrink-0 flex items-center space-x-1 shadow-sm transition-all"
              >
                <span>📶 Use Wi-Fi IP (192.168.29.220)</span>
              </button>
            </div>

            {domainSuccess && (
              <div className="p-2.5 rounded-xl bg-[#DDF8EE] dark:bg-[#0D1F17] border border-[#16B890]/40 dark:border-[#34D399]/40 text-[#16B890] dark:text-[#34D399] font-bold text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{domainSuccess} Public link updated!</span>
              </div>
            )}

            <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Enter public domain (e.g. https://yourdomain.com or Cloudflare tunnel link)"
                value={customDomainInput}
                onChange={e => setCustomDomainInput(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 bg-white dark:bg-[#0D0D0D] rounded-xl border border-[#D8E9FA] dark:border-[#303030] text-xs text-[#10274A] dark:text-[#F5F5F5] focus:outline-none focus:border-[#1685F8] dark:focus:border-[#2589FF]"
              />
              <button
                type="button"
                disabled={isUpdatingDomain || !customDomainInput.trim()}
                onClick={() => handleApplyDomain()}
                className="clay-btn-primary px-4 py-2 text-xs font-bold w-full sm:w-auto shrink-0 flex items-center justify-center space-x-1 shadow-clay-btn disabled:opacity-50"
              >
                {isUpdatingDomain ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Connect Domain</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
              Tip: Run <code className="bg-amber-100/80 dark:bg-amber-950/80 px-1 py-0.5 rounded font-mono font-bold">npm run share</code> in terminal for a free instant Cloudflare tunnel.
            </div>
          </div>
        </div>

        {/* Section 2: Send Link to Friend's Email */}
        <form onSubmit={handleSendEmail} className="space-y-4 pt-4 border-t border-[#D8E9FA] dark:border-[#303030]">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
            <span className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">Email Link Directly to Friend's Inbox</span>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-[#DDF8EE] dark:bg-[#0D1F17] border border-[#16B890]/40 dark:border-[#34D399]/40 text-xs text-[#10274A] dark:text-[#F5F5F5] font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#16B890] dark:text-[#34D399] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FFE9EC] dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] dark:text-[#A1A1AA] mb-1">
                Friend's Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="friend@gmail.com"
                value={friendEmail}
                onChange={e => setFriendEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] rounded-2xl text-xs text-[#10274A] dark:text-[#F5F5F5] focus:outline-none focus:border-[#1685F8] dark:focus:border-[#2589FF] focus:bg-white dark:focus:bg-[#141414] transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] dark:text-[#A1A1AA] mb-1">
                Friend's Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={friendName}
                onChange={e => setFriendName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] rounded-2xl text-xs text-[#10274A] dark:text-[#F5F5F5] focus:outline-none focus:border-[#1685F8] dark:focus:border-[#2589FF] focus:bg-white dark:focus:bg-[#141414] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] dark:text-[#A1A1AA] mb-1">
              Personal Note (Optional)
            </label>
            <input
              type="text"
              placeholder="Join our group to track expenses and split bills!"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] rounded-2xl text-xs text-[#10274A] dark:text-[#F5F5F5] focus:outline-none focus:border-[#1685F8] dark:focus:border-[#2589FF] focus:bg-white dark:focus:bg-[#141414] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="clay-btn-primary w-full py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-clay-btn disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Link to Friend's Mail ID</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
