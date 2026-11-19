import { ArrowRight, Check, Headphones, Layers, LineChart, Zap } from 'lucide-react';
import { Card3D } from './Card3D';
import { Cta3DButton } from './Cta3DButton';
import { ResilientImage } from './ResilientImage';

interface CorePillars3DProps {
  onOpenActivation: () => void;
}

export function CorePillars3D({ onOpenActivation }: CorePillars3DProps) {
  return (
    <>
      {/* Clean 3D Interactive Pillars */}
      <section
        id="vantagens"
        className="py-16 sm:py-24 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-[#0B7A54] dark:text-[#16B981] mb-3">
              Tudo pensado para converter mais vendas em Angola
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#102A56] dark:text-white leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Menos fricção para quem compra. Controlo total para quem vende.
            </h2>
          </div>

          {/* Asymmetric 3D Perspective Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Marquee Card (Col Span 7) */}
            <Card3D className="lg:col-span-7 overflow-hidden flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#16B981]/15 text-[#0B7A54] dark:text-[#16B981] flex items-center justify-center mb-5">
                      <Zap className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-[#102A56] dark:text-white mb-3">
                      01. Ativação em 2 Minutos sem Banco
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                      Não precisa de conta empresa nem de esperar meses por aprovação bancária.
                      Adicione o número do Bilhete de Identidade, o IBAN e o Multicaixa Express e os
                      pagamentos entram diretamente na sua conta bancária.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      BI · IBAN · Multicaixa Express
                    </span>
                    <button
                      type="button"
                      onClick={onOpenActivation}
                      className="text-xs font-semibold text-[#0B7A54] dark:text-[#16B981] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>Ativar agora</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 min-h-[240px] border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700">
                  <ResilientImage
                    src="/src/assets/images/hero_angola_commerce_1794828170076.jpg"
                    alt="Empreendedora em Angola a confirmar pagamento instantâneo no telemóvel"
                    fallbackTitle="Ativação em 2 minutos"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Card3D>

            {/* Secondary 3D Card (Col Span 5) */}
            <Card3D dark className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#16B981]/18 text-[#16B981] flex items-center justify-center mb-5">
                  <LineChart className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">
                  02. Dashboard Intuitivo &amp; Lucros ao Segundo
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed mb-6">
                  Acompanhe cada transação em tempo real, filtre por canal, visualize relatórios
                  transparentes e controle o valor líquido exato que cai na sua conta bancária.
                </p>
              </div>

              <div className="pt-5 border-t border-white/14 flex items-center justify-between text-xs">
                <span className="text-slate-300">Taxa única por transação</span>
                <span className="font-mono text-base font-bold text-[#16B981] tabular-nums">
                  6,5% · 0 Kz/mês
                </span>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* Clean Integrations & Social Selling Showcase */}
      <section
        id="integracoes"
        className="py-16 sm:py-24 bg-[#F8FAFC] dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#0B7A54] dark:text-[#16B981] mb-3">
                  Para vendedores sociais, programadores e empresas
                </p>
                <h2
                  className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#102A56] dark:text-white leading-[1.12] mb-5"
                  style={{ textWrap: 'balance' }}
                >
                  Checkout Rápido, Links de WhatsApp, MCP e API Nativa.
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                  Quer venda no Instagram e WhatsApp com links personalizados, quer integre via
                  servidor MCP, API REST ou SDK nativa numa loja online, o PAGUEI! reduz a fricção
                  a zero para aumentar as suas vendas imediatas.
                </p>

                <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-8">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#0B7A54] dark:text-[#16B981] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Links de pagamento personalizados e página de checkout simplificada</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#0B7A54] dark:text-[#16B981] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Integração imediata via MCP, API REST, Nativa e webhooks seguros</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#0B7A54] dark:text-[#16B981] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Suporte ao cliente 24 horas por dia disponível todos os dias</span>
                  </li>
                </ul>
              </div>

              <div>
                <Cta3DButton variant="dark" size="lg" onClick={onOpenActivation}>
                  <Layers className="w-4 h-4 text-[#16B981]" aria-hidden="true" />
                  <span>Começar a Integrar Agora</span>
                </Cta3DButton>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
              <Card3D className="overflow-hidden flex flex-col justify-between">
                <div className="h-52 overflow-hidden border-b border-slate-200 dark:border-slate-700">
                  <ResilientImage
                    src="/src/assets/images/social_seller_whatsapp_1794828171111.jpg"
                    alt="Vendedora a receber pagamentos por link no WhatsApp e redes sociais"
                    fallbackTitle="Links WhatsApp & Redes Sociais"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-[#102A56] dark:text-white mb-1.5">
                    Redes Sociais &amp; WhatsApp
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Envie o link de checkout direto na conversa e receba confirmação automática sem
                    pedir comprovativos por imagem.
                  </p>
                </div>
              </Card3D>

              <Card3D className="overflow-hidden flex flex-col justify-between">
                <div className="h-52 overflow-hidden border-b border-slate-200 dark:border-slate-700">
                  <ResilientImage
                    src="/src/assets/images/dev_fintech_workspace_1794828171140.jpg"
                    alt="Programador a ligar sistema de pagamentos por MCP e API"
                    fallbackTitle="MCP, API & Checkout Nativo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-[#102A56] dark:text-white mb-1.5">
                    MCP, API &amp; Nativa
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Chaves libertadas na hora para e-commerce, apps móveis e agentes de IA com
                    atendimento técnico 24h.
                  </p>
                </div>
              </Card3D>
            </div>
          </div>

          {/* Quiet 24h Support Highlight Strip */}
          <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <Headphones className="w-5 h-5 text-[#0B7A54] dark:text-[#16B981] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-bold text-[#102A56] dark:text-white">
                  Suporte ao cliente 24 horas por dia em Angola
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Acompanhamento técnico e operacional em tempo real, a qualquer hora do dia ou da noite.
                </div>
              </div>
            </div>
            <span className="font-mono text-xs font-semibold text-[#102A56] dark:text-[#16B981] tabular-nums shrink-0">
              6,5% por transação · 0 Kz/mês
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
