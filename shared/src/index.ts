// User and Authentication Types
export type UserRole = 'treasurer' | 'coach' | 'parent' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Team Types
export type SportType =
  | 'soccer'
  | 'baseball'
  | 'basketball'
  | 'hockey'
  | 'football'
  | 'lacrosse'
  | 'volleyball'
  | 'softball'
  | 'swimming'
  | 'tennis'
  | 'other';

export interface Team {
  id: string;
  name: string;
  sport: SportType;
  season: string;
  ageGroup?: string;
  logoUrl?: string;
  currency: string;
  budgetAlertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: UserRole;
  joinedAt: Date;
  isActive: boolean;
}

// Transaction Types
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'completed' | 'voided';

export type ExpenseCategory =
  | 'registration'
  | 'equipment'
  | 'uniforms'
  | 'tournament'
  | 'travel'
  | 'field_rental'
  | 'coaching'
  | 'insurance'
  | 'fundraising'
  | 'supplies'
  | 'snacks'
  | 'trophies'
  | 'photography'
  | 'other';

export type IncomeCategory =
  | 'registration_fee'
  | 'fundraising'
  | 'sponsorship'
  | 'donation'
  | 'other';

export interface Transaction {
  id: string;
  teamId: string;
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | IncomeCategory;
  description: string;
  date: Date;
  status: TransactionStatus;
  receiptId?: string;
  createdBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Receipt Types
export interface Receipt {
  id: string;
  transactionId: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  ocrData?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Budget Types
export interface BudgetCategory {
  id: string;
  teamId: string;
  category: ExpenseCategory;
  allocatedAmount: number;
  spentAmount: number;
  season: string;
}

export interface Budget {
  id: string;
  teamId: string;
  season: string;
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  categories: BudgetCategory[];
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Types
export interface DashboardSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  pendingTransactions: number;
  recentTransactions: Transaction[];
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
}

export interface CategoryBreakdown {
  category: ExpenseCategory | IncomeCategory;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

// Notification Types
export type NotificationType =
  | 'expense_added'
  | 'large_expense'
  | 'budget_alert'
  | 'payment_due'
  | 'payment_received'
  | 'weekly_summary';

export interface Notification {
  id: string;
  userId: string;
  teamId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// API Request/Response Types
export interface CreateTransactionRequest {
  teamId: string;
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | IncomeCategory;
  description: string;
  date: string;
  notes?: string;
}

export interface CreateTransactionResponse {
  success: boolean;
  transaction: Transaction;
  newBalance: number;
}

export interface DashboardRequest {
  teamId: string;
  dateRange?: 'week' | 'month' | 'quarter' | 'season' | 'all';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Utility types
export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP';

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'registration', label: 'Registration' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'uniforms', label: 'Uniforms' },
  { value: 'tournament', label: 'Tournament Fees' },
  { value: 'travel', label: 'Travel' },
  { value: 'field_rental', label: 'Field Rental' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'fundraising', label: 'Fundraising Expenses' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'snacks', label: 'Snacks & Refreshments' },
  { value: 'trophies', label: 'Trophies & Awards' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
];

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: 'registration_fee', label: 'Registration Fees' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'donation', label: 'Donation' },
  { value: 'other', label: 'Other' },
];

export const SPORT_TYPES: { value: SportType; label: string }[] = [
  { value: 'soccer', label: 'Soccer' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'hockey', label: 'Hockey' },
  { value: 'football', label: 'Football' },
  { value: 'lacrosse', label: 'Lacrosse' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'softball', label: 'Softball' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'other', label: 'Other' },
];

// Format helpers
export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100); // Amounts stored in cents
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getCategoryLabel(category: ExpenseCategory | IncomeCategory): string {
  const expense = EXPENSE_CATEGORIES.find(c => c.value === category);
  if (expense) return expense.label;

  const income = INCOME_CATEGORIES.find(c => c.value === category);
  if (income) return income.label;

  return category;
}
