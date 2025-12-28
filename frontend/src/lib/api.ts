import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Team,
  Transaction,
  DashboardSummary,
  Notification,
  Receipt,
  CreateTransactionRequest,
} from '@teambudget/shared';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return axios(error.config);
          }
        } catch {
          // Refresh failed, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/login',
      { email, password }
    );
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User & { teams: Team[] }>>('/auth/me');
    return response.data;
  },
};

// Teams API
export const teamsApi = {
  getTeams: async () => {
    const response = await api.get<ApiResponse<Team[]>>('/teams');
    return response.data;
  },

  getTeam: async (teamId: string) => {
    const response = await api.get<ApiResponse<Team>>(`/teams/${teamId}`);
    return response.data;
  },

  createTeam: async (data: { name: string; sport: string; season: string; ageGroup?: string }) => {
    const response = await api.post<ApiResponse<Team>>('/teams', data);
    return response.data;
  },

  updateTeam: async (teamId: string, data: Partial<Team>) => {
    const response = await api.put<ApiResponse<Team>>(`/teams/${teamId}`, data);
    return response.data;
  },

  getDashboard: async (teamId: string) => {
    const response = await api.get<ApiResponse<DashboardSummary>>(`/teams/${teamId}/dashboard`);
    return response.data;
  },

  addMember: async (teamId: string, email: string, role: string) => {
    const response = await api.post<ApiResponse<{ id: string }>>(`/teams/${teamId}/members`, { email, role });
    return response.data;
  },

  removeMember: async (teamId: string, memberId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/teams/${teamId}/members/${memberId}`);
    return response.data;
  },
};

// Transactions API
export const transactionsApi = {
  getTransactions: async (
    teamId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await api.get<PaginatedResponse<Transaction>>('/transactions', {
      params: { teamId, ...params },
    });
    return response.data;
  },

  getTransaction: async (id: string) => {
    const response = await api.get<ApiResponse<Transaction & { receipt?: Receipt }>>(`/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data: CreateTransactionRequest) => {
    const response = await api.post<ApiResponse<{ transaction: Transaction; newBalance: number }>>(
      '/transactions',
      data
    );
    return response.data;
  },

  updateTransaction: async (id: string, data: Partial<CreateTransactionRequest>) => {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return response.data;
  },

  voidTransaction: async (id: string) => {
    const response = await api.post<ApiResponse<void>>(`/transactions/${id}/void`);
    return response.data;
  },
};

// Receipts API
export const receiptsApi = {
  uploadReceipt: async (transactionId: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('transactionId', transactionId);

    const response = await api.post<ApiResponse<Receipt>>('/receipts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteReceipt: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/receipts/${id}`);
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean; teamId?: string }) => {
    const response = await api.get<PaginatedResponse<Notification> & { unreadCount: number }>('/notifications', {
      params,
    });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put<ApiResponse<void>>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (teamId?: string) => {
    const response = await api.put<ApiResponse<void>>('/notifications/read-all', null, {
      params: teamId ? { teamId } : undefined,
    });
    return response.data;
  },
};

export default api;
