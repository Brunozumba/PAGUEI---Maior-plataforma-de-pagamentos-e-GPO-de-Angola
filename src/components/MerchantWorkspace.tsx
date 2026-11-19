import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowLeft,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  Landmark,
  Link2,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  PlusCircle,
  QrCode,
  RefreshCw,
  Save,
  Send,
  Settings,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import type {
  GeneratedPaymentLink,
  MerchantProfile,
  PaymentChannel,
  SupportTicket,
  TransactionRecord,
  WebhookDeliveryLog,
  WebhookEndpoint,
} from '../types/paguei';
import {
  calculateFeeBreakdown,
  downloadTransactionsCsv,
  formatAngolanBI,
  formatAngolanIBAN,
  formatAngolanPhone,
  formatKwanza,
  isValidAngolanBI,
  isValidAngolanIBAN,
  isValidAngolanPhone,
  slugifyProductName,
} from '../utils/formatters';
import { exportMonthlyStatementPdf } from '../utils/pdfStatement';
import { Cta3DButton } from './Cta3DButton';
import { SimulatedQRCode } from './SimulatedQRCode';
import { SuccessConfetti } from './SuccessConfetti';
import { WebhookSettingsManager } from './WebhookSettingsManager';

type WorkspaceTab =
  | 'perfil-painel'
  | 'links-qr'
  | 'checkout'
  | 'configuracoes'
  | 'api-mcp'
  | 'suporte';

interface MerchantWorkspaceProps {
  profile: MerchantProfile;
  justRegistered: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  links: GeneratedPaymentLink[];
  transactions: TransactionRecord[];
  tickets: SupportTicket[];
  webhooks: WebhookEndpoint[];
  deliveryLogs: WebhookDeliveryLog[];
  onUpdateProfile: (updated: MerchantProfile) => void;
  onAddLink: (link: GeneratedPaymentLink) => void;
  onToggleLink: (id: string) => void;
  onDeleteLink: (id: string) => void;
  onAddWebhook: (endpoint: WebhookEndpoint) => void;
  onToggleWebhook: (id: string) => void;
  onDeleteWebhook: (id: string) => void;
  onTestWebhook: (endpoint: WebhookEndpoint) => void;
  onSimulateSale: (
    gross: number,
    options?: {
      customer?: string;
      phone?: string;
      product?: string;
      channel?: PaymentChannel;
      linkId?: string;
    },
  ) => void;
  onAddTicket: (ticket: SupportTicket) => void;
  onBackToLanding: () => void;
  onLogout: () => void;
  onNotify: (title: string, description?: string, variant?: 'success' | 'info') => void;
}

const ANGOLA_PROVINCES = [
  'Luanda',
  'Benguela',
  'Huíla',
  'Huambo',
  'Cabinda',
  'Namibe',
  'Cuanza Sul',
  'Uíge',
  'Malanje',
  'Lunda Sul',
];

