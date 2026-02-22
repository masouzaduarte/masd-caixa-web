import { api } from './client';
import type {
  CompanyResponse,
  AccountResponse,
  AccountBalanceResponse,
  AccountDashboardResponse,
  TransactionResponse,
} from '../types/dto';

export function createCompany(payload: { name: string; email: string }) {
  return api.post<CompanyResponse>('/companies', payload);
}

export function createAccount(payload: {
  companyId: string;
  name: string;
  initialBalance: number;
}) {
  return api.post<AccountResponse>('/accounts', payload);
}

export function createTransaction(payload: {
  accountId: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  amount: number;
  transactionDate: string;
}) {
  return api.post<TransactionResponse>('/transactions', payload);
}

export function getBalance(accountId: string) {
  return api.get<AccountBalanceResponse>(`/accounts/${accountId}/balance`);
}

export function getDashboard(accountId: string) {
  return api.get<AccountDashboardResponse>(`/accounts/${accountId}/dashboard`);
}
