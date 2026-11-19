import { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'taxa',
    question: 'Como funciona a taxa única de 6,5% e há mensalidades?',
    answer:
      'Não existe qualquer mensalidade, taxa de adesão ou custo de manutenção. O PAGUEI! cobra apenas 6,5% sobre cada venda efetivamente paga pelo cliente. Os restantes 93,5% são seus e transferidos diretamente para o seu IBAN.',
  },
  {
    id: 'ativacao',
    question: 'Preciso de ter conta empresa ou ir ao banco para ativar?',
    answer:
      'Não. Esse é exatamente o problema que eliminámos. Para começar, precisa apenas de adicionar o número do seu Bilhete de Identidade (BI), o IBAN da conta bancária onde quer receber os valores e o número do Multicaixa Express. Em 2 minutos a sua conta fica pronta.',
  },
  {
    id: 'seguranca',
    question: 'Como é garantida a segurança das transações e dos meus dados?',
    answer:
      'Todas as comunicações usam encriptação TLS de ponta a ponta, webhooks assinados com HMAC-SHA256 e validação automática contra duplicação de pagamentos. Os valores são encaminhados diretamente para a conta bancária associada ao seu IBAN, com registo auditável em tempo real no dashboard.',
  },
  {
    id: 'canais',
    question: 'Posso vender pelo WhatsApp e redes sociais sem ter um site?',
    answer:
      'Sim. Assim que ativa a conta, pode gerar links de pagamento personalizados e páginas de checkout simplificadas para enviar no WhatsApp, Instagram, Facebook ou TikTok. Para lojas online, apps ou agentes de IA, disponibilizamos também integração via MCP, API REST e SDK Nativa.',
  },
  {
    id: 'suporte',
    question: 'Quando recebo o dinheiro e como funciona o suporte 24 horas?',
    answer:
      'As confirmações de pagamento aparecem em tempo real no seu painel financeiro e as liquidações seguem diretamente para o seu IBAN. Se precisar de ajuda técnica ou operacional a qualquer hora do dia ou da noite, a nossa equipa de suporte em Angola atende 24 horas por dia.',
  },
];

interface FaqAccordionProps {
  onOpenActivation: () => void;
  onOpenSupport: () => void;
}

export function FaqAccordion({ onOpenActivation, onOpenSupport }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>('taxa');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="py-16 sm:py-24 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Heading + Direct Friction Relief */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold text-[#0B7A54] dark:text-[#16B981] mb-3">
              Perguntas Frequentes
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#102A56] dark:text-white leading-[1.12] mb-5"
              style={{ textWrap: 'balance' }}
            >
              Tudo esclarecido antes de começar a vender.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Transparência total sobre a taxa única de 6,5%, segurança das operações e ativação
              imediata em 2 minutos sem burocracia bancária.
            </p>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#162238] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-sm font-bold text-[#102A56] dark:text-white">
                Ainda tem alguma dúvida técnica ou comercial?
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Fale diretamente com a nossa equipa disponível 24 horas por dia ou ative já a sua
                conta em 2 minutos.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onOpenSupport}
                  className="min-h-[40px] px-4 py-2 text-xs font-semibold bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 hover:border-[#102A56] dark:hover:border-[#16B981] text-[#102A56] dark:text-white rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#0B7A54] dark:text-[#16B981]" aria-hidden="true" />
                  <span>Suporte 24h</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenActivation}
                  className="min-h-[40px] px-4 py-2 text-xs font-bold bg-[#102A56] dark:bg-[#16B981] hover:bg-[#163770] dark:hover:bg-[#1EC98E] text-white dark:text-[#091936] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  Ativar em 2 Minutos
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Accessible Accordion */}
          <div className="lg:col-span-7 divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id;
              const panelId = `faq-panel-${item.id}`;
              const triggerId = `faq-trigger-${item.id}`;

              return (
                <div key={item.id} className="py-1">
                  <button
                    id={triggerId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="w-full min-h-[56px] py-4 text-left flex items-center justify-between gap-4 cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16B981]"
                  >
                    <span className="font-display text-base sm:text-lg font-bold text-[#102A56] dark:text-white group-hover:text-[#0B7A54] dark:group-hover:text-[#16B981] transition-colors">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0B7A54] dark:text-[#16B981]' : 'rotate-0'
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="pb-5 pr-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
