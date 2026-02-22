import { api } from './client';
import type {
  AuthResponse,
  AccountResponse,
  AccountBalanceResponse,
  AccountDashboardResponse,
  TransactionResponse,
} from '../types/dto';

export function register(payload: {
  name: string;
  companyName: string;
  email: string;
  password: string;
}) {
  return api.post<AuthResponse>('/auth/register', payload);
}

export function login(payload: { email: string; password: string }) {
  return api.post<AuthResponse>('/auth/login', payload);
}

export function createAccount(payload: { name: string; initialBalance: number }) {
  return api.post<AccountResponse>('/accounts', payload);
}

export function listAccounts() {
  return api.get<AccountResponse[]>('/accounts');
}

export function getBalance(accountId: string) {
  return api.get<AccountBalanceResponse>(`/accounts/${accountId}/balance`);
}

export function getDashboard(accountId: string) {
  return api.get<AccountDashboardResponse>(`/accounts/${accountId}/dashboard`);
}

export function getAccountTransactions(accountId: string) {
  return api.get<TransactionResponse[]>(`/accounts/${accountId}/transactions`);
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
