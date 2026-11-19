import { Lock, Moon, Scale, ShieldCheck, Sun } from 'lucide-react';
import type { ServiceWorkerStatus } from '../hooks/useServiceWorkerManager';
import { OfflineResilienceCard } from './OfflineAndInstallUI';

interface FooterProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenLogin: () => void;
  isOnline: boolean;
  swStatus: ServiceWorkerStatus;
  offlineReady: boolean;
  lastSyncedLabel: string;
  onVerifyCache: () => void;
  onNotify?: (title: string, description?: string, variant?: 'success' | 'info') => void;
}

const SECURITY_BADGES = [
  {
    icon: Lock,
    title: 'Certificação SSL & TLS 1.3',
    detail: 'Comunicação cifrada ponta a ponta em todo o checkout e chamadas API/MCP.',
  },
  {
    icon: ShieldCheck,
    title: 'Encriptação AES-256 & HMAC',
    detail: 'Proteção de dados do BI, IBAN e validação criptográfica contra duplicações.',
  },
  {
    icon: Scale,
    title: 'Conformidade Angola (AOA)',
    detail: 'Alinhado à Lei n.º 22/11 de Proteção de Dados e liquidação bancária nacional.',
  },
];

export function Footer({
  isDark,
  onToggleTheme,
  onNavigate,
  onOpenLogin,
  isOnline,
  swStatus,
  offlineReady,
  lastSyncedLabel,
  onVerifyCache,
  onNotify,
}: FooterProps) {
  return (
    <footer className="bg-white dark:bg-[#0F172A] transition-colors">
      {/* Security & Compliance + Offline PWA Resilience Strip */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0B1120] py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <p className="text-xs font-semibold text-[#0B7A54] dark:text-[#16B981]">
                Segurança, Conformidade &amp; Resiliência Offline
              </p>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#102A56] dark:text-white">
                Infraestrutura protegida para transações em Kwanzas (AOA)
              </h2>
            </div>
            <span className="font-mono text-xs font-semibold text-[#102A56] dark:text-slate-300">
              Monitorização 24h / 7 dias
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SECURITY_BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800 flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#102A56] dark:bg-[#0F172A] text-[#16B981] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#102A56] dark:text-white">
                      {badge.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                      {badge.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <OfflineResilienceCard
            isOnline={isOnline}
            swStatus={swStatus}
            offlineReady={offlineReady}
            lastSyncedLabel={lastSyncedLabel}
            onVerifyCache={onVerifyCache}
            onNotify={onNotify}
          />
        </div>
      </div>

      {/* Main Quiet Footer */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <a
              href="#topo"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('topo');
              }}
              aria-label="Ir para a página inicial PAGUEI!"
              className="font-display text-xl font-extrabold tracking-tight text-[#102A56] dark:text-white hover:opacity-85 transition-opacity inline-block"
            >
              PAGUEI!
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pagamentos online em Angola · Kwanzas (AOA) · Multicaixa Express
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <nav aria-label="Links do rodapé" className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
              <a
                href="#integracoes"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('integracoes');
                }}
                className="hover:text-[#102A56] dark:hover:text-white transition-colors"
              >
                Integrações
              </a>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('faq');
                }}
                className="hover:text-[#102A56] dark:hover:text-white transition-colors"
              >
                FAQ
              </a>
              <button
                type="button"
                onClick={onOpenLogin}
                className="hover:text-[#102A56] dark:hover:text-white font-semibold transition-colors cursor-pointer"
              >
                Login
              </button>
            </nav>

            <button
              type="button"
              onClick={onToggleTheme}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#102A56] dark:text-slate-100 inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#16B981]" aria-hidden="true" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#102A56]" aria-hidden="true" />
                  <span>Modo Escuro</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>© {new Date().getFullYear()} PAGUEI! Angola. Todos os direitos reservados.</span>
          <span>6,5% por transação · Zero mensalidades · Suporte 24h</span>
        </div>
      </div>
    </footer>
  );
}
