import { LayoutDashboard, LogIn } from 'lucide-react';
import { Cta3DButton } from './Cta3DButton';

interface NavbarProps {
  isAuthenticated: boolean;
  businessName?: string;
  onGoHome: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenActivation: () => void;
  onOpenLogin: () => void;
  onOpenWorkspace: () => void;
}

export function Navbar({
  isAuthenticated,
  businessName,
  onGoHome,
  onNavigate,
  onOpenActivation,
  onOpenLogin,
  onOpenWorkspace,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        <a
          href="#topo"
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
          aria-label="Ir para a página inicial PAGUEI!"
          className="font-display text-xl font-extrabold tracking-tight text-[#102A56] dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16B981]"
        >
          PAGUEI!
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a
            href="#integracoes"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('integracoes');
            }}
            className="hover:text-[#102A56] dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Integrações
          </a>
          <a
            href="#depoimentos"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('depoimentos');
            }}
            className="hover:text-[#102A56] dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Depoimentos
          </a>
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('faq');
            }}
            className="hover:text-[#102A56] dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated ? (
            <Cta3DButton size="md" variant="primary" onClick={onOpenWorkspace}>
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              <span className="truncate max-w-[140px]">
                {businessName ? `Painel · ${businessName}` : 'Meu Painel'}
              </span>
            </Cta3DButton>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenLogin}
                className="min-h-[38px] px-3 sm:px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] hover:border-[#102A56] dark:hover:border-[#16B981] text-xs sm:text-sm font-semibold text-[#102A56] dark:text-slate-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-[#0B7A54] dark:text-[#16B981]" aria-hidden="true" />
                <span>Login</span>
              </button>

              <Cta3DButton size="md" variant="primary" onClick={onOpenActivation}>
                Ativar em 2 Min
              </Cta3DButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
