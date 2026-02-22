const STORAGE_KEY = 'masd_caixa_account_id';

export function getAccountId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setAccountId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}

export function clearAccountId(): void {
  localStorage.removeItem(STORAGE_KEY);
}
