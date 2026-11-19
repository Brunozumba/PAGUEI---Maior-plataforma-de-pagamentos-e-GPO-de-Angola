import { useState } from 'react';
import {
  Activity,
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Plus,
  Send,
  Shield,
  Trash2,
} from 'lucide-react';
import type {
  WebhookDeliveryLog,
  WebhookEndpoint,
  WebhookEventType,
} from '../types/paguei';
import { formatKwanza } from '../utils/formatters';
import { Cta3DButton } from './Cta3DButton';

interface WebhookSettingsManagerProps {
  webhooks: WebhookEndpoint[];
  deliveryLogs: WebhookDeliveryLog[];
  onAddWebhook: (endpoint: WebhookEndpoint) => void;
  onToggleWebhook: (id: string) => void;
  onDeleteWebhook: (id: string) => void;
  onTestWebhook: (endpoint: WebhookEndpoint) => void;
  onNotify: (title: string, description?: string, variant?: 'success' | 'info') => void;
}

const AVAILABLE_EVENTS: { id: WebhookEventType; label: string }[] = [
  { id: 'transaction.approved', label: 'transaction.approved (Transação aprovada)' },
  { id: 'transaction.settled', label: 'transaction.settled (Liquidado no IBAN)' },
  { id: 'link.paid', label: 'link.paid (Link / QR pago)' },
];

