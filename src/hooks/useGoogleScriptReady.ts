import { useState, useEffect } from 'react';

/** Retorna true quando window.google?.accounts?.id está disponível (script GSI carregou). */
export function useGoogleScriptReady(): boolean {
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && !!window.google?.accounts?.id);

  useEffect(() => {
    if (ready) return;
    const check = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        setReady(true);
        return true;
      }
      return false;
    };
    if (check()) return;
    const t = setInterval(() => {
      if (check()) clearInterval(t);
    }, 150);
    return () => clearInterval(t);
  }, [ready]);

  return ready;
}
