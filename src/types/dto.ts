export interface AuthResponse {
  token: string;
  userId: string;
  companyId: string;
  name: string;
  email: string;
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
  balance: number;
}

export interface AccountDashboardResponse {
  currentBalance: number;
  projectedBalance30Days: number;
  avgDailyIncomeLast30Days: number;
  avgDailyExpenseLast30Days: number;
  alert: string | null;
}

export interface TransactionResponse {
  id: string;
  accountId: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  amount: number;
  transactionDate: string;
  createdAt?: string;
}
