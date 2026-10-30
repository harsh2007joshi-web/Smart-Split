const API_BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('splitsmart_auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || data.message || `Request failed with status ${response.status}`, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth & 2Factor.in Phone OTP
  register: (payload: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  sendPhoneOtp: (phone: string) => request<any>('/auth/send-phone-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyPhoneOtp: (phone: string, otp: string, sessionId?: string) => request<any>('/auth/verify-phone-otp', { method: 'POST', body: JSON.stringify({ phone, otp, sessionId }) }),
  verifyEmail: (payload: any) => request<any>('/auth/verify-email', { method: 'POST', body: JSON.stringify(payload) }),
  resendVerification: (userId: string) => request<any>('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ userId }) }),
  login: (payload: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (emailOrPhone: string) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: emailOrPhone, phone: emailOrPhone }) }),
  verifyResetOtp: (challengeId: string, otp: string) => request<any>('/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify({ challengeId, otp }) }),
  resetPassword: (payload: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  getCurrentUser: () => request<any>('/auth/me'),
  demoLogin: () => request<any>('/auth/demo-login', { method: 'POST' }),
  resetDemoData: () => request<any>('/auth/reset-demo', { method: 'POST' }),

  // Dashboard
  getDashboard: () => request<any>('/dashboard'),

  // Groups & Trip Member Invitations
  getGroups: () => request<any>('/groups'),
  createGroup: (payload: any) => request<any>('/groups', { method: 'POST', body: JSON.stringify(payload) }),
  getGroupDetails: (groupId: string) => request<any>(`/groups/${groupId}`),
  addMember: (groupId: string, payload: any) => request<any>(`/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify(payload) }),
  joinGroup: (token: string) => request<any>('/groups/join', { method: 'POST', body: JSON.stringify({ token }) }),
  deleteGroup: (groupId: string) => request<any>(`/groups/${groupId}`, { method: 'DELETE' }),
  updateGroupBudget: (groupId: string, budget: number) => request<any>(`/groups/${groupId}/budget`, { method: 'PUT', body: JSON.stringify({ budget }) }),

  // Expenses
  addExpense: (groupId: string, payload: any) => request<any>(`/expenses/group/${groupId}`, { method: 'POST', body: JSON.stringify(payload) }),
  checkDuplicateExpense: (payload: { groupId: string; title: string; amount: number | string; payerId?: string; date?: string }) =>
    request<any>('/expenses/check-duplicate', { method: 'POST', body: JSON.stringify(payload) }),
  updateExpense: (expenseId: string, payload: any) => request<any>(`/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExpense: (expenseId: string) => request<any>(`/expenses/${expenseId}`, { method: 'DELETE' }),

  // Settlements
  getSettlements: () => request<any>('/settlements'),
  remindSettlement: (payload: any) => request<any>('/settlements/remind', { method: 'POST', body: JSON.stringify(payload) }),

  // Payments, GPay & Printable Receipts
  createPayPalOrder: (payload: any) => request<any>('/payments/paypal/create-order', { method: 'POST', body: JSON.stringify(payload) }),
  capturePayPalOrder: (payload: any) => request<any>('/payments/paypal/capture-order', { method: 'POST', body: JSON.stringify(payload) }),
  cardCheckout: (payload: any) => request<any>('/payments/card-checkout', { method: 'POST', body: JSON.stringify(payload) }),
  googlePayCheckout: (payload: any) => request<any>('/payments/google-pay', { method: 'POST', body: JSON.stringify(payload) }),
  cancelPayment: (payload?: any) => request<any>('/payments/cancel', { method: 'POST', body: JSON.stringify(payload || {}) }),
  getReceipt: (reference: string) => request<any>(`/payments/receipt/${reference}`),
  getTransactions: () => request<any>('/payments/transactions'),

  // AI Assistant & OCR Receipt Scanner
  parseExpenseWithAI: (prompt: string) => request<any>('/ai/expense-parse', { method: 'POST', body: JSON.stringify({ prompt }) }),
  askAIAssistant: (question: string) => request<any>('/ai/ask', { method: 'POST', body: JSON.stringify({ question }) }),
  scanReceipt: (imageBase64: string, mimeType?: string) => request<any>('/ai/scan-receipt', { method: 'POST', body: JSON.stringify({ imageBase64, mimeType }) }),

  // Analytics
  getAnalytics: () => request<any>('/analytics'),

  // Notifications & Sharing
  getNotifications: () => request<any>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),
  shareLink: (payload: { email: string; friendName?: string; targetUrl?: string; note?: string }) =>
    request<any>('/notifications/share-link', { method: 'POST', body: JSON.stringify(payload) }),
  getEmailStatus: () => request<any>('/notifications/email-status'),
  setPublicUrl: (appUrl: string) => request<any>('/notifications/set-public-url', { method: 'POST', body: JSON.stringify({ appUrl }) }),
};
