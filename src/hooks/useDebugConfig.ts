import { useState, useEffect } from 'react';

export type DebugConfigState = {
  configJsStatus: number | null;
  configJsBody: string;
  windowMasdCaixa: Record<string, unknown> | null;
};

/** Quando ?debug=1: busca /config.js e lê window.MASD_CAIXA para exibir no painel de debug. */
export function useDebugConfig(enabled: boolean): DebugConfigState {
  const [state, setState] = useState<DebugConfigState>({
    configJsStatus: null,
    configJsBody: '',
    windowMasdCaixa: null,
  });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const w = (window as { MASD_CAIXA?: Record<string, unknown> }).MASD_CAIXA;
    setState((s) => ({
      ...s,
      windowMasdCaixa: w ? { ...w } : null,
    }));

    fetch('/config.js', { cache: 'no-store' })
      .then((r) => {
        return r.text().then((body) => ({ status: r.status, body }));
      })
      .then(({ status, body }) => {
        setState((s) => ({
          ...s,
          configJsStatus: status,
          configJsBody: body.slice(0, 500) + (body.length > 500 ? '...' : ''),
        }));
      })
      .catch(() => {
        setState((s) => ({ ...s, configJsStatus: -1, configJsBody: '(fetch error)' }));
      });
  }, [enabled]);

  return state;
}
