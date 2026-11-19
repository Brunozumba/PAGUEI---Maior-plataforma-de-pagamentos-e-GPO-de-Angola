import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  RefreshCw,
  Share,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { ServiceWorkerStatus } from '../hooks/useServiceWorkerManager';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 max-w-xs rounded-xl bg-[#102A56] dark:bg-[#0B1120] border border-[#16B981]/60 text-white px-4 py-3 shadow-lg flex items-start gap-3"
    >
      <WifiOff className="w-4 h-4 text-[#16B981] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-bold leading-tight">
          Modo Offline Ativo
        </p>
        <p className="text-[11px] text-slate-200 leading-snug mt-0.5">
          Sem ligação em Angola. Informações da plataforma e conta permanecem acessíveis.
        </p>
      </div>
    </div>
  );
}

interface UpdateBannerProps {
  needRefresh: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ needRefresh, onUpdate, onDismiss }: UpdateBannerProps) {
  if (!needRefresh) return null;

  return (
    <div
      role="region"
      aria-label="Atualização da aplicação"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 p-4 shadow-lg flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-lg bg-[#102A56] text-[#16B981] flex items-center justify-center shrink-0">
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-bold text-[#102A56] dark:text-white">
          Nova versão PAGUEI! pronta
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          Atualize para sincronizar as melhorias mais recentes no cache offline.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={onUpdate}
            className="min-h-[34px] px-3 py-1 rounded-lg bg-[#16B981] hover:bg-[#129B6B] text-[#091936] text-xs font-bold cursor-pointer transition-colors"
          >
            Atualizar Agora
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Depois
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar aviso de atualização"
        className="text-slate-400 hover:text-[#102A56] dark:hover:text-white cursor-pointer"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

interface OfflineResilienceCardProps {
  isOnline: boolean;
  swStatus: ServiceWorkerStatus;
  offlineReady: boolean;
  lastSyncedLabel: string;
  onVerifyCache: () => void;
  onNotify?: (title: string, description?: string, variant?: 'success' | 'info') => void;
}

export function OfflineResilienceCard({
  isOnline,
  swStatus,
  offlineReady,
  lastSyncedLabel,
  onVerifyCache,
  onNotify,
}: OfflineResilienceCardProps) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    const result = await promptInstall();
    if (result === 'accepted') {
      onNotify?.(
        'PAGUEI! instalado no dispositivo',
        'Acesso rápido e suporte offline disponíveis a partir do ecrã inicial.',
        'success',
      );
    }
  };

  return (
    <>
      <div className="mt-6 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#102A56] dark:bg-[#0F172A] text-[#16B981] flex items-center justify-center shrink-0">
            {isOnline ? (
              <Wifi className="w-5 h-5" aria-hidden="true" />
            ) : (
              <WifiOff className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-sm font-bold text-[#102A56] dark:text-white">
                Acesso Offline em Angola (Service Worker PWA)
              </h3>
              <span className="font-mono text-[11px] font-semibold text-[#0B7A54] dark:text-[#16B981]">
                {offlineReady
                  ? 'Cache local pronto'
                  : swStatus === 'unsupported'
                    ? 'Modo padrão'
                    : 'A preparar cache'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
              Em zonas com internet instável, o PAGUEI! mantém a plataforma, o guia de ativação
              e o seu painel acessíveis sem ligação. Última verificação:{' '}
              <span className="font-mono font-semibold text-[#102A56] dark:text-slate-200">
                {lastSyncedLabel}
              </span>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onVerifyCache}
            className="min-h-[38px] px-3.5 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 hover:border-[#102A56] dark:hover:border-[#16B981] text-xs font-semibold text-[#102A56] dark:text-slate-100 inline-flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0B7A54] dark:text-[#16B981]" aria-hidden="true" />
            <span>Verificar Cache Offline</span>
          </button>

          {!isInstalled && (isInstallable || isIOS) && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="min-h-[38px] px-3.5 py-2 rounded-lg bg-[#16B981] hover:bg-[#129B6B] text-[#091936] text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Instalar App Offline</span>
            </button>
          )}
        </div>
      </div>

      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Instruções para instalar no iOS"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="font-display text-lg font-bold text-[#102A56] dark:text-white">
                Instalar PAGUEI! no iPhone/iPad
              </h4>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                aria-label="Fechar instruções"
                className="text-slate-400 hover:text-[#102A56] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="font-mono font-bold text-[#0B7A54] dark:text-[#16B981]">1.</span>
                <span>
                  Toque no botão <Share className="inline w-4 h-4 text-[#102A56] dark:text-[#16B981] mx-0.5" aria-hidden="true" />{' '}
                  <strong>Partilhar</strong> na barra do Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-mono font-bold text-[#0B7A54] dark:text-[#16B981]">2.</span>
                <span>
                  Escolha <strong>Adicionar ao ecrã inicial</strong> para aceder ao PAGUEI! offline.
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full min-h-[42px] rounded-xl bg-[#102A56] dark:bg-[#16B981] text-white dark:text-[#091936] text-sm font-bold cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
