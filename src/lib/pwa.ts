import { useEffect, useState } from 'react';
export function usePwa() {
  const [ready, setReady] = useState(false);
  const [update, setUpdate] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
    let registration: ServiceWorkerRegistration | undefined;
    let disposed = false;
    const readyHandler = () => {
      if (!disposed) setReady(true);
    };
    const controller = () => {
      readyHandler();
      if (sessionStorage.getItem('oliver-updating')) {
        sessionStorage.removeItem('oliver-updating');
        location.reload();
      }
    };
    const check = () => {
      if (navigator.onLine) void registration?.update().catch(() => {});
    };
    navigator.serviceWorker.addEventListener('controllerchange', controller);
    window.addEventListener('focus', check);
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' })
      .then((reg) => {
        registration = reg;
        if (disposed) return;
        if (navigator.serviceWorker.controller) readyHandler();
        if (reg.waiting) setUpdate(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller && !disposed)
              setUpdate(worker);
          });
        });
        void navigator.serviceWorker.ready.then(readyHandler);
      })
      .catch((error) => console.warn('離線快取未完成，請連網後重新開啟。', error));
    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener('controllerchange', controller);
      window.removeEventListener('focus', check);
    };
  }, []);
  return {
    ready,
    update,
    installUpdate: () => {
      if (!update) return;
      sessionStorage.setItem('oliver-updating', '1');
      update.postMessage({ type: 'SKIP_WAITING' });
    },
  };
}