function formatCompactKz(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

export function MerchantWorkspace({
  profile,
  justRegistered,
  isDark,
  onToggleTheme,
  links,
  transactions,
  tickets,
  webhooks,
  deliveryLogs,
  onUpdateProfile,
  onAddLink,
  onToggleLink,
  onDeleteLink,
  onAddWebhook,
  onToggleWebhook,
  onDeleteWebhook,
  onTestWebhook,
  onSimulateSale,
  onAddTicket,
  onBackToLanding,
  onLogout,
  onNotify,
}: MerchantWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('perfil-painel');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeConfetti, setShowWelcomeConfetti] = useState(justRegistered);

  // Editable User Profile Form (auto-loaded with current user details for immediate update)
  const [biNumber, setBiNumber] = useState(profile.biNumber);
  const [expressPhone, setExpressPhone] = useState(profile.expressPhone);
  const [iban, setIban] = useState(profile.iban);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [contactEmail, setContactEmail] = useState(profile.contactEmail);
  const [province, setProvince] = useState(profile.province);
  const [webhookUrl, setWebhookUrl] = useState(profile.webhookUrl);
  const [profileError, setProfileError] = useState('');

  // Chart granularity inside Dashboard
  const [granularity, setGranularity] = useState<'diaria' | 'semanal'>('diaria');

  // New Link creator inside Dashboard
  const [newProductName, setNewProductName] = useState('');
  const [newAmount, setNewAmount] = useState('25000');
  const [selectedQrLinkId, setSelectedQrLinkId] = useState<string>(links[0]?.id ?? '');

  // Checkout Tester state
  const [checkoutAmount, setCheckoutAmount] = useState('45000');
  const [checkoutProduct, setCheckoutProduct] = useState('Venda Direta Balcão');
  const [checkoutBuyerPhone, setCheckoutBuyerPhone] = useState('923 456 789');
  const [checkoutBuyerName, setCheckoutBuyerName] = useState('Cliente Luanda');

  // API / MCP state
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Support state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const totals = useMemo(() => {
    const gross = transactions.reduce((sum, tx) => sum + tx.grossAmount, 0);
    const fee = transactions.reduce((sum, tx) => sum + tx.feeAmount, 0);
    const net = transactions.reduce((sum, tx) => sum + tx.netAmount, 0);
    return {
      gross,
      fee,
      net,
      activeLinksCount: links.filter((l) => l.active).length,
      txCount: transactions.length,
    };
  }, [transactions, links]);

  const chartData = useMemo(() => {
    const liveOnly = transactions.filter((tx) => tx.id.startsWith('live-'));
    const liveGross = liveOnly.reduce((s, t) => s + t.grossAmount, 0);
    const liveNet = liveOnly.reduce((s, t) => s + t.netAmount, 0);

    if (granularity === 'diaria') {
      return [
        { label: '08h', gross: 65000, net: 60775 },
        { label: '10h', gross: 142000, net: 132770 },
        { label: '12h', gross: 215000, net: 201025 },
        { label: '14h', gross: 184000, net: 172040 },
        { label: '16h', gross: 298000, net: 278630 },
        { label: '18h', gross: 360000, net: 336600 },
        { label: 'Agora', gross: 95000 + liveGross, net: 88825 + liveNet },
      ];
    }

    return [
      { label: 'Seg', gross: 680000, net: 635800 },
      { label: 'Ter', gross: 845000, net: 790075 },
      { label: 'Qua', gross: 790000, net: 738650 },
      { label: 'Qui', gross: 1120000, net: 1047200 },
      { label: 'Sex', gross: 1480000, net: 1383800 },
      { label: 'Sáb', gross: 1640000, net: 1533400 },
      { label: 'Dom', gross: 1459000 + liveGross, net: 1364165 + liveNet },
    ];
  }, [granularity, transactions]);

  const selectedLink = links.find((l) => l.id === selectedQrLinkId) ?? links[0];

  const handleCopy = (value: string, key: string, label: string) => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopiedKey(key);
    onNotify('Copiado!', `${label} copiado para a área de transferência.`, 'info');
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAngolanBI(biNumber)) {
      setProfileError(
        'BI inválido. Use 9 dígitos + 2 letras da província + 3 dígitos (ex: 004512890LA042).',
      );
      return;
    }
    if (!isValidAngolanPhone(expressPhone)) {
      setProfileError(
        'Número Multicaixa Express inválido. Deve ter 9 dígitos e iniciar por 9.',
      );
      return;
    }
    if (!isValidAngolanIBAN(iban)) {
      setProfileError(
        'IBAN inválido. Use AO06 seguido de 21 dígitos (ex: AO06 0040 0000 1234 5678 9012 3).',
      );
      return;
    }
    if (businessName.trim().length < 2) {
      setProfileError('Indique o nome da loja ou projeto.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setProfileError('Indique um e-mail válido.');
      return;
    }

    setProfileError('');
    const slug = slugifyProductName(businessName);
    const updated: MerchantProfile = {
      ...profile,
      biNumber: biNumber.trim().toUpperCase(),
      expressPhone: formatAngolanPhone(expressPhone),
      iban: iban.trim().toUpperCase(),
      businessName: businessName.trim(),
      contactEmail: contactEmail.trim(),
      province,
      webhookUrl: webhookUrl.trim() || `https://api.${slug}.ao/webhooks/paguei`,
      mcpEndpoint: `https://mcp.paguei.ao/${slug}`,
      checkoutUrl: `https://paguei.ao/loja/${slug}`,
      updatedAt: new Date().toLocaleTimeString('pt-AO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onUpdateProfile(updated);
    onNotify(
      'Perfil atualizado com sucesso!',
      `Dados fiscais e IBAN (${updated.iban}) guardados para liquidação imediata.`,
      'success',
    );
  };

  const handleCreateDashboardLink = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newProductName.trim();
    const numeric = Math.max(0, Number(newAmount.replace(/\D/g, '')) || 0);
    if (cleanName.length < 2 || numeric < 500) {
      onNotify(
        'Verifique os campos do link',
        'Informe o nome do produto e um valor mínimo de 500 Kz.',
        'info',
      );
      return;
    }

    const code = Math.random().toString(36).slice(2, 5);
    const slug = `${slugifyProductName(cleanName)}-${code}`;
    const created: GeneratedPaymentLink = {
      id: `lnk-${Date.now()}`,
      slug,
      url: `https://paguei.ao/p/${slug}`,
      productName: cleanName,
      amount: numeric,
      createdAt: new Date().toLocaleTimeString('pt-AO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      active: true,
      clicks: 1,
      paidCount: 0,
    };

    onAddLink(created);
    setSelectedQrLinkId(created.id);
    setNewProductName('');
    onNotify(
      'Novo Link & Código QR criado!',
      `${created.productName} (${formatKwanza(created.amount)}) ativo no painel.`,
      'success',
    );
  };

  const handleCheckoutTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Math.max(500, Number(checkoutAmount.replace(/\D/g, '')) || 0);
    if (!isValidAngolanPhone(checkoutBuyerPhone)) {
      onNotify(
        'Telemóvel inválido',
        'Informe um número Multicaixa Express angolano de 9 dígitos.',
        'info',
      );
      return;
    }

    onSimulateSale(numeric, {
      customer: checkoutBuyerName.trim() || 'Cliente Express',
      phone: formatAngolanPhone(checkoutBuyerPhone),
      product: checkoutProduct.trim() || 'Pagamento Direto PAGUEI!',
      channel: 'Multicaixa Express',
    });
  };

  const handleRegenerateKey = () => {
    const regenerated: MerchantProfile = {
      ...profile,
      apiKeyPreview: `pg_live_ao_${Math.random().toString(36).slice(2, 14)}`,
      updatedAt: new Date().toLocaleTimeString('pt-AO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    onUpdateProfile(regenerated);
    onNotify(
      'Nova chave API gerada',
      'A chave antiga foi substituída imediatamente.',
      'info',
    );
  };

  const handleRequestPayout = () => {
    onNotify(
      'Liquidação imediata solicitada!',
      `${formatKwanza(totals.net)} encaminhado para o IBAN ${profile.iban}.`,
      'success',
    );
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    onAddTicket({
      id: `tkt-${Date.now()}`,
      subject: ticketSubject.trim(),
      message: ticketMessage.trim(),
      createdAt: new Date().toLocaleTimeString('pt-AO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Em análise',
    });
    setTicketSubject('');
    setTicketMessage('');
    onNotify(
      'Pedido enviado ao Suporte 24h',
      'A nossa equipa em Luanda responderá em poucos minutos.',
      'success',
    );
  };

  const grossBarColor = isDark ? '#475569' : '#102A56';
  const gridStroke = isDark ? '#1E293B' : '#E2E8F0';
  const axisStroke = isDark ? '#94A3B8' : '#475569';

  const navItems = [
    { id: 'perfil-painel' as const, label: 'Meu Perfil & Painel', icon: UserCheck },
    { id: 'links-qr' as const, label: 'Links & QR Codes', icon: QrCode },
    { id: 'checkout' as const, label: 'Checkout & Express', icon: CreditCard },
    { id: 'configuracoes' as const, label: 'Configurações', icon: Settings },
    { id: 'api-mcp' as const, label: 'API & MCP', icon: Code2 },
    { id: 'suporte' as const, label: 'Suporte 24h', icon: MessageSquare },
  ];

  const activeLabel = navItems.find((n) => n.id === activeTab)?.label ?? 'Painel';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-[#0F172A] text-[#102A56] dark:text-slate-100 transition-colors">
      {showWelcomeConfetti && <SuccessConfetti />}

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar Navigation & User Options */}
      <aside
        aria-label="Menu do Painel"
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand + Merchant Identity (Clicking logo goes to homepage) */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <button
                type="button"
                onClick={onBackToLanding}
                aria-label="Voltar para a página inicial PAGUEI!"
                className="font-display text-xl font-extrabold tracking-tight text-[#102A56] dark:text-white hover:opacity-80 transition-opacity cursor-pointer block text-left"
              >
                PAGUEI!
              </button>
              <div className="text-sm font-bold text-[#102A56] dark:text-slate-100 truncate mt-2">
                {profile.businessName}
              </div>
              <div className="font-mono text-[11px] text-[#0B7A54] dark:text-[#16B981] truncate">
                {profile.merchantId}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Fechar menu"
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#102A56] dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Main Left Vertical Menu */}
          <nav aria-label="Secções do painel" className="flex-1 overflow-y-auto p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 cursor-pointer text-left transition-colors ${
                    isActive
                      ? 'bg-[#102A56] dark:bg-[#16B981] text-white dark:text-[#091936]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#102A56] dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Left Options (Theme, Landing Page, Logout) */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full min-h-[40px] px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#162238] border border-slate-200 dark:border-slate-700 hover:border-[#102A56] dark:hover:border-[#16B981] text-xs font-semibold text-[#102A56] dark:text-slate-100 flex items-center gap-3 cursor-pointer transition-colors"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-[#16B981] shrink-0" aria-hidden="true" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Modo Escuro</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLanding}
            className="w-full min-h-[40px] px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#162238] border border-slate-200 dark:border-slate-700 hover:border-[#102A56] dark:hover:border-[#16B981] text-xs font-semibold text-[#102A56] dark:text-slate-100 flex items-center gap-3 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Página Inicial</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full min-h-[40px] px-3.5 py-2 rounded-xl bg-[#102A56] dark:bg-[#1E293B] hover:bg-[#091936] text-xs font-semibold text-white flex items-center gap-3 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4 text-[#16B981] shrink-0" aria-hidden="true" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Right Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Minimal Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Abrir menu do painel"
            className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#162238] text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
            <span>Menu</span>
          </button>
          <span className="font-display text-sm font-extrabold text-[#102A56] dark:text-white truncate">
            {activeLabel}
          </span>
        </div>

        <main className="flex-1 max-w-[1160px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        {/* Welcome / Confetti Dismiss Banner if just signed up */}
        {showWelcomeConfetti && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#102A56] dark:bg-[#162238] border border-[#16B981]/50 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#16B981] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h1 className="font-display text-lg font-extrabold">
                  Conta ativada em 2 minutos! O seu Perfil e Painel já estão prontos.
                </h1>
                <p className="text-xs text-slate-200 mt-0.5">
                  Reveja ou atualize o seu BI, IBAN e Express abaixo e comece a gerar links ou usar a API/MCP imediatamente.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowWelcomeConfetti(false)}
              className="min-h-[34px] px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer self-start sm:self-center shrink-0"
            >
              Ocultar aviso
            </button>
          </div>
        )}

        {/* KPI Overview Strip */}
        <section aria-label="Resumo financeiro da conta" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#102A56] dark:bg-[#162238] border border-[#16B981]/40 text-white">
            <div className="flex items-center justify-between gap-2 text-xs text-[#16B981] font-semibold">
              <span>Saldo Líquido (93,5%)</span>
              <Landmark className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="font-mono text-2xl font-extrabold text-[#16B981] tabular-nums mt-1.5">
              {formatKwanza(totals.net)}
            </div>
            <button
              type="button"
              onClick={handleRequestPayout}
              className="mt-3 text-[11px] font-bold text-white hover:text-[#16B981] underline underline-offset-4 cursor-pointer"
            >
              Transferir agora para o IBAN →
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Volume Bruto Processado</div>
            <div className="font-mono text-2xl font-extrabold text-[#102A56] dark:text-white tabular-nums mt-1.5">
              {formatKwanza(totals.gross)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono tabular-nums">
              Taxa 6,5% retida: {formatKwanza(totals.fee)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Links &amp; QR Ativos</div>
            <div className="font-mono text-2xl font-extrabold text-[#102A56] dark:text-white tabular-nums mt-1.5">
              {totals.activeLinksCount}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('links-qr')}
              className="mt-2 text-[11px] font-bold text-[#0B7A54] dark:text-[#16B981] hover:underline cursor-pointer"
            >
              Gerir ou criar novo QR →
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Vendas Confirmadas</div>
            <div className="font-mono text-2xl font-extrabold text-[#102A56] dark:text-white tabular-nums mt-1.5">
              {totals.txCount}
            </div>
            <div className="text-[11px] text-[#0B7A54] dark:text-[#16B981] font-semibold mt-2">
              0 Kz de mensalidade · Ativo 24h
            </div>
          </div>
        </section>

        {/* TAB 1: MEU PERFIL (EDITABLE IMMEDIATELY) + FULL PAINEL */}
        {activeTab === 'perfil-painel' && (
          <div className="space-y-8">
            {/* Automatic Editable User Profile Card */}
            <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-xs font-semibold text-[#0B7A54] dark:text-[#16B981]">
                    Perfil do Utilizador &amp; Dados de Recebimento
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#102A56] dark:text-white">
                    Atualize o seu BI, IBAN, Multicaixa Express e Negócio
                  </h2>
                </div>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Última atualização: {profile.updatedAt}
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="p-biz" className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1">
                      Nome da Loja / Empreendimento
                    </label>
                    <input
                      id="p-biz"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ex: Luanda Modas"
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
                    />
                  </div>

                  <div>
                    <label htmlFor="p-bi" className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1">
                      Bilhete de Identidade (BI Angola)
                    </label>
                    <input
                      id="p-bi"
                      type="text"
                      maxLength={14}
                      value={biNumber}
                      onChange={(e) => setBiNumber(formatAngolanBI(e.target.value))}
                      placeholder="004512890LA042"
                      className="w-full min-h-[42px] px-3 py-2 text-sm font-mono bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
                    />
                  </div>

                  <div>
                    <label htmlFor="p-express" className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1">
                      Número Multicaixa Express
                    </label>
                    <input
                      id="p-express"
                      type="tel"
                      maxLength={11}
                      value={expressPhone}
                      onChange={(e) => setExpressPhone(formatAngolanPhone(e.target.value))}
                      placeholder="923 456 789"
                      className="w-full min-h-[42px] px-3 py-2 text-sm font-mono tabular-nums bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="p-iban" className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1">
                      IBAN para Recebimento (AO06)
                    </label>
                    <input
                      id="p-iban"
                      type="text"
                      maxLength={31}
                      value={iban}
                      onChange={(e) => setIban(formatAngolanIBAN(e.target.value))}
                      placeholder="AO06 0040 0000 1234 5678 9012 3"
                      className="w-full min-h-[42px] px-3 py-2 text-sm font-mono bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
                    />
                  </div>

                  <div>
                    <label htmlFor="p-province" className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1">
                      Província (Angola)
                    </label>
                    <select
                      id="p-province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
                    >
                      {ANGOLA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="p-email" className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1">
                      E-mail de Acesso e Notificações
                    </label>
                    <input
                      id="p-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
                    />
                  </div>

                  <div>
                    <label htmlFor="p-webhook" className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1">
                      Webhook de Pagamentos (Opcional)
                    </label>
                    <input
                      id="p-webhook"
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://sualoja.ao/api/webhook-paguei"
                      className="w-full min-h-[42px] px-3 py-2 text-sm font-mono bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
                    />
                  </div>
                </div>

                {profileError && (
                  <p className="text-xs font-semibold text-[#DC2626] dark:text-rose-400" role="alert">
                    {profileError}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Os valores são liquidados automaticamente para o IBAN configurado após cada venda.
                  </span>
                  <Cta3DButton type="submit" variant="primary" size="md">
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>Guardar Alterações do Perfil</span>
                  </Cta3DButton>
                </div>
              </form>
            </section>

            {/* Real-time Profit Analytics & Ledger inside Authenticated Panel */}
            <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0B7A54] dark:text-[#16B981] mb-1">
                    <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Painel de Controlo Financeiro</span>
                  </div>
                  <h3 className="font-display text-xl font-extrabold text-[#102A56] dark:text-white">
                    Faturação &amp; Lucros em Tempo Real (AOA)
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setGranularity('diaria')}
                      className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer ${
                        granularity === 'diaria'
                          ? 'bg-[#102A56] dark:bg-[#16B981] text-white dark:text-[#091936]'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setGranularity('semanal')}
                      className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer ${
                        granularity === 'semanal'
                          ? 'bg-[#102A56] dark:bg-[#16B981] text-white dark:text-[#091936]'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Semana
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onSimulateSale(95000, {
                        customer: 'Venda Painel AO',
                        product: 'Pedido Express',
                        channel: 'Multicaixa Express',
                      })
                    }
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#16B981] hover:bg-[#129B6B] text-[#091936] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Simular Venda</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      exportMonthlyStatementPdf(transactions, profile);
                      onNotify(
                        'Extrato PDF exportado!',
                        'Resumo das transações do mês corrente gerado para o seu contador.',
                        'success',
                      );
                    }}
                    className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[#102A56] dark:bg-[#1E293B] hover:bg-[#091936] text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#16B981]" aria-hidden="true" />
                    <span>Exportar Extrato</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadTransactionsCsv(transactions);
                      onNotify('Relatório CSV exportado', 'Histórico descarregado com sucesso.', 'success');
                    }}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#102A56] dark:text-slate-100 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              <div className="w-full min-w-0 h-[270px] rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-3 sm:p-4 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="label" tick={{ fill: axisStroke, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatCompactKz} tick={{ fill: axisStroke, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip
                      formatter={(val: unknown) => formatKwanza(Number(val) || 0)}
                      contentStyle={{
                        backgroundColor: isDark ? '#0B1120' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="gross" name="Volume Bruto" fill={grossBarColor} radius={[5, 5, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="net" name="Lucro Líquido (93,5%)" fill="#16B981" radius={[5, 5, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 pr-4 font-semibold">Ref</th>
                      <th className="py-2.5 pr-4 font-semibold">Cliente / Produto</th>
                      <th className="py-2.5 pr-4 font-semibold">Canal</th>
                      <th className="py-2.5 pr-4 font-semibold text-right">Bruto</th>
                      <th className="py-2.5 pr-4 font-semibold text-right">Líquido (93,5%)</th>
                      <th className="py-2.5 font-semibold text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.slice(0, 6).map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-3 pr-4 font-mono font-bold text-[#102A56] dark:text-white whitespace-nowrap">
                          {tx.reference}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-[#102A56] dark:text-slate-100">{tx.customer}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{tx.product}</div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {tx.channel}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatKwanza(tx.grossAmount)}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono font-bold tabular-nums text-[#0B7A54] dark:text-[#16B981] whitespace-nowrap">
                          +{formatKwanza(tx.netAmount)}
                        </td>
                        <td className="py-3 text-right font-semibold text-[#0B7A54] dark:text-[#16B981] whitespace-nowrap">
                          {tx.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: LINKS & CÓDIGOS QR */}
        {activeTab === 'links-qr' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800 space-y-5">
              <div>
                <h2 className="font-display text-xl font-extrabold text-[#102A56] dark:text-white">
                  Criar Link &amp; Código QR
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Gere links de valor fixo para cobrar no WhatsApp, redes sociais ou balcão.
                </p>
              </div>

              <form onSubmit={handleCreateDashboardLink} className="space-y-4">
                <div>
                  <label htmlFor="dash-prod" className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1">
                    Nome do Produto / Serviço
                  </label>
                  <input
                    id="dash-prod"
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Ex: Consulta Express"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
                  />
                </div>
                <div>
                  <label htmlFor="dash-amount" className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1">
                    Valor Fixo (Kz)
                  </label>
                  <input
                    id="dash-amount"
                    type="text"
                    inputMode="numeric"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono font-bold bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
                  />
                </div>
                <Cta3DButton type="submit" variant="primary" size="md" className="w-full">
                  <QrCode className="w-4 h-4" aria-hidden="true" />
                  <span>Gerar Link &amp; QR Agora</span>
                </Cta3DButton>
              </form>

              {selectedLink && (
                <div className="pt-5 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                  <SimulatedQRCode value={selectedLink.url} size={170} />
                  <div className="font-display text-sm font-bold text-[#102A56] dark:text-white mt-3">
                    {selectedLink.productName} · {formatKwanza(selectedLink.amount)}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 break-all">
                    {selectedLink.url}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800">
              <h3 className="font-display text-lg font-extrabold text-[#102A56] dark:text-white mb-4">
                Os Seus Links de Pagamento ({links.length})
              </h3>
              <div className="space-y-3">
                {links.map((link) => {
                  const isSelected = selectedLink?.id === link.id;
                  return (
                    <div
                      key={link.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        isSelected
                          ? 'bg-[#F8FAFC] dark:bg-[#0F172A] border-[#16B981]'
                          : 'bg-[#F8FAFC] dark:bg-[#0F172A] border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link2 className="w-3.5 h-3.5 text-[#16B981] shrink-0" aria-hidden="true" />
                            <span className="font-display text-sm font-bold text-[#102A56] dark:text-white truncate">
                              {link.productName}
                            </span>
                            <span className="font-mono text-xs font-extrabold text-[#0B7A54] dark:text-[#16B981] tabular-nums">
                              {formatKwanza(link.amount)}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                            {link.url} · {link.paidCount} pagamentos
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedQrLinkId(link.id)}
                            className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold cursor-pointer"
                          >
                            Ver QR
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(link.url, link.id, link.productName)}
                            className="min-h-[32px] px-2.5 py-1 rounded-lg bg-[#102A56] dark:bg-[#16B981] text-white dark:text-[#091936] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === link.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>Copiar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onSimulateSale(link.amount, {
                                customer: 'Comprador Link QR',
                                product: link.productName,
                                channel: 'QR Code',
                                linkId: link.id,
                              })
                            }
                            className="min-h-[32px] px-2.5 py-1 rounded-lg bg-[#16B981]/15 text-[#0B7A54] dark:text-[#16B981] text-[11px] font-bold cursor-pointer"
                          >
                            Simular Pago
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleLink(link.id)}
                            className="min-h-[32px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold cursor-pointer"
                          >
                            {link.active ? 'Ativo' : 'Pausado'}
                          </button>
                          {links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteLink(link.id)}
                              aria-label={`Remover ${link.productName}`}
                              className="min-h-[32px] px-2 py-1 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CHECKOUT & SIMULADOR MULTICAIXA EXPRESS */}
        {activeTab === 'checkout' && (
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800">
            <h2 className="font-display text-2xl font-extrabold text-[#102A56] dark:text-white mb-1">
              Terminal de Cobrança &amp; Teste Checkout Express
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Envie um pedido de pagamento Multicaixa Express ou teste o fluxo completo da sua loja {profile.businessName}.
            </p>

            <form onSubmit={handleCheckoutTestSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="chk-prod" className="block text-xs font-semibold mb-1">
                    Descrição da Cobrança
                  </label>
                  <input
                    id="chk-prod"
                    type="text"
                    value={checkoutProduct}
                    onChange={(e) => setCheckoutProduct(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="chk-amt" className="block text-xs font-semibold mb-1">
                    Valor (Kz)
                  </label>
                  <input
                    id="chk-amt"
                    type="text"
                    inputMode="numeric"
                    value={checkoutAmount}
                    onChange={(e) => setCheckoutAmount(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono font-bold bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="chk-name" className="block text-xs font-semibold mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    id="chk-name"
                    type="text"
                    value={checkoutBuyerName}
                    onChange={(e) => setCheckoutBuyerName(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="chk-phone" className="block text-xs font-semibold mb-1">
                    Multicaixa Express do Cliente
                  </label>
                  <div className="relative">
                    <input
                      id="chk-phone"
                      type="tel"
                      maxLength={11}
                      value={checkoutBuyerPhone}
                      onChange={(e) => setCheckoutBuyerPhone(formatAngolanPhone(e.target.value))}
                      className="w-full min-h-[42px] pl-9 pr-3 py-2 text-sm font-mono bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {(() => {
                const bd = calculateFeeBreakdown(Number(checkoutAmount) || 0);
                return (
                  <div className="p-4 rounded-xl bg-[#102A56] dark:bg-[#0F172A] text-white flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-300">Taxa 6,5%:</span>{' '}
                      <span className="font-mono font-bold">-{formatKwanza(bd.feeAmount)}</span>
                    </div>
                    <div>
                      <span className="text-[#16B981] font-semibold">Entra no seu IBAN:</span>{' '}
                      <span className="font-mono text-base font-extrabold text-[#16B981] tabular-nums">
                        {formatKwanza(bd.netAmount)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <Cta3DButton type="submit" variant="primary" size="lg" className="w-full">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Enviar Cobrança &amp; Confirmar Pagamento</span>
              </Cta3DButton>
            </form>
          </div>
        )}

        {/* TAB 4: CONFIGURAÇÕES & WEBHOOKS */}
        {activeTab === 'configuracoes' && (
          <WebhookSettingsManager
            webhooks={webhooks}
            deliveryLogs={deliveryLogs}
            onAddWebhook={onAddWebhook}
            onToggleWebhook={onToggleWebhook}
            onDeleteWebhook={onDeleteWebhook}
            onTestWebhook={onTestWebhook}
            onNotify={onNotify}
          />
        )}

        {/* TAB 5: API REST & MCP */}
        {activeTab === 'api-mcp' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="font-display text-xl font-extrabold text-[#102A56] dark:text-white">
                Credenciais de Integração (MCP, API &amp; Nativa)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prontas para uso imediato sem pedidos bancários ou papelada.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-500">Merchant ID</div>
                    <div className="font-mono text-xs font-bold truncate">{profile.merchantId}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(profile.merchantId, 'mrc', 'Merchant ID')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Copiar
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-500">Chave API REST (Live)</div>
                    <div className="font-mono text-xs font-bold truncate">
                      {showApiKey ? profile.apiKeyPreview : 'pg_live_ao_••••••••••••'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowApiKey((v) => !v)}
                      aria-label={showApiKey ? 'Ocultar chave API' : 'Mostrar chave API'}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(profile.apiKeyPreview, 'apikey', 'Chave API')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Copiar
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerateKey}
                      aria-label="Regenerar chave API"
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-500">Endpoint MCP Server</div>
                    <div className="font-mono text-xs font-bold truncate">{profile.mcpEndpoint}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(profile.mcpEndpoint, 'mcp', 'Endpoint MCP')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Copiar
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-500">URL da Loja Checkout</div>
                    <div className="font-mono text-xs font-bold truncate">{profile.checkoutUrl}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onNotify(
                        'Evento Webhook enviado!',
                        `HTTP 200 OK recebido de ${profile.webhookUrl}.`,
                        'success',
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#16B981] text-[#091936] text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    Testar Webhook
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0B1120] border border-slate-800 text-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-white">
                  Exemplo Rápido API REST &amp; MCP
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `curl -X POST https://api.paguei.ao/v1/charges \\\n  -H "Authorization: Bearer ${profile.apiKeyPreview}" \\\n  -d '{"amount": 25000, "currency": "AOA", "express": "${profile.expressPhone}"}'`,
                      'curl',
                      'Snippet cURL',
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
                >
                  Copiar cURL
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#070D19] border border-slate-800 font-mono text-xs text-[#16B981] overflow-x-auto leading-relaxed">
{`curl -X POST https://api.paguei.ao/v1/charges \\
  -H "Authorization: Bearer ${showApiKey ? profile.apiKeyPreview : 'pg_live_ao_••••••••••••'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 25000,
    "currency": "AOA",
    "express": "${profile.expressPhone}",
    "settlement_iban": "${profile.iban}"
  }'`}
              </pre>
              <pre className="p-4 rounded-xl bg-[#070D19] border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`// MCP Config (Agentes & Automação)
{
  "mcpServers": {
    "paguei-angola": {
      "url": "${profile.mcpEndpoint}",
      "merchantId": "${profile.merchantId}"
    }
  }
}`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 5: SUPORTE 24 HORAS */}
        {activeTab === 'suporte' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-xl font-extrabold text-[#102A56] dark:text-white mb-1">
                Abrir Pedido ao Suporte 24h
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                Atendimento prioritário para comerciantes registados ({profile.merchantId}).
              </p>

              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label htmlFor="tkt-subj" className="block text-xs font-semibold mb-1">
                    Assunto
                  </label>
                  <input
                    id="tkt-subj"
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Ex: Dúvida sobre liquidação no IBAN"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="tkt-msg" className="block text-xs font-semibold mb-1">
                    Mensagem
                  </label>
                  <textarea
                    id="tkt-msg"
                    rows={4}
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Descreva a sua dúvida..."
                    className="w-full px-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <Cta3DButton type="submit" variant="primary" size="md" className="w-full">
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Enviar Pedido 24h</span>
                </Cta3DButton>
              </form>
            </div>

            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800">
              <h3 className="font-display text-lg font-extrabold text-[#102A56] dark:text-white mb-4">
                Histórico de Atendimento ({tickets.length})
              </h3>
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-sm font-bold text-[#102A56] dark:text-white">
                        {t.subject}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#0B7A54] dark:text-[#16B981]">
                        {t.status} · {t.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {t.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