export function WebhookSettingsManager({
  webhooks,
  deliveryLogs,
  onAddWebhook,
  onToggleWebhook,
  onDeleteWebhook,
  onTestWebhook,
  onNotify,
}: WebhookSettingsManagerProps) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>([
    'transaction.approved',
    'transaction.settled',
  ]);
  const [formError, setFormError] = useState('');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleEvent = (event: WebhookEventType) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    const cleanLabel = label.trim() || 'Servidor Externo';

    let isValidUrl = false;
    try {
      const parsed = new URL(cleanUrl);
      isValidUrl = parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      isValidUrl = false;
    }

    if (!isValidUrl) {
      setFormError('Informe um URL válido começando por https:// ou http://');
      return;
    }

    if (selectedEvents.length === 0) {
      setFormError('Selecione pelo menos um evento para notificação em tempo real.');
      return;
    }

    setFormError('');
    const newEndpoint: WebhookEndpoint = {
      id: `wh-${Date.now()}`,
      label: cleanLabel,
      url: cleanUrl,
      secret: `whsec_ao_${Math.random().toString(36).slice(2, 16)}`,
      events: selectedEvents,
      active: true,
      createdAt: new Date().toLocaleTimeString('pt-AO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onAddWebhook(newEndpoint);
    setLabel('');
    setUrl('');
    onNotify(
      'Webhook registado com sucesso!',
      `${newEndpoint.url} receberá notificações em tempo real.`,
      'success',
    );
  };

  const handleCopySecret = (id: string, secret: string) => {
    navigator.clipboard?.writeText(secret).catch(() => {});
    setCopiedId(id);
    onNotify('Segredo HMAC copiado', 'Use este segredo para validar X-Paguei-Signature.', 'info');
    setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B7A54] dark:text-[#16B981] mb-1">
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Configurações de Notificações em Tempo Real</span>
          </div>
          <h3 className="font-display text-xl font-extrabold text-[#102A56] dark:text-white">
            Webhooks para Servidores Externos
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Registe URLs externas para receber notificações instantâneas (POST JSON + assinatura HMAC-SHA256) sempre que uma transação for aprovada.
          </p>
        </div>
        <span className="font-mono text-xs font-bold text-[#0B7A54] dark:text-[#16B981] shrink-0">
          {webhooks.filter((w) => w.active).length} ativo(s)
        </span>
      </div>

      {/* Add Webhook Form */}
      <form
        onSubmit={handleRegister}
        className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label
              htmlFor="wh-label"
              className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1"
            >
              Nome do Servidor / Integração
            </label>
            <input
              id="wh-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: ERP Loja / Bot WhatsApp"
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
            />
          </div>

          <div className="md:col-span-8">
            <label
              htmlFor="wh-url"
              className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1"
            >
              URL do Webhook (Endpoint HTTPS)
            </label>
            <input
              id="wh-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="https://api.suaplataforma.ao/webhooks/paguei"
              className="w-full min-h-[42px] px-3 py-2 text-sm font-mono bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#16B981]"
            />
          </div>
        </div>

        <div>
          <span className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-2">
            Eventos subscritos
          </span>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_EVENTS.map((ev) => {
              const checked = selectedEvents.includes(ev.id);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggleEvent(ev.id)}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-colors ${
                    checked
                      ? 'bg-[#102A56] dark:bg-[#16B981] text-white dark:text-[#091936] border-[#102A56] dark:border-[#16B981] font-bold'
                      : 'bg-white dark:bg-[#162238] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {ev.label}
                </button>
              );
            })}
          </div>
        </div>

        {formError && (
          <p className="text-xs font-semibold text-[#DC2626] dark:text-rose-400" role="alert">
            {formError}
          </p>
        )}

        <div className="flex justify-end">
          <Cta3DButton type="submit" variant="primary" size="md">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Registar URL de Webhook</span>
          </Cta3DButton>
        </div>
      </form>

      {/* Registered Endpoints List */}
      <div className="space-y-3">
        <h4 className="font-display text-sm font-bold text-[#102A56] dark:text-white">
          URLs Registadas ({webhooks.length})
        </h4>

        {webhooks.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
            Nenhum webhook registado. Adicione um URL acima para receber notificações automáticas.
          </p>
        ) : (
          webhooks.map((wh) => {
            const isRevealed = Boolean(revealedSecrets[wh.id]);
            return (
              <div
                key={wh.id}
                className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-bold text-[#102A56] dark:text-white">
                        {wh.label}
                      </span>
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          wh.active
                            ? 'text-[#0B7A54] dark:text-[#16B981]'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        · {wh.active ? 'Ativo' : 'Pausado'}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                      {wh.url}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onTestWebhook(wh)}
                      className="min-h-[34px] px-3 py-1 rounded-lg bg-[#16B981] hover:bg-[#129B6B] text-[#091936] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" aria-hidden="true" />
                      <span>Disparar Teste</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleWebhook(wh.id)}
                      className="min-h-[34px] px-3 py-1 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      {wh.active ? 'Pausar' : 'Ativar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteWebhook(wh.id)}
                      aria-label={`Remover webhook ${wh.label}`}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400 font-mono">
                    <Shield className="w-3.5 h-3.5 text-[#16B981]" aria-hidden="true" />
                    <span>Segredo:</span>
                    <span className="text-[#102A56] dark:text-slate-200 font-semibold">
                      {isRevealed ? wh.secret : 'whsec_ao_••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedSecrets((prev) => ({ ...prev, [wh.id]: !prev[wh.id] }))
                      }
                      aria-label={isRevealed ? 'Ocultar segredo' : 'Mostrar segredo'}
                      className="p-1 text-slate-500 hover:text-[#102A56] dark:hover:text-white cursor-pointer"
                    >
                      {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopySecret(wh.id, wh.secret)}
                      className="px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === wh.id ? (
                        <Check className="w-3 h-3 text-[#16B981]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copiar</span>
                    </button>
                  </div>

                  <div className="text-slate-500 dark:text-slate-400 font-mono">
                    Eventos: {wh.events.join(', ')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Real-Time Delivery Feed */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#16B981]" aria-hidden="true" />
            <h4 className="font-display text-sm font-bold text-[#102A56] dark:text-white">
              Registo de Notificações Enviadas em Tempo Real
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Disparo automático a cada transação aprovada
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto">
          {deliveryLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <span className="font-bold text-[#0B7A54] dark:text-[#16B981]">
                    {log.statusLabel}
                  </span>
                  <span className="font-semibold text-[#102A56] dark:text-white">
                    {log.event}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">· {log.reference}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {log.webhookLabel} ({log.url})
                </div>
              </div>
              <div className="font-mono text-[11px] text-right shrink-0 tabular-nums text-slate-600 dark:text-slate-300">
                <div>{formatKwanza(log.amount)}</div>
                <div className="text-slate-400">{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
