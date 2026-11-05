import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';
import { ContactItem, FriendRequest, ChatMessage, ChatReceipt } from '../types';
import { ReceiptModal, ReceiptData } from '../components/payment/ReceiptModal';
import {
  Users,
  Search,
  UserPlus,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  X,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Receipt,
  Download,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCheck,
  ChevronRight,
  Loader2,
  AtSign,
  AlertCircle,
  Plus,
} from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams<{ contactId?: string }>();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONTACTS' | 'REQUESTS'>('CONTACTS');

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchUsernameInput, setSearchUsernameInput] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [addModalError, setAddModalError] = useState<string | null>(null);
  const [addModalSuccess, setAddModalSuccess] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  const [activeContact, setActiveContact] = useState<ContactItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);

  const [shareReceiptModalOpen, setShareReceiptModalOpen] = useState(false);
  const [userReceipts, setUserReceipts] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  const [inspectReceipt, setInspectReceipt] = useState<ReceiptData | null>(null);
  const [inspectReceiptOpen, setInspectReceiptOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadContactsAndRequests = async () => {
    try {
      setLoading(true);
      const [contactsRes, requestsRes] = await Promise.all([
        api.getContacts(searchQuery),
        api.getFriendRequests(),
      ]);
      setContacts(contactsRes.contacts || []);
      setIncomingRequests(requestsRes.incoming || []);
      setOutgoingRequests(requestsRes.outgoing || []);
    } catch (err) {
      console.error('Failed to load contacts/requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContactsAndRequests();
  }, [searchQuery]);

  useEffect(() => {
    const contactId = params.contactId || searchParams.get('chat');
    if (contactId && contacts.length > 0) {
      const match = contacts.find(c => c.user.id === contactId);
      if (match) {
        setActiveContact(match);
      }
    }
  }, [contacts, params.contactId, searchParams]);

  useEffect(() => {
    if (!activeContact) {
      setChatMessages([]);
      return;
    }

    let isMounted = true;

    const fetchMessages = async (silent = false) => {
      try {
        if (!silent) setChatLoading(true);
        const res = await api.getChatMessages(activeContact.user.id);
        if (isMounted) {
          setChatMessages(res.messages || []);
          if (!silent) setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      } finally {
        if (!silent && isMounted) setChatLoading(false);
      }
    };

    fetchMessages(false);
    const interval = setInterval(() => fetchMessages(true), 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeContact]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddModalError(null);
    setAddModalSuccess(null);
    setFoundUser(null);

    const term = searchUsernameInput.trim();
    if (!term) {
      setAddModalError('Please enter a username to search.');
      return;
    }

    try {
      setSearchingUser(true);
      const res = await api.getUserByUsername(term);
      if (res.user) {
        setFoundUser(res.user);
      } else {
        setAddModalError(`No registered user found with username "${term}".`);
      }
    } catch (err: any) {
      setAddModalError(err.message || `No registered user found with username "${term}".`);
    } finally {
      setSearchingUser(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!foundUser) return;
    try {
      setSendingRequest(true);
      setAddModalError(null);
      const res = await api.sendFriendRequest(foundUser.username);
      setAddModalSuccess(res.message || 'Friend request sent successfully!');
      loadContactsAndRequests();
      setTimeout(() => {
        setAddModalOpen(false);
        setSearchUsernameInput('');
        setFoundUser(null);
        setAddModalSuccess(null);
      }, 2000);
    } catch (err: any) {
      setAddModalError(err.message || 'Failed to send friend request.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.acceptFriendRequest(requestId);
      await loadContactsAndRequests();
      await fetchNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to accept request.');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await api.declineFriendRequest(requestId);
      await loadContactsAndRequests();
      await fetchNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to decline request.');
    }
  };

  const handleRemoveContact = async (contactUserId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your contacts?`)) return;
    try {
      await api.removeContact(contactUserId);
      if (activeContact?.user.id === contactUserId) {
        setActiveContact(null);
      }
      loadContactsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to remove contact.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeContact || sendingMessage) return;

    const textToSend = messageInput.trim();
    setMessageInput('');
    try {
      setSendingMessage(true);
      const res = await api.sendChatMessage(activeContact.user.id, textToSend);
      setChatMessages(prev => [...prev, res.message]);
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file || !activeContact) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setSendingMessage(true);
        setAttachmentMenuOpen(false);
        const fileBase64 = reader.result as string;
        const res = await api.uploadChatAttachment(activeContact.user.id, {
          fileBase64,
          filename: file.name,
          mimeType: file.type || (isImage ? 'image/jpeg' : 'application/pdf'),
          size: file.size,
        });
        setChatMessages(prev => [...prev, res.message]);
        setTimeout(scrollToBottom, 50);
      } catch (err: any) {
        alert(err.message || 'Failed to upload file.');
      } finally {
        setSendingMessage(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenShareReceipt = async () => {
    setAttachmentMenuOpen(false);
    setShareReceiptModalOpen(true);
    try {
      setLoadingReceipts(true);
      const res = await api.getUserReceiptsForChat();
      setUserReceipts(res.receipts || []);
      if (res.receipts && res.receipts.length > 0) {
        setSelectedReceipt(res.receipts[0]);
      }
    } catch (err) {
      console.error('Failed to load user receipts:', err);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const handleConfirmShareReceipt = async () => {
    if (!selectedReceipt || !activeContact) return;
    try {
      setSendingMessage(true);
      const res = await api.shareReceiptInChat(activeContact.user.id, {
        reference: selectedReceipt.reference,
        paymentId: selectedReceipt.id,
      });
      setChatMessages(prev => [...prev, res.message]);
      setShareReceiptModalOpen(false);
      setSelectedReceipt(null);
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      alert(err.message || 'Failed to share payment receipt.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleInspectReceipt = (receipt: ChatReceipt) => {
    const data: ReceiptData = {
      receiptNumber: receipt.receiptNumber || `REC-2026-${receipt.reference}`,
      date: receipt.date,
      reference: receipt.reference,
      payerName: receipt.payerName,
      recipientName: receipt.recipientName,
      groupName: receipt.groupName,
      amount: receipt.amount,
      currency: receipt.currency,
      method: 'Verified Settlement',
      status: receipt.status,
      verifiedStamp: 'OFFICIALLY VERIFIED & SETTLED',
    };
    setInspectReceipt(data);
    setInspectReceiptOpen(true);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-[#F1F9FF] dark:bg-[#080808] text-[#10274A] dark:text-[#F5F5F5] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#10274A] dark:text-[#F5F5F5] tracking-tight">
                Contacts & Chat
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
                Connect using unique usernames, chat privately, and share payment receipts
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setAddModalOpen(true);
                  setSearchUsernameInput('');
                  setFoundUser(null);
                  setAddModalError(null);
                  setAddModalSuccess(null);
                }}
                className="clay-btn-primary px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-clay-btn"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex p-1 bg-white dark:bg-[#101010] rounded-2xl border border-[#D8E9FA] dark:border-[#303030] text-xs font-bold self-start">
              <button
                onClick={() => setActiveTab('CONTACTS')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                  activeTab === 'CONTACTS'
                    ? 'bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] shadow-xs'
                    : 'text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>My Contacts ({contacts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('REQUESTS')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                  activeTab === 'REQUESTS'
                    ? 'bg-[#E9F5FE] dark:bg-[#2589FF]/10 text-[#1685F8] dark:text-[#2589FF] shadow-xs'
                    : 'text-[#64748B] dark:text-[#A1A1AA] hover:text-[#10274A] dark:hover:text-[#F5F5F5]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Friend Requests</span>
                {incomingRequests.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#1685F8] dark:bg-[#2589FF] text-white text-[10px] font-bold flex items-center justify-center">
                    {incomingRequests.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'CONTACTS' && (
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#64748B] dark:text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, username, or email..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] rounded-xl focus:outline-none focus:border-[#1685F8] dark:focus:border-[#2589FF] text-[#10274A] dark:text-[#F5F5F5] placeholder:text-[#64748B] dark:placeholder:text-[#737373]"
                />
              </div>
            )}
          </div>

          {activeTab === 'CONTACTS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`${activeContact ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4`}>
                {loading ? (
                  <div className="clay-card p-12 text-center bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1685F8] dark:text-[#2589FF] mx-auto mb-2" />
                    <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">Loading your contacts...</p>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="clay-card p-12 text-center bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E9F5FE] dark:bg-[#141414] text-[#1685F8] dark:text-[#2589FF] flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5]">No Contacts Found</h3>
                    <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] max-w-sm mx-auto">
                      Connect with friends by searching their unique username (e.g. @rahulpatel_192) to send friend requests and chat.
                    </p>
                    <button
                      onClick={() => setAddModalOpen(true)}
                      className="clay-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center space-x-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add First Contact</span>
                    </button>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${activeContact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {contacts.map(c => {
                      const isSelected = activeContact?.user.id === c.user.id;
                      return (
                        <div
                          key={c.contactRecordId}
                          onClick={() => {
                            setActiveContact(c);
                            setSearchParams({ chat: c.user.id });
                          }}
                          className={`clay-card p-5 bg-white dark:bg-[#101010] border transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md ${
                            isSelected
                              ? 'border-[#1685F8] dark:border-[#2589FF] ring-2 ring-[#1685F8]/20 dark:ring-[#2589FF]/20'
                              : 'border-[#D8E9FA] dark:border-[#303030]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center space-x-3 truncate">
                              {c.user.avatarUrl ? (
                                <img
                                  src={c.user.avatarUrl}
                                  alt={c.user.name}
                                  className="w-12 h-12 rounded-2xl object-cover border border-[#D8E9FA] dark:border-[#303030]"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E9F5FE] to-[#D8E9FA] dark:from-[#141414] dark:to-[#1E293B] text-[#1685F8] dark:text-[#2589FF] font-black text-lg flex items-center justify-center border border-[#1685F8]/30 dark:border-[#2589FF]/30 select-none">
                                  {c.user.name.charAt(0).toUpperCase()}
                                </div>
                              )}

                              <div className="truncate">
                                <h4 className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5] truncate">
                                  {c.user.name}
                                </h4>
                                <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-[#1685F8] dark:text-[#2589FF]">
                                  <span>{c.user.username}</span>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      copyToClipboard(c.user.username, c.contactRecordId);
                                    }}
                                    className="hover:opacity-75"
                                    title="Copy username"
                                  >
                                    {copiedId === c.contactRecordId ? (
                                      <Check className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-[#64748B] dark:text-[#737373]" />
                                    )}
                                  </button>
                                </div>
                                <div className="text-[11px] text-[#64748B] dark:text-[#737373] truncate mt-0.5">
                                  {c.user.email}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleRemoveContact(c.user.id, c.user.name);
                              }}
                              className="p-1.5 text-[#64748B] hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Remove contact"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="pt-3 border-t border-[#D8E9FA]/60 dark:border-[#303030] flex items-center justify-between">
                            <span className="text-[10px] text-[#64748B] dark:text-[#737373]">
                              Connected {new Date(c.addedAt).toLocaleDateString()}
                            </span>

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setActiveContact(c);
                                setSearchParams({ chat: c.user.id });
                              }}
                              className="clay-btn-secondary px-3 py-1.5 text-xs font-bold text-[#1685F8] dark:text-[#2589FF] flex items-center space-x-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Open Chat</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {activeContact && (
                <div className="lg:col-span-7 flex flex-col h-[650px] bg-white dark:bg-[#101010] rounded-[28px] border border-[#D8E9FA] dark:border-[#303030] shadow-clay-card overflow-hidden">
                  <div className="p-4 px-6 bg-[#F1F9FF] dark:bg-[#0D0D0D] border-b border-[#D8E9FA] dark:border-[#303030] flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      {activeContact.user.avatarUrl ? (
                        <img
                          src={activeContact.user.avatarUrl}
                          alt={activeContact.user.name}
                          className="w-10 h-10 rounded-2xl object-cover border border-[#D8E9FA] dark:border-[#303030]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white font-black text-sm flex items-center justify-center select-none">
                          {activeContact.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                            {activeContact.user.name}
                          </h3>
                          <span className="flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Connected</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs font-mono text-[#1685F8] dark:text-[#2589FF]">
                          <span>{activeContact.user.username}</span>
                          <button
                            onClick={() => copyToClipboard(activeContact.user.username, 'active_chat')}
                            title="Copy username"
                          >
                            {copiedId === 'active_chat' ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-[#64748B]" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveContact(null);
                        setSearchParams({});
                      }}
                      className="p-1.5 text-[#64748B] hover:text-[#10274A] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F5] rounded-xl hover:bg-white dark:hover:bg-[#141414]"
                      title="Close chat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-[#080808]/40">
                    {chatLoading && chatMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1685F8] dark:text-[#2589FF]" />
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-2 p-6 text-[#64748B] dark:text-[#737373]">
                        <MessageSquare className="w-10 h-10 text-slate-300 dark:text-[#303030]" />
                        <p className="text-xs font-bold text-[#10274A] dark:text-[#F5F5F5]">
                          No messages yet
                        </p>
                        <p className="text-[11px] max-w-xs">
                          Send a text, share trip photos or documents, or send verified payment receipts.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map(msg => {
                        const isMe = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                          >
                            <div className="flex items-center space-x-1.5 text-[10px] text-[#64748B] dark:text-[#737373] px-1">
                              <span>{isMe ? 'You' : msg.senderName}</span>
                              <span>•</span>
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <div
                              className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-3.5 text-xs shadow-xs ${
                                isMe
                                  ? 'bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white rounded-br-xs'
                                  : 'bg-white dark:bg-[#141414] text-[#10274A] dark:text-[#F5F5F5] border border-[#D8E9FA] dark:border-[#303030] rounded-bl-xs'
                              }`}
                            >
                              {msg.type === 'TEXT' && (
                                <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                              )}

                              {msg.type === 'IMAGE' && msg.attachment && (
                                <div className="space-y-2">
                                  <div className="rounded-2xl overflow-hidden max-h-60 bg-black/5 dark:bg-black/20 border border-black/10">
                                    <img
                                      src={`/api/chat/attachments/${msg.attachment.id}`}
                                      alt={msg.attachment.originalName}
                                      className="w-full h-full object-cover max-h-60 hover:scale-[1.02] transition-transform cursor-pointer"
                                      onClick={() => window.open(`/api/chat/attachments/${msg.attachment!.id}`, '_blank')}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] pt-1">
                                    <span className="truncate opacity-90 max-w-[180px]">
                                      {msg.attachment.originalName}
                                    </span>
                                    <a
                                      href={`/api/chat/attachments/${msg.attachment.id}`}
                                      download={msg.attachment.originalName}
                                      className="inline-flex items-center space-x-1 underline font-semibold opacity-90 hover:opacity-100 ml-2"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Save</span>
                                    </a>
                                  </div>
                                </div>
                              )}

                              {msg.type === 'FILE' && msg.attachment && (
                                <div className="flex items-center space-x-3 p-2 bg-black/5 dark:bg-black/20 rounded-2xl">
                                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#101010] text-[#1685F8] dark:text-[#2589FF] flex items-center justify-center shrink-0 shadow-xs">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="truncate flex-1">
                                    <div className="font-bold truncate text-xs">{msg.attachment.originalName}</div>
                                    <div className="text-[10px] opacity-75">{formatBytes(msg.attachment.size)}</div>
                                  </div>
                                  <a
                                    href={`/api/chat/attachments/${msg.attachment.id}`}
                                    download={msg.attachment.originalName}
                                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                                      isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-[#E9F5FE] dark:bg-[#2589FF]/15 text-[#1685F8] dark:text-[#2589FF]'
                                    }`}
                                    title="Download Document"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              )}

                              {msg.type === 'RECEIPT' && msg.receipt && (
                                <div className="space-y-3 p-1">
                                  <div className="flex items-center justify-between border-b border-white/20 pb-2">
                                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                                      <Receipt className="w-4 h-4" />
                                      <span>Settlement Receipt</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white flex items-center space-x-1">
                                      <CheckCheck className="w-3 h-3" />
                                      <span>{msg.receipt.status}</span>
                                    </span>
                                  </div>

                                  <div className="space-y-1.5">
                                    <div className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">
                                      {msg.receipt.groupName}
                                    </div>
                                    <div className="text-xl font-black">
                                      {msg.receipt.currency === 'INR' ? '₹' : msg.receipt.currency}
                                      {msg.receipt.amount.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] font-mono opacity-85">
                                      Ref: {msg.receipt.reference}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleInspectReceipt(msg.receipt!)}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs ${
                                      isMe
                                        ? 'bg-white text-[#1685F8] hover:bg-white/90'
                                        : 'bg-[#1685F8] text-white hover:bg-[#0E6FD8]'
                                    }`}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>View Official Receipt</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 sm:p-4 bg-white dark:bg-[#101010] border-t border-[#D8E9FA] dark:border-[#303030] relative">
                    {attachmentMenuOpen && (
                      <div className="absolute bottom-16 left-4 bg-white dark:bg-[#141414] rounded-2xl shadow-clay-float border border-[#D8E9FA] dark:border-[#303030] p-2 space-y-1 z-30 w-56 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[#F1F9FF] dark:hover:bg-[#181818] flex items-center space-x-2 text-[#10274A] dark:text-[#F5F5F5]"
                        >
                          <ImageIcon className="w-4 h-4 text-[#1685F8]" />
                          <span>Send Photo / Image</span>
                        </button>

                        <button
                          onClick={() => docInputRef.current?.click()}
                          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[#F1F9FF] dark:hover:bg-[#181818] flex items-center space-x-2 text-[#10274A] dark:text-[#F5F5F5]"
                        >
                          <FileText className="w-4 h-4 text-purple-500" />
                          <span>Send Document / PDF</span>
                        </button>

                        <button
                          onClick={handleOpenShareReceipt}
                          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[#F1F9FF] dark:hover:bg-[#181818] flex items-center space-x-2 text-[#10274A] dark:text-[#F5F5F5]"
                        >
                          <Receipt className="w-4 h-4 text-[#16B890]" />
                          <span>Share Payment Receipt</span>
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={e => handleFileUpload(e, true)}
                    />
                    <input
                      type="file"
                      ref={docInputRef}
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                      className="hidden"
                      onChange={e => handleFileUpload(e, false)}
                    />

                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                        className={`p-2.5 rounded-2xl border transition-colors ${
                          attachmentMenuOpen
                            ? 'bg-[#E9F5FE] text-[#1685F8] border-[#1685F8] dark:bg-[#181818] dark:text-[#2589FF]'
                            : 'border-[#D8E9FA] dark:border-[#303030] text-[#64748B] hover:text-[#1685F8] hover:bg-[#F1F9FF] dark:hover:bg-[#141414]'
                        }`}
                        title="Attach file, photo or receipt"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

                      <input
                        type="text"
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        placeholder={`Message ${activeContact.user.name}...`}
                        className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#F1F9FF] dark:bg-[#080808] border border-[#D8E9FA] dark:border-[#303030] rounded-2xl focus:outline-none focus:border-[#1685F8] dark:focus:border-[#2589FF] text-[#10274A] dark:text-[#F5F5F5]"
                      />

                      <button
                        type="submit"
                        disabled={!messageInput.trim() || sendingMessage}
                        className="clay-btn-primary p-2.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Send</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'REQUESTS' && (
            <div className="space-y-6">
              <div className="clay-card p-6 bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] space-y-4">
                <div className="flex items-center justify-between border-b border-[#D8E9FA]/60 dark:border-[#303030] pb-3">
                  <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5] flex items-center space-x-2">
                    <UserPlus className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                    <span>Incoming Friend Requests ({incomingRequests.length})</span>
                  </h3>
                  <span className="text-xs text-[#64748B] dark:text-[#737373]">
                    Requests sent to your unique username
                  </span>
                </div>

                {incomingRequests.length === 0 ? (
                  <p className="text-xs text-[#64748B] dark:text-[#737373] py-4 text-center">
                    No pending incoming requests at the moment.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {incomingRequests.map(req => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white font-black text-sm flex items-center justify-center select-none">
                            {req.senderName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                              {req.senderName}
                            </div>
                            <div className="text-xs font-mono font-bold text-[#1685F8] dark:text-[#2589FF]">
                              {req.senderUsername}
                            </div>
                            <div className="text-[10px] text-[#64748B] dark:text-[#737373]">
                              Sent {new Date(req.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2 border-t border-[#D8E9FA]/60 dark:border-[#303030]">
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            className="clay-btn-primary flex-1 py-1.5 text-xs font-bold flex items-center justify-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req.id)}
                            className="clay-btn-secondary flex-1 py-1.5 text-xs font-bold text-[#64748B] dark:text-[#A1A1AA]"
                          >
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="clay-card p-6 bg-white dark:bg-[#101010] border border-[#D8E9FA] dark:border-[#303030] space-y-4">
                <div className="flex items-center justify-between border-b border-[#D8E9FA]/60 dark:border-[#303030] pb-3">
                  <h3 className="text-base font-bold text-[#10274A] dark:text-[#F5F5F5] flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Sent Friend Requests ({outgoingRequests.length})</span>
                  </h3>
                  <span className="text-xs text-[#64748B] dark:text-[#737373]">
                    Requests you sent waiting for acceptance
                  </span>
                </div>

                {outgoingRequests.length === 0 ? (
                  <p className="text-xs text-[#64748B] dark:text-[#737373] py-4 text-center">
                    You have not sent any pending friend requests.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outgoingRequests.map(req => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-[#F8FCFF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-zinc-800 text-[#10274A] dark:text-[#F5F5F5] font-black text-sm flex items-center justify-center">
                            {req.receiverName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                              {req.receiverName}
                            </div>
                            <div className="text-xs font-mono font-bold text-[#1685F8] dark:text-[#2589FF]">
                              {req.receiverUsername}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                            req.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : req.status === 'DECLINED'
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-[#101010] rounded-[28px] shadow-clay-float border border-[#D8E9FA] dark:border-[#303030] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-[#F1F9FF] dark:bg-[#0D0D0D] border-b border-[#D8E9FA] dark:border-[#303030] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                <UserPlus className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                <span>Add Friend by Username</span>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#10274A] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F5] rounded-xl hover:bg-white dark:hover:bg-[#141414]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {addModalError && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addModalError}</span>
                </div>
              )}

              {addModalSuccess && (
                <div className="p-3 rounded-2xl bg-[#DDF8EE] dark:bg-[#0D1F17] border border-[#16B890]/40 text-xs text-[#16B890] dark:text-[#34D399] font-bold flex items-center space-x-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{addModalSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSearchUser} className="space-y-3">
                <label className="block text-xs font-bold text-[#64748B] dark:text-[#A1A1AA]">
                  Friend's Unique Username
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <AtSign className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchUsernameInput}
                      onChange={e => setSearchUsernameInput(e.target.value)}
                      placeholder="e.g. rahulpatel_192"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F1F9FF] dark:bg-[#080808] border border-[#D8E9FA] dark:border-[#303030] rounded-2xl focus:outline-none focus:border-[#1685F8] dark:focus:border-[#2589FF] text-[#10274A] dark:text-[#F5F5F5] font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchingUser}
                    className="clay-btn-secondary px-4 py-2.5 text-xs font-bold text-[#1685F8] dark:text-[#2589FF] flex items-center space-x-1"
                  >
                    {searchingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Search</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#737373]">
                  Enter with or without the '@' prefix. Usernames are unique to every member.
                </p>
              </form>

              {foundUser && (
                <div className="p-4 rounded-2xl bg-[#F1F9FF] dark:bg-[#0D0D0D] border border-[#D8E9FA] dark:border-[#303030] space-y-4 animate-in fade-in">
                  <div className="flex items-center space-x-3">
                    {foundUser.avatarUrl ? (
                      <img
                        src={foundUser.avatarUrl}
                        alt={foundUser.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-[#D8E9FA] dark:border-[#303030]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1685F8] to-[#0E6FD8] text-white font-black text-lg flex items-center justify-center select-none">
                        {foundUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                        {foundUser.name}
                      </div>
                      <div className="text-xs font-mono font-bold text-[#1685F8] dark:text-[#2589FF]">
                        {foundUser.username}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#737373]">
                        {foundUser.email}
                      </div>
                    </div>
                  </div>

                  {foundUser.isSelf ? (
                    <div className="p-2 text-center text-xs font-bold text-[#64748B] bg-slate-100 dark:bg-zinc-800 rounded-xl">
                      This is your own account
                    </div>
                  ) : foundUser.isContact ? (
                    <div className="p-2 text-center text-xs font-bold text-[#16B890] bg-[#DDF8EE] dark:bg-[#0D1F17] rounded-xl flex items-center justify-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Already in your contacts</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      disabled={sendingRequest}
                      className="clay-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      {sendingRequest ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Send Friend Request</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {shareReceiptModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#101010] rounded-[28px] shadow-clay-float border border-[#D8E9FA] dark:border-[#303030] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-[#F1F9FF] dark:bg-[#0D0D0D] border-b border-[#D8E9FA] dark:border-[#303030] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-bold text-[#10274A] dark:text-[#F5F5F5]">
                <Receipt className="w-4 h-4 text-[#1685F8] dark:text-[#2589FF]" />
                <span>Share Verified Settlement Receipt</span>
              </div>
              <button
                onClick={() => setShareReceiptModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#10274A] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F5] rounded-xl hover:bg-white dark:hover:bg-[#141414]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
                Select one of your authentic past settlements to share directly with {activeContact?.user.name}:
              </p>

              {loadingReceipts ? (
                <div className="py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1685F8] mx-auto" />
                </div>
              ) : userReceipts.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B] bg-slate-50 dark:bg-zinc-900 rounded-2xl">
                  You have not completed any payments yet to share receipts.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {userReceipts.map(rec => {
                    const isPicked = selectedReceipt?.reference === rec.reference;
                    return (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedReceipt(rec)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isPicked
                            ? 'bg-[#E9F5FE] dark:bg-[#2589FF]/10 border-[#1685F8] dark:border-[#2589FF]'
                            : 'bg-white dark:bg-[#141414] border-[#D8E9FA] dark:border-[#303030] hover:bg-slate-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-[#10274A] dark:text-[#F5F5F5]">
                            {rec.groupName}
                          </div>
                          <div className="text-[10px] font-mono text-[#64748B] dark:text-[#737373]">
                            Ref: {rec.reference}
                          </div>
                          <div className="text-[10px] text-[#64748B] dark:text-[#737373]">
                            {new Date(rec.date).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-[#1685F8] dark:text-[#2589FF]">
                            {rec.currency === 'INR' ? '₹' : rec.currency}
                            {rec.amount.toLocaleString()}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600">
                            {rec.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedReceipt && (
                <div className="pt-3 border-t border-[#D8E9FA]/60 dark:border-[#303030] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#64748B]">Selected: </span>
                    <span className="font-bold text-[#10274A] dark:text-[#F5F5F5]">
                      {selectedReceipt.currency} {selectedReceipt.amount} ({selectedReceipt.groupName})
                    </span>
                  </div>

                  <button
                    onClick={handleConfirmShareReceipt}
                    disabled={sendingMessage}
                    className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center space-x-1.5"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to Friend</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ReceiptModal
        isOpen={inspectReceiptOpen}
        onClose={() => setInspectReceiptOpen(false)}
        receipt={inspectReceipt}
      />
    </div>
  );
};

export default ContactsPage;
