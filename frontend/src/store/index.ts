import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Team, DashboardSummary, Transaction, Notification } from '@teambudget/shared';
import { authApi, teamsApi, transactionsApi, notificationsApi } from '../lib/api';

interface AuthState {
  user: (User & { teams?: Team[] }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  dashboard: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  selectTeam: (teamId: string) => Promise<void>;
  fetchDashboard: (teamId: string) => Promise<void>;
  createTeam: (data: { name: string; sport: string; season: string; ageGroup?: string }) => Promise<void>;
}

interface TransactionState {
  transactions: Transaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (teamId: string, params?: Record<string, unknown>) => Promise<void>;
  createTransaction: (data: {
    teamId: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
    notes?: string;
  }) => Promise<void>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (teamId?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (teamId?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email, password) => {
        const response = await authApi.login(email, password);
        if (response.success && response.data) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          set({ user: response.data.user, isAuthenticated: true });
        }
      },

      register: async (data) => {
        const response = await authApi.register(data);
        if (response.success && response.data) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          set({ user: response.data.user, isAuthenticated: true });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          const response = await authApi.getMe();
          if (response.success && response.data) {
            set({ user: response.data, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false, isAuthenticated: false });
          }
        } catch {
          set({ isLoading: false, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  dashboard: null,
  isLoading: false,
  error: null,

  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await teamsApi.getTeams();
      if (response.success && response.data) {
        set({ teams: response.data, isLoading: false });

        // Auto-select first team if none selected
        if (!get().currentTeam && response.data.length > 0) {
          await get().selectTeam(response.data[0].id);
        }
      }
    } catch (error) {
      set({ error: 'Failed to fetch teams', isLoading: false });
    }
  },

  selectTeam: async (teamId) => {
    const team = get().teams.find((t) => t.id === teamId);
    if (team) {
      set({ currentTeam: team });
      await get().fetchDashboard(teamId);
    }
  },

  fetchDashboard: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await teamsApi.getDashboard(teamId);
      if (response.success && response.data) {
        set({ dashboard: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch dashboard', isLoading: false });
    }
  },

  createTeam: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await teamsApi.createTeam(data);
      if (response.success && response.data) {
        set((state) => ({
          teams: [...state.teams, response.data!],
          currentTeam: response.data,
          isLoading: false,
        }));
      }
    } catch (error) {
      set({ error: 'Failed to create team', isLoading: false });
    }
  },
}));

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  isLoading: false,
  error: null,

  fetchTransactions: async (teamId, params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionsApi.getTransactions(teamId, params);
      if (response.success) {
        set({
          transactions: response.data,
          pagination: response.pagination,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to fetch transactions', isLoading: false });
    }
  },

  createTransaction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionsApi.createTransaction(data);
      if (response.success && response.data) {
        set((state) => ({
          transactions: [response.data!.transaction, ...state.transactions],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({ error: 'Failed to create transaction', isLoading: false });
    }
  },
}));

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (teamId) => {
    set({ isLoading: true });
    try {
      const response = await notificationsApi.getNotifications({ teamId });
      if (response.success) {
        set({
          notifications: response.data,
          unreadCount: response.unreadCount,
          isLoading: false,
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    await notificationsApi.markAsRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async (teamId) => {
    await notificationsApi.markAllAsRead(teamId);
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
