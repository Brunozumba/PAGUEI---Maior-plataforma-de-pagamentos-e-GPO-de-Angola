import { Quote } from 'lucide-react';
import { Card3D } from './Card3D';

interface AngolanPartner {
  name: string;
  sector: string;
  city: string;
}

const ANGOLAN_PARTNERS: AngolanPartner[] = [
  { name: 'KwanzaCloud', sector: 'Software & SaaS', city: 'Luanda' },
  { name: 'Maianga Street', sector: 'Moda Online', city: 'Luanda' },
  { name: 'Benguela Fresh', sector: 'Comércio Local', city: 'Benguela' },
  { name: 'Talatona Tech', sector: 'E-commerce', city: 'Talatona' },
  { name: 'Kamba Digital', sector: 'Infoprodutos', city: 'Luanda' },
  { name: 'Huambo Express', sector: 'Entregas', city: 'Huambo' },
  { name: 'Ilha Gourmet', sector: 'Restauração', city: 'Luanda' },
  { name: 'Lobito PayHub', sector: 'Serviços B2B', city: 'Lobito' },
];

const TESTIMONIALS = [
  {
    name: 'Mário Domingos',
    role: 'Fundador · Maianga Streetwear (Luanda)',
    metric: '+185% Vendas no WhatsApp em 60 Dias',
    quote:
      'Antes perdíamos quase metade das encomendas no Instagram porque os clientes desistiam de enviar comprovativos. Com o PAGUEI!, ativámos em 2 minutos com o BI e o IBAN e os pagamentos caem logo na conta.',
  },
  {
    name: 'Eng.ª Sofia Neto',
    role: 'Diretora Técnica · KwanzaCloud Software (Benguela)',
    metric: 'API + MCP ativos no mesmo dia',
    quote:
      'Esperámos meses por respostas bancárias sem sucesso. No PAGUEI!, integrámos a API e o servidor MCP no próprio dia, sem conta empresa obrigatória e com suporte técnico às 23h.',
  },
  {
    name: 'Celso Mateus',
    role: 'Coordenador · Academia Kamba Digital',
    metric: '0 Kz de mensalidade · Controlo total',
    quote:
      'Como só pagamos 6,5% quando há venda confirmada, não temos custos fixos. O painel mostra em tempo real o valor líquido exato de cada turma vendida pelas redes sociais.',
  },
];

function PartnerLogoMark({ index }: { index: number }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {index % 3 === 0 ? (
        <>
          <rect x="2" y="2" width="9" height="9" rx="2" className="fill-[#102A56] dark:fill-white" />
          <rect x="13" y="13" width="9" height="9" rx="2" fill="#16B981" />
          <rect x="13" y="2" width="9" height="9" rx="2" className="fill-[#102A56]/25 dark:fill-white/25" />
        </>
      ) : index % 3 === 1 ? (
        <>
          <circle cx="12" cy="12" r="9" className="stroke-[#102A56] dark:stroke-white" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="4" fill="#16B981" />
        </>
      ) : (
        <>
          <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" className="stroke-[#102A56] dark:stroke-white" strokeWidth="2.2" />
          <path d="M12 7L17 10V14L12 17L7 14V10L12 7Z" fill="#16B981" />
        </>
      )}
    </svg>
  );
}

export function TestimonialsAndPartners() {
  return (
    <section
      id="depoimentos"
      className="py-16 sm:py-24 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Continuous Angolan Partner Logo Slide */}
        <div className="mb-16 pb-12 border-b border-slate-200 dark:border-slate-800">
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#0B7A54] dark:text-[#16B981] mb-1">
              Empresas e parceiros em Angola
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#102A56] dark:text-white">
              Negócios angolanos que já recebem pagamentos com o PAGUEI!
            </h2>
          </div>

          <div
            aria-label="Slide contínuo de logótipos de empresas parceiras em Angola"
            className="relative overflow-hidden py-2"
          >
            {/* Soft horizontal edge fades */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-12 z-10 bg-gradient-to-r from-[#F8FAFC] dark:from-[#0F172A] to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10 bg-gradient-to-l from-[#F8FAFC] dark:from-[#0F172A] to-transparent"
            />

            <div className="flex w-max animate-logo-slide">
              {[0, 1].map((dupIndex) => (
                <div
                  key={dupIndex}
                  aria-hidden={dupIndex === 1}
                  className="flex items-center gap-4 pr-4"
                >
                  {ANGOLAN_PARTNERS.map((partner, idx) => (
                    <div
                      key={`${dupIndex}-${partner.name}`}
                      className="min-w-[230px] px-5 py-4 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shrink-0"
                    >
                      <PartnerLogoMark index={idx} />
                      <div className="min-w-0">
                        <div className="font-display text-sm sm:text-base font-bold text-[#102A56] dark:text-white whitespace-nowrap">
                          {partner.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {partner.sector} · {partner.city}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attributable Testimonials */}
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-[#0B7A54] dark:text-[#16B981] mb-2">
            Depoimentos de clientes e parceiros
          </p>
          <h3
            className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#102A56] dark:text-white leading-[1.12]"
            style={{ textWrap: 'balance' }}
          >
            Confiança comprovada de quem vende todos os dias.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TESTIMONIALS.map((item) => (
            <Card3D key={item.name} className="p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-bold text-[#0B7A54] dark:text-[#16B981] tabular-nums">
                    {item.metric}
                  </span>
                  <Quote className="w-4 h-4 text-[#102A56]/30 dark:text-white/30 shrink-0" aria-hidden="true" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm font-bold text-[#102A56] dark:text-white">{item.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.role}</div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  );
}
