import { useCallback, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export type ServiceWorkerStatus =
  | 'registering'
  | 'offline-ready'
  | 'update-available'
  | 'unsupported';

interface UseServiceWorkerManagerOptions {
  onNotify?: (title: string, description?: string, variant?: 'success' | 'info') => void;
}

export function useServiceWorkerManager({ onNotify }: UseServiceWorkerManagerOptions = {}) {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return 'unsupported';
    }
    return navigator.serviceWorker.controller ? 'offline-ready' : 'registering';
  });
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState<boolean>(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }
    return Boolean(navigator.serviceWorker.controller);
  });
  const [lastSyncedLabel, setLastSyncedLabel] = useState<string>('Ativo agora');

  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const onNotifyRef = useRef(onNotify);

  useEffect(() => {
    onNotifyRef.current = onNotify;
  }, [onNotify]);

  // Network connectivity listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSyncedLabel(
        new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      );
      onNotifyRef.current?.(
        'Ligação restabelecida',
        'A sua ligação à internet voltou ao normal em Angola.',
        'success',
      );
    };

    const handleOffline = () => {
      setIsOnline(false);
      onNotifyRef.current?.(
        'Modo Offline ativo',
        'Sem ligação à internet. A plataforma PAGUEI! continua acessível via cache local.',
        'info',
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register VitePWA Service Worker
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      setSwStatus('unsupported');
      return;
    }

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
        setSwStatus('update-available');
        onNotifyRef.current?.(
          'Nova atualização disponível',
          'Clique em Atualizar App para carregar a versão mais recente do PAGUEI!.',
          'info',
        );
      },
      onOfflineReady() {
        setOfflineReady(true);
        setSwStatus('offline-ready');
        setLastSyncedLabel(
          new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
        );
        onNotifyRef.current?.(
          'PAGUEI! pronto para uso offline',
          'Conteúdo essencial guardado no dispositivo para conexões instáveis.',
          'success',
        );
      },
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          registrationRef.current = registration;
          if (registration.active) {
            setOfflineReady(true);
            setSwStatus((prev) => (prev === 'update-available' ? prev : 'offline-ready'));
          }
        }
      },
      onRegisterError() {
        setSwStatus('unsupported');
      },
    });

    updateSWRef.current = updateSW;
  }, []);

  const applyUpdate = useCallback(async () => {
    if (updateSWRef.current) {
      await updateSWRef.current(true);
      setNeedRefresh(false);
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  const verifyOfflineCache = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      onNotifyRef.current?.(
        'Navegador sem Service Worker',
        'Este navegador não suporta armazenamento offline avançado.',
        'info',
      );
      return;
    }

    try {
      const reg = registrationRef.current ?? (await navigator.serviceWorker.getRegistration());
      if (reg) {
        if (navigator.onLine) {
          await reg.update();
        }
        setOfflineReady(true);
        setSwStatus(reg.waiting ? 'update-available' : 'offline-ready');
        setLastSyncedLabel(
          new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
        );
        onNotifyRef.current?.(
          'Cache offline verificado',
          'Landing page e painel PAGUEI! disponíveis mesmo sem internet.',
          'success',
        );
      } else {
        onNotifyRef.current?.(
          'Service Worker em preparação',
          'A concluir o armazenamento local para acesso offline.',
          'info',
        );
      }
    } catch {
      onNotifyRef.current?.(
        'Modo offline ativo',
        'A utilizar os ficheiros já guardados neste dispositivo.',
        'info',
      );
    }
  }, []);

  return {
    isOnline,
    swStatus,
    offlineReady,
    needRefresh,
    lastSyncedLabel,
    applyUpdate,
    dismissUpdate,
    verifyOfflineCache,
  };
}
