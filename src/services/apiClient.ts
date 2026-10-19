/**
 * APD MUSIC CLASS - Typed Enterprise API Client
 * Seamlessly interfaces with the Express backend on /api (via Vite proxy or direct PORT 4000)
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiClient {
  private baseUrl = '/api';

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('apd_token') || 'demo-owner-token';
    return {
      Authorization: `Bearer ${token}`
    };
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options.headers as Record<string, string> || {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || `HTTP error ${res.status}`);
      }
      return json;
    } catch (err: any) {
      console.error(`[API Client Error] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // System & Health
  public async getHealth() {
    return this.request('/health');
  }

  public setToken(token: string | null) {
    if (token) {
      localStorage.setItem('apd_token', token);
    } else {
      localStorage.removeItem('apd_token');
    }
  }

  // Authentication
  public auth = {
    login: (credentials: { email: string; password: string; role?: 'CLIENT' | 'OWNER' }) =>
      this.request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: { fullName: string; email: string; phone: string; password: string; confirmPassword: string }) =>
      this.request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => this.request('/auth/me'),
    logout: () => this.request('/auth/logout', { method: 'POST' }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      this.request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
    forgotPassword: (email: string) =>
      this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (data: { token: string; newPassword: string }) =>
      this.request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) })
  };

  // Branches
  public branches = {
    getAll: () => this.request('/branches'),
    getById: (id: string) => this.request(`/branches/${id}`),
    updateAddress: (id: string, address: string) =>
      this.request(`/branches/${id}/address`, { method: 'PATCH', body: JSON.stringify({ address }) })
  };

  // Instruments
  public instruments = {
    getAll: () => this.request('/instruments'),
    getById: (id: string) => this.request(`/instruments/${id}`)
  };

  // Plans
  public plans = {
    getAll: () => this.request('/plans')
  };

  // Members
  public members = {
    getAll: (query?: { search?: string; branchId?: string; instrumentId?: string; status?: string }) => {
      const q = query ? '?' + new URLSearchParams(query as any).toString() : '';
      return this.request(`/members${q}`);
    },
    getById: (id: string) => this.request(`/members/${id}`),
    update: (id: string, data: any) =>
      this.request(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getExpiring: (withinDays = 15) => this.request(`/members/expiring?withinDays=${withinDays}`)
  };

  // Teachers
  public teachers = {
    getAll: (params?: { branchId?: string; instrumentId?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request(`/teachers${q}`);
    },
    getById: (id: string) => this.request(`/teachers/${id}`),
    create: (data: any) => this.request('/teachers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      this.request(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getSchedule: (id: string, date?: string) =>
      this.request(`/teachers/${id}/schedule${date ? `?date=${date}` : ''}`)
  };

  // Memberships
  public memberships = {
    getAll: (params?: { memberId?: string; branchId?: string; status?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request(`/memberships${q}`);
    },
    enroll: (data: {
      memberId: string;
      planId: string;
      instrumentId: string;
      branchId: string;
      startDate?: string;
      paymentMethod?: string;
    }) => this.request('/memberships', { method: 'POST', body: JSON.stringify(data) }),
    renew: (membershipId: string, data: { planId: string; paymentMethod: string; discountCode?: string }) =>
      this.request(`/memberships/${membershipId}/renew`, { method: 'POST', body: JSON.stringify(data) })
  };

  // Bookings
  public bookings = {
    getAll: (params?: { memberId?: string; branchId?: string; classDate?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request(`/bookings${q}`);
    },
    getById: (id: string) => this.request(`/bookings/${id}`),
    create: (data: {
      memberId: string;
      branchId: string;
      instrumentId: string;
      classDate: string;
      slotId: number;
      teacherId?: string;
      membershipId?: string;
      paymentMode?: string;
    }) => this.request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    reschedule: (id: string, data: { newClassDate: string; newSlotId: number; reason?: string }) =>
      this.request(`/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify(data) }),
    cancel: (id: string, reason: string) =>
      this.request(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) })
  };

  // Financials: Payments & Expenses
  public financials = {
    getPayments: (params?: { memberId?: string; branchId?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request(`/payments${q}`);
    },
    createPayment: (data: any) => this.request('/payments', { method: 'POST', body: JSON.stringify(data) }),
    createCheckoutSession: (data: { membershipId: string; amount: number; description?: string }) =>
      this.request('/payments/checkout-session', { method: 'POST', body: JSON.stringify(data) }),
    submitWebhook: (data: any, signature?: string) =>
      this.request('/payments/webhook', {
        method: 'POST',
        headers: signature ? { 'x-payment-signature': signature } : {},
        body: JSON.stringify(data)
      }),
    refundPayment: (paymentId: string, data: { refundAmount: number; reason: string }) =>
      this.request(`/payments/${paymentId}/refund`, { method: 'POST', body: JSON.stringify(data) }),
    getExpenses: (params?: { branchId?: string; category?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request(`/expenses${q}`);
    },
    createExpense: (data: any) => this.request('/expenses', { method: 'POST', body: JSON.stringify(data) })
  };

  // Executive Reports (Owner Only)
  public reports = {
    getOverview: () => this.request('/reports/overview'),
    getRevenueExpenses: (branchId?: string) =>
      this.request(`/reports/revenue-expenses${branchId ? `?branchId=${branchId}` : ''}`),
    getByInstrument: () => this.request('/reports/by-instrument'),
    getByBranch: () => this.request('/reports/by-branch'),
    getMembershipExpiry: () => this.request('/reports/membership-expiry')
  };
}

export const api = new ApiClient();
