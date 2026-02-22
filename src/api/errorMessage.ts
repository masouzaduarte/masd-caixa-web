import { AxiosError } from 'axios';

/**
 * Extrai mensagem de erro da resposta da API ou retorna mensagem padrão.
 * Se não houver response (ex.: CORS, rede), sugere verificar API e CORS.
 */
export function getApiErrorMessage(err: unknown, defaultMessage: string): string {
  if (!err || typeof err !== 'object' || !('isAxiosError' in err)) {
    return defaultMessage;
  }
  const axiosErr = err as AxiosError<{ message?: string; error?: string; detail?: string; errors?: Array<{ defaultMessage?: string }> }>;
  const data = axiosErr.response?.data;
  if (!data) {
    const status = axiosErr.response?.status;
    if (status != null) return `${defaultMessage} (HTTP ${status})`;
    return `${defaultMessage} Verifique se a API está em http://localhost:8080 e se CORS está habilitado.`;
  }
  if (typeof data.message === 'string' && data.message) return data.message;
  if (typeof data.detail === 'string' && data.detail) return data.detail;
  if (typeof data.error === 'string' && data.error) return data.error;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    const msg = first?.defaultMessage ?? (typeof first === 'string' ? first : null);
    if (msg) return msg;
  }
  return defaultMessage;
}
