import { ArrowRight, MessageSquare } from 'lucide-react';
import { Card3D } from './Card3D';
import { Cta3DButton } from './Cta3DButton';

interface Cta3DBannerProps {
  onOpenActivation: () => void;
  onOpenSupport: () => void;
}

export function Cta3DBanner({ onOpenActivation, onOpenSupport }: Cta3DBannerProps) {
  return (
    <section
      id="comecar"
      className="py-16 sm:py-24 bg-[#0B1D3D] dark:bg-[#0F172A] text-white border-b border-white/10 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <Card3D dark className="p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold text-[#16B981] mb-3">
                Taxa única 6,5% · Zero mensalidades · Ativação em 2 minutos
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.08] mb-5"
                style={{ textWrap: 'balance' }}
              >
                Adicione BI, IBAN e Express. Comece a receber hoje.
              </h2>
              <p className="text-base text-slate-200 leading-relaxed max-w-[52ch]">
                Sem conta empresa, sem burocracia bancária e com controlo total dos seus lucros em
                tempo real. Ideal para lojas online, redes sociais, WhatsApp e programadores.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-4">
              <Cta3DButton variant="primary" size="lg" onClick={onOpenActivation} className="w-full sm:w-auto lg:w-full max-w-[320px]">
                <span>Ativar PAGUEI! Agora</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Cta3DButton>

              <Cta3DButton variant="light" size="md" onClick={onOpenSupport} className="w-full sm:w-auto lg:w-full max-w-[320px]">
                <MessageSquare className="w-4 h-4 text-[#0B7A54] dark:text-[#16B981]" aria-hidden="true" />
                <span>Falar com Suporte 24h</span>
              </Cta3DButton>
            </div>
          </div>
        </Card3D>
      </div>
    </section>
  );
}
