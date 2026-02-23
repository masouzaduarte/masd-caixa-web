import axios from 'axios';
import { api, apiBaseURL } from './client';
import { getToken } from '../storage/authStorage';
import type {
  AuthResponse,
  GoogleStartResponse,
  AccountResponse,
  AccountBalanceResponse,
  AccountDashboardResponse,
  TransactionResponse,
  TransactionPageResponse,
  ImportTransactionsResponse,
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

/** POST /auth/google/start — sem Authorization. */
export function googleStart(idToken: string) {
  return api.post<GoogleStartResponse>('/auth/google/start', { idToken });
}

/** POST /auth/google/link — requer JWT. */
export function googleLink(idToken: string) {
  return api.post<AuthResponse>('/auth/google/link', { idToken });
}

/** POST /auth/forgot-password — sem Authorization. */
export function forgotPassword(email: string): Promise<void> {
  return axios
    .post(
      `${apiBaseURL.replace(/\/$/, '')}/auth/forgot-password`,
      { email },
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(() => undefined);
}

/** POST /auth/reset-password — sem Authorization. */
export function resetPassword(token: string, newPassword: string): Promise<void> {
  return axios
    .post(
      `${apiBaseURL.replace(/\/$/, '')}/auth/reset-password`,
      { token, newPassword },
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(() => undefined);
}

export function createAccount(payload: { name: string; initialBalance: number }) {
  return api.post<AccountResponse>('/accounts', payload);
}

export function listAccounts() {
  return api.get<AccountResponse[]>('/accounts');
}

export function updateAccount(accountId: string, payload: { name: string }) {
  return api.patch<AccountResponse>(`/accounts/${accountId}`, payload);
}

export function getBalance(accountId: string) {
  return api.get<AccountBalanceResponse>(`/accounts/${accountId}/balance`);
}

export function getDashboard(accountId: string) {
  return api.get<AccountDashboardResponse>(`/accounts/${accountId}/dashboard`);
}

export function getTransactions(
  accountId: string,
  params: {
    from: string;
    to: string;
    type?: 'INCOME' | 'EXPENSE';
    q?: string;
    categoryId?: string;
    page?: number;
    size?: number;
  }
) {
  return api.get<TransactionPageResponse>(`/accounts/${accountId}/transactions`, { params });
}

export function createTransaction(payload: {
  accountId: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  amount: number;
  transactionDate: string;
  categoryId?: string | null;
}) {
  return api.post<TransactionResponse>('/transactions', payload);
}

export function getCategories() {
  return api.get<import('../types/dto').CategoryDTO[]>('/category');
}

export function createCategory(payload: { name: string; color: string }) {
  return api.post<import('../types/dto').CategoryDTO>('/category', payload);
}

export function updateCategory(id: string, payload: { name: string; color: string }) {
  return api.put<import('../types/dto').CategoryDTO>(`/category/${id}`, payload);
}

export function deleteCategory(id: string) {
  return api.delete(`/category/${id}`);
}

export function getCategoryAnalytics(
  accountId: string,
  params: { from: string; to: string; type: 'INCOME' | 'EXPENSE' }
) {
  return api.get<import('../types/dto').CategoryAnalyticsDTO[]>(
    `/accounts/${accountId}/analytics/categories`,
    { params }
  );
}

export function upsertAccountPeriodRule(
  accountId: string,
  payload: {
    mode: 'CLOSING_DAY' | 'CYCLE_DAYS';
    closingDay?: number;
    cycleDays?: number;
    anchorDate?: string;
  }
) {
  return api.put<import('../types/dto').AccountPeriodRuleResponse>(
    `/accounts/${accountId}/period-rule`,
    payload
  );
}

export function getAccountPeriodRule(accountId: string) {
  return api.get<import('../types/dto').AccountPeriodRuleResponse>(
    `/accounts/${accountId}/period-rule`
  );
}

export function getCurrentPeriod(accountId: string, date?: string) {
  return api.get<import('../types/dto').PeriodRangeResponse>(
    `/accounts/${accountId}/period/current`,
    date ? { params: { date } } : undefined
  );
}

export function exportTransactionsCsv(
  accountId: string,
  params: { from: string; to: string; type?: 'INCOME' | 'EXPENSE'; q?: string; categoryId?: string }
) {
  return api.get<Blob>(`/accounts/${accountId}/transactions/export.csv`, {
    params,
    responseType: 'blob',
  });
}

export function importTransactionsCsv(
  accountId: string,
  file: File,
  mode: 'STRICT' | 'LENIENT'
) {
  const form = new FormData();
  form.append('file', file);
  form.append('mode', mode);
  return api.post<ImportTransactionsResponse>(
    `/accounts/${accountId}/transactions/import`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

/**
 * Baixa o PDF "Resumo do Período" via fetch (blob). Usa token do authStorage.
 * Se from/to não forem passados, o backend usa o período atual da conta.
 */
export async function downloadPeriodSummaryPdf(
  accountId: string,
  params: { from?: string; to?: string } = {},
  filename?: string
): Promise<void> {
  const url = new URL(`${apiBaseURL.replace(/\/$/, '')}/accounts/${accountId}/reports/period-summary.pdf`);
  if (params.from) url.searchParams.set('from', params.from);
  if (params.to) url.searchParams.set('to', params.to);

  const token = getToken();
  const response = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Falha ao gerar PDF (${response.status})`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const name =
    filename ?? `resumo-periodo-${accountId}-${params.from ?? 'auto'}-${params.to ?? 'auto'}.pdf`;
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = name;
  a.click();
  URL.revokeObjectURL(blobUrl);
}
