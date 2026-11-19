import { ArrowRight, Layers, LogIn, Moon, Sun } from 'lucide-react';
import { Cta3DButton } from './Cta3DButton';
import { Payment3DScene } from './Payment3DScene';

interface HeroSectionProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenActivation: () => void;
  onOpenLogin: () => void;
  onNavigate: (sectionId: string) => void;
}

export function HeroSection({
  isDark,
  onToggleTheme,
  onOpenActivation,
  onOpenLogin,
  onNavigate,
}: HeroSectionProps) {
  return (
    <section
      id="topo"
      className="pt-8 pb-16 sm:pt-12 sm:pb-20 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Clean High-Conversion Proposition + Theme Switcher + 3D CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span>Angola</span>
                  <span aria-hidden="true">·</span>
                  <span>Sem Conta Empresa</span>
                  <span aria-hidden="true">·</span>
                  <span>Liquidação Imediata</span>
                </div>

                {/* Accessible Light / Dark Mode Switcher (#0F172A Branding) */}
                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro PAGUEI!'}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#102A56] dark:text-slate-100 hover:border-[#102A56] dark:hover:border-[#16B981] inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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

              <h1
                className="font-display font-extrabold tracking-tight text-[#102A56] dark:text-white leading-[1.06] mb-6"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.65rem)',
                  textWrap: 'balance',
                }}
              >
                Receba pagamentos em Angola em 2 minutos. Sem banco. Sem empresa.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-[54ch] mb-9">
                Sem filas, sem conta empresa e sem esperar meses por APIs bancárias. Adicione apenas
                o seu <strong className="font-semibold text-[#102A56] dark:text-white">Bilhete de Identidade</strong>,{' '}
                <strong className="font-semibold text-[#102A56] dark:text-white">IBAN</strong> e{' '}
                <strong className="font-semibold text-[#102A56] dark:text-white">Multicaixa Express</strong> e
                comece a vender imediatamente por checkout rápido, WhatsApp, MCP ou API.
              </p>

              {/* 3D Call-To-Action Group */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <Cta3DButton variant="primary" size="lg" onClick={onOpenActivation}>
                  <span>Ativar Conta em 2 Minutos</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Cta3DButton>

                <Cta3DButton
                  variant="light"
                  size="lg"
                  onClick={() => onNavigate('integracoes')}
                >
                  <Layers className="w-4 h-4 text-[#0B7A54] dark:text-[#16B981]" aria-hidden="true" />
                  <span>Explorar Integrações</span>
                </Cta3DButton>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span>
                  <strong className="font-semibold text-[#102A56] dark:text-white tabular-nums">6,5%</strong> por transação
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="font-semibold text-[#102A56] dark:text-white tabular-nums">0 Kz</strong> de mensalidade
                </span>
                <span aria-hidden="true">·</span>
                <span>Suporte 24 horas</span>
              </div>

              <button
                type="button"
                onClick={onOpenLogin}
                className="text-xs font-semibold text-[#102A56] dark:text-[#16B981] hover:underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Já tem conta? Fazer Login</span>
              </button>
            </div>
          </div>

          {/* Right Column: Auto-Animating Interactive 3D Demonstration */}
          <div id="demo-3d" className="lg:col-span-6 flex flex-col">
            <Payment3DScene />
          </div>
        </div>

        {/* Clean 4-Column Proof Strip */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#102A56] dark:text-white tabular-nums">
              2 Minutos
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Adicione BI, IBAN e Multicaixa Express e comece a faturar na hora.
            </p>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B7A54] dark:text-[#16B981] tabular-nums">
              6,5%
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Taxa única por venda confirmada. Sem mensalidades nem surpresas.
            </p>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#102A56] dark:text-white tabular-nums">
              0 Burocracia
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Sem conta empresa obrigatória e sem idas ao banco para pedir APIs.
            </p>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#102A56] dark:text-white tabular-nums">
              24h / 7 Dias
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Atendimento contínuo para vendedores, programadores e empresas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
