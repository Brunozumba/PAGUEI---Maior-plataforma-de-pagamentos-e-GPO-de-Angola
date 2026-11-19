import { useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CorePillars3D } from './components/CorePillars3D';
import { TestimonialsAndPartners } from './components/TestimonialsAndPartners';
import { FaqAccordion } from './components/FaqAccordion';
import { Cta3DBanner } from './components/Cta3DBanner';
import { ActivationModal, type ModalTab } from './components/ActivationModal';
import { MerchantWorkspace } from './components/MerchantWorkspace';
import { Footer } from './components/Footer';
import { ToastContainer, type ToastMessage } from './components/ToastContainer';
import { OfflineIndicator, UpdateBanner } from './components/OfflineAndInstallUI';
import { useServiceWorkerManager } from './hooks/useServiceWorkerManager';
import { pagueiBackend } from './services/pagueiBackend';
import type {
  AuthSession,
  GeneratedPaymentLink,
  MerchantProfile,
  PaymentChannel,
  SupportTicket,
  TransactionRecord,
  WebhookDeliveryLog,
  WebhookEndpoint,
} from './types/paguei';
import { calculateFeeBreakdown, formatKwanza } from './utils/formatters';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>('ativar');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('paguei_theme') === 'dark';
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [session, setSession] = useState<AuthSession | null>(null);
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  const [links, setLinks] = useState<GeneratedPaymentLink[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<WebhookDeliveryLog[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('paguei_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const hydrateUserWorkspace = useCallback(async (activeSession: AuthSession) => {
    const userId = activeSession.user.id;
    const [profile, txList, linkList, hookList, hookLogs, ticketList] = await Promise.all([
      pagueiBackend.profile.get(userId, activeSession.user.email),
      pagueiBackend.transactions.list(userId),
      pagueiBackend.links.list(userId),
      pagueiBackend.webhooks.list(userId),
      pagueiBackend.webhooks.listLogs(userId),
      pagueiBackend.support.listTickets(userId),
    ]);

    setMerchantProfile(profile);
    setTransactions(txList);
    setLinks(linkList);
    setWebhooks(hookList);
    setDeliveryLogs(hookLogs);
    setTickets(ticketList);
  }, []);

  // Restore session cleanly on mount via backend adapter
  useEffect(() => {
    let mounted = true;
    void pagueiBackend.auth.getSession().then(async (existing) => {
      if (!mounted || !existing) return;
      setSession(existing);
      await hydrateUserWorkspace(existing);
    });
    return () => {
      mounted = false;
    };
  }, [hydrateUserWorkspace]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((
    title: string,
    description?: string,
    variant: 'success' | 'info' = 'success',
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, title, description, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const swManager = useServiceWorkerManager({ onNotify: pushToast });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    pushToast(
      nextDark ? 'Modo Escuro PAGUEI! ativado' : 'Modo Claro ativado',
      nextDark
        ? 'Tema noturno #0F172A com contraste calibrado.'
        : 'Interface clara padrão restaurada.',
      'info',
    );
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGoHome = () => {
    setWorkspaceOpen(false);
    setJustRegistered(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = (tab: ModalTab) => {
    setModalTab(tab);
    setModalOpen(true);
  };

  const handleAuthSuccess = async (
    nextSession: AuthSession,
    isNewRegistration: boolean,
  ) => {
    setSession(nextSession);
    await hydrateUserWorkspace(nextSession);
    setJustRegistered(isNewRegistration);
    setModalOpen(false);
    setWorkspaceOpen(true);

    pushToast(
      isNewRegistration ? 'Conta criada com sucesso!' : 'Login efetuado!',
      'O seu Perfil e Painel PAGUEI! foram abertos automaticamente.',
      'success',
    );
  };

  const handleUpdateProfile = (updated: MerchantProfile) => {
    setMerchantProfile(updated);
    if (session) {
      void pagueiBackend.profile.update(session.user.id, updated);
    }
  };

  const handleLogout = async () => {
    await pagueiBackend.auth.signOut();
    setSession(null);
    setMerchantProfile(null);
    setWorkspaceOpen(false);
    setJustRegistered(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    pushToast('Sessão terminada', 'Voltou para a página inicial PAGUEI!.', 'info');
  };

  const handleAddLink = (link: GeneratedPaymentLink) => {
    setLinks((prev) => {
      const next = [link, ...prev];
      if (session) void pagueiBackend.links.saveAll(session.user.id, next);
      return next;
    });
  };

  const handleToggleLink = (id: string) => {
    setLinks((prev) => {
      const next = prev.map((lnk) =>
        lnk.id === id ? { ...lnk, active: !lnk.active } : lnk,
      );
      if (session) void pagueiBackend.links.saveAll(session.user.id, next);
      return next;
    });
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => {
      const next = prev.filter((lnk) => lnk.id !== id);
      if (session) void pagueiBackend.links.saveAll(session.user.id, next);
      return next;
    });
    pushToast('Link removido', 'O link de pagamento foi eliminado do painel.', 'info');
  };

  const dispatchWebhookEvent = (
    targetEndpoints: WebhookEndpoint[],
    reference: string,
    grossAmount: number,
    netAmount: number,
  ) => {
    if (targetEndpoints.length === 0) return;

    const nowTime = new Date().toLocaleTimeString('pt-AO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newLogs: WebhookDeliveryLog[] = targetEndpoints.map((ep) => {
      try {
        void fetch(ep.url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'transaction.approved',
            reference,
            amount_aoa: grossAmount,
            net_aoa: netAmount,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      } catch {
        // ignore sandbox network errors
      }

      return {
        id: `whlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        webhookId: ep.id,
        webhookLabel: ep.label,
        url: ep.url,
        event: 'transaction.approved',
        reference,
        amount: grossAmount,
        statusLabel: '200 OK',
        timestamp: `Agora · ${nowTime}`,
      };
    });

    setDeliveryLogs((prev) => {
      const next = [...newLogs, ...prev].slice(0, 30);
      if (session) void pagueiBackend.webhooks.saveLogs(session.user.id, next);
      return next;
    });

    setWebhooks((prev) => {
      const next = prev.map((ep) =>
        targetEndpoints.some((t) => t.id === ep.id)
          ? { ...ep, lastDeliveredAt: `Agora · ${nowTime}` }
          : ep,
      );
      if (session) void pagueiBackend.webhooks.saveAll(session.user.id, next);
      return next;
    });
  };

  const handleAddWebhook = (endpoint: WebhookEndpoint) => {
    setWebhooks((prev) => {
      const next = [endpoint, ...prev];
      if (session) void pagueiBackend.webhooks.saveAll(session.user.id, next);
      return next;
    });
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks((prev) => {
      const next = prev.map((ep) =>
        ep.id === id ? { ...ep, active: !ep.active } : ep,
      );
      if (session) void pagueiBackend.webhooks.saveAll(session.user.id, next);
      return next;
    });
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks((prev) => {
      const next = prev.filter((ep) => ep.id !== id);
      if (session) void pagueiBackend.webhooks.saveAll(session.user.id, next);
      return next;
    });
    pushToast('Webhook removido', 'O endpoint deixou de receber notificações.', 'info');
  };

  const handleTestWebhook = (endpoint: WebhookEndpoint) => {
    const sampleRef = `PG-${Math.floor(908500 + Math.random() * 9000)}`;
    dispatchWebhookEvent([endpoint], sampleRef, 50000, 46750);
    pushToast(
      'Notificação de teste enviada!',
      `POST transaction.approved (${sampleRef}) enviado para ${endpoint.url}.`,
      'success',
    );
  };

  const handleSimulateSale = (
    gross: number,
    options?: {
      customer?: string;
      phone?: string;
      product?: string;
      channel?: PaymentChannel;
      linkId?: string;
    },
  ) => {
    const { feeAmount, netAmount } = calculateFeeBreakdown(gross);
    const ref = `PG-${Math.floor(908500 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString('pt-AO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newTx: TransactionRecord = {
      id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      reference: ref,
      customer: options?.customer ?? 'Cliente Express',
      phone: options?.phone ?? '923 456 789',
      product: options?.product ?? 'Cobrança PAGUEI!',
      channel: options?.channel ?? 'Multicaixa Express',
      grossAmount: gross,
      feeAmount,
      netAmount,
      status: 'Liquidado',
      timestampLabel: `Agora · ${nowTime}`,
      periodBucket: 'hoje',
    };

    setTransactions((prev) => {
      const next = [newTx, ...prev];
      if (session) void pagueiBackend.transactions.saveAll(session.user.id, next);
      return next;
    });

    if (options?.linkId) {
      setLinks((prev) => {
        const next = prev.map((l) =>
          l.id === options.linkId ? { ...l, paidCount: l.paidCount + 1 } : l,
        );
        if (session) void pagueiBackend.links.saveAll(session.user.id, next);
        return next;
      });
    }

    const activeHooks = webhooks.filter(
      (wh) => wh.active && wh.events.includes('transaction.approved'),
    );
    dispatchWebhookEvent(activeHooks, ref, gross, netAmount);

    pushToast(
      `Transação ${ref} aprovada!`,
      activeHooks.length > 0
        ? `Líquido ${formatKwanza(netAmount)} · ${activeHooks.length} webhook(s) notificados.`
        : `Venda de ${formatKwanza(gross)} · Líquido ${formatKwanza(netAmount)} creditado.`,
      'success',
    );
  };

  const handleAddTicket = (ticket: SupportTicket) => {
    setTickets((prev) => {
      const next = [ticket, ...prev];
      if (session) void pagueiBackend.support.saveTickets(session.user.id, next);
      return next;
    });
  };

  const isAuthenticated = Boolean(session && merchantProfile);

  if (workspaceOpen && session && merchantProfile) {
    return (
      <>
        <MerchantWorkspace
          key={merchantProfile.merchantId}
          profile={merchantProfile}
          justRegistered={justRegistered}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          links={links}
          transactions={transactions}
          tickets={tickets}
          webhooks={webhooks}
          deliveryLogs={deliveryLogs}
          onUpdateProfile={handleUpdateProfile}
          onAddLink={handleAddLink}
          onToggleLink={handleToggleLink}
          onDeleteLink={handleDeleteLink}
          onAddWebhook={handleAddWebhook}
          onToggleWebhook={handleToggleWebhook}
          onDeleteWebhook={handleDeleteWebhook}
          onTestWebhook={handleTestWebhook}
          onSimulateSale={handleSimulateSale}
          onAddTicket={handleAddTicket}
          onBackToLanding={handleGoHome}
          onLogout={handleLogout}
          onNotify={pushToast}
        />
        <OfflineIndicator isOnline={swManager.isOnline} />
        <UpdateBanner
          needRefresh={swManager.needRefresh}
          onUpdate={swManager.applyUpdate}
          onDismiss={swManager.dismissUpdate}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F172A] text-[#102A56] dark:text-slate-100 transition-colors">
      <Navbar
        isAuthenticated={isAuthenticated}
        businessName={merchantProfile?.businessName}
        onGoHome={handleGoHome}
        onNavigate={scrollToSection}
        onOpenActivation={() => openModal('ativar')}
        onOpenLogin={() => openModal('login')}
        onOpenWorkspace={() => setWorkspaceOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenActivation={() =>
            isAuthenticated ? setWorkspaceOpen(true) : openModal('ativar')
          }
          onOpenLogin={() =>
            isAuthenticated ? setWorkspaceOpen(true) : openModal('login')
          }
          onNavigate={scrollToSection}
        />

        <CorePillars3D
          onOpenActivation={() =>
            isAuthenticated ? setWorkspaceOpen(true) : openModal('ativar')
          }
        />

        <TestimonialsAndPartners />

        <FaqAccordion
          onOpenActivation={() =>
            isAuthenticated ? setWorkspaceOpen(true) : openModal('ativar')
          }
          onOpenSupport={() => openModal('suporte')}
        />

        <Cta3DBanner
          onOpenActivation={() =>
            isAuthenticated ? setWorkspaceOpen(true) : openModal('ativar')
          }
          onOpenSupport={() => openModal('suporte')}
        />
      </main>

      <Footer
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onNavigate={scrollToSection}
        onOpenLogin={() =>
          isAuthenticated ? setWorkspaceOpen(true) : openModal('login')
        }
        isOnline={swManager.isOnline}
        swStatus={swManager.swStatus}
        offlineReady={swManager.offlineReady}
        lastSyncedLabel={swManager.lastSyncedLabel}
        onVerifyCache={swManager.verifyOfflineCache}
        onNotify={pushToast}
      />

      <ActivationModal
        key={modalTab + String(modalOpen)}
        isOpen={modalOpen}
        initialTab={modalTab}
        onClose={() => setModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onNotify={pushToast}
      />

      <OfflineIndicator isOnline={swManager.isOnline} />
      <UpdateBanner
        needRefresh={swManager.needRefresh}
        onUpdate={swManager.applyUpdate}
        onDismiss={swManager.dismissUpdate}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
