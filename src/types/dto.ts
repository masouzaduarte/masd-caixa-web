export interface AuthResponse {
  token: string;
  userId: string;
  companyId: string;
  name: string;
  email: string;
  authProvider?: string; // 'LOCAL' | 'GOOGLE' | 'LOCAL_GOOGLE'
  linkedGoogleEmail?: string | null;
}

export interface GoogleStartResponse {
  status: 'EXISTING_USER' | 'NEEDS_COMPANY' | 'LINK_REQUIRED';
  email?: string;
  name?: string;
  googleSub?: string;
  tempToken?: string;
  auth?: AuthResponse;
}

export interface CompanyResponse {
  id: string;
  name: string;
  email: string;
}

export interface AccountResponse {
  id: string;
  companyId: string;
  name: string;
  initialBalance: number;
}

export interface AccountBalanceResponse {
  accountId: string;
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

export interface AccountDashboardResponse {
  currentBalance: number;
  projectedBalance30Days: number;
  avgDailyIncomeLast30Days: number;
  avgDailyExpenseLast30Days: number;
  alert: string | null;
}

export interface CategoryDTO {
  id: string;
  name: string;
  color: string;
}

export interface CategoryAnalyticsDTO {
  categoryId: string | null;
  name: string;
  color: string;
  totalAmount: number;
  percentage: number;
}

export interface TransactionResponse {
  id: string;
  accountId: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  amount: number;
  transactionDate: string;
  createdAt?: string;
  category?: CategoryDTO | null;
}

export interface TransactionListItemResponse {
  id: string;
  type: string;
  description: string | null;
  amount: number;
  transactionDate: string;
  createdAt: string;
  category?: CategoryDTO | null;
}

export interface TransactionPageResponse {
  accountId: string;
  from: string;
  to: string;
  totalIncome: number;
  totalExpense: number;
  netTotal: number;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: TransactionListItemResponse[];
}

export interface AccountPeriodRuleResponse {
  accountId: string;
  mode: string;
  closingDay: number | null;
  cycleDays: number | null;
  anchorDate: string | null;
  updatedAt: string;
}

export interface PeriodRangeResponse {
  accountId: string;
  startDate: string;
  endDate: string;
  label: string;
  mode: string;
  closingDay: number | null;
  cycleDays: number | null;
}

export interface ImportFailureItem {
  lineNumber: number;
  reason: string;
  raw: string;
}

export interface ImportTransactionsResponse {
  accountId: string;
  totalLines: number;
  importedCount: number;
  failedCount: number;
  failures: ImportFailureItem[];
}
