import { useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, Mail, X } from 'lucide-react';
import type { AuthSession } from '../types/paguei';
import { pagueiBackend } from '../services/pagueiBackend';
import { Cta3DButton } from './Cta3DButton';

export type ModalTab = 'ativar' | 'login' | 'suporte';

interface ActivationModalProps {
  isOpen: boolean;
  initialTab: ModalTab;
  onClose: () => void;
  onAuthSuccess: (session: AuthSession, isNewRegistration: boolean) => Promise<void> | void;
  onNotify: (title: string, description?: string, variant?: 'success' | 'info') => void;
}

export function ActivationModal({
  isOpen,
  initialTab,
  onClose,
  onAuthSuccess,
  onNotify,
}: ActivationModalProps) {
  const [mode, setMode] = useState<ModalTab>(initialTab);

  // Simple Email-Only Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Clean standalone 24h Support state
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  if (!isOpen) return null;

  const isAuthMode = mode === 'login' || mode === 'ativar';

  const switchAuthMode = (nextMode: 'login' | 'ativar') => {
    setMode(nextMode);
    setAuthError('');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setAuthError('Indique um endereço de e-mail válido.');
      return;
    }

    if (password.length < 6) {
      setAuthError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    if (mode === 'ativar' && password !== confirmPassword) {
      setAuthError('As palavras-passe não coincidem.');
      return;
    }

    setAuthError('');
    setSubmitting(true);

    try {
      const session =
        mode === 'ativar'
          ? await pagueiBackend.auth.signUpWithEmail({
              email: trimmedEmail,
              password,
            })
          : await pagueiBackend.auth.signInWithEmail({
              email: trimmedEmail,
              password,
            });

      await onAuthSuccess(session, mode === 'ativar');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível concluir o acesso.';
      setAuthError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEmail.trim() || !supportMsg.trim()) return;
    setSupportSent(true);
    onNotify(
      'Mensagem enviada ao Suporte 24h',
      `A equipa PAGUEI! responderá para ${supportEmail.trim()}.`,
      'success',
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'suporte'
          ? 'Suporte 24h PAGUEI!'
          : mode === 'login'
          ? 'Login PAGUEI!'
          : 'Criar conta PAGUEI!'
      }
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07152E]/75"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Clean Top Row */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200 dark:border-slate-700">
          {isAuthMode ? (
            <div className="inline-flex p-1 bg-slate-100 dark:bg-[#0F172A] rounded-lg gap-1">
              <button
                type="button"
                onClick={() => switchAuthMode('login')}
                className={`min-h-[36px] px-4 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-colors ${
                  mode === 'login'
                    ? 'bg-white dark:bg-[#1E293B] text-[#102A56] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#102A56] dark:hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchAuthMode('ativar')}
                className={`min-h-[36px] px-4 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-colors ${
                  mode === 'ativar'
                    ? 'bg-white dark:bg-[#1E293B] text-[#102A56] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#102A56] dark:hover:text-white'
                }`}
              >
                Cadastrar
              </button>
            </div>
          ) : (
            <span className="font-display text-base font-extrabold text-[#102A56] dark:text-white">
              Suporte 24 horas
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#102A56] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {isAuthMode ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-[#102A56] dark:text-white">
                {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta por E-mail'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {mode === 'login'
                  ? 'Use o seu e-mail para aceder ao perfil e painel PAGUEI!.'
                  : 'Simples e rápido. Após entrar, atualize o seu BI, IBAN e Express no perfil.'}
              </p>
            </div>

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="nome@exemplo.ao"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#102A56] dark:focus:border-[#16B981]"
                />
                <Mail
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1.5"
              >
                Palavra-passe
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#102A56] dark:focus:border-[#16B981]"
                />
                <Lock
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>

            {mode === 'ativar' && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1.5"
                >
                  Confirmar palavra-passe
                </label>
                <div className="relative">
                  <input
                    id="auth-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="Repita a palavra-passe"
                    className="w-full min-h-[44px] pl-10 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#102A56] dark:focus:border-[#16B981]"
                  />
                  <Lock
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}

            {authError && (
              <p className="text-xs font-semibold text-[#DC2626] dark:text-rose-400" role="alert">
                {authError}
              </p>
            )}

            <Cta3DButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="w-full"
            >
              <span>
                {submitting
                  ? 'A processar...'
                  : mode === 'login'
                  ? 'Entrar'
                  : 'Criar Conta'}
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Cta3DButton>

            <p className="text-center text-xs text-slate-600 dark:text-slate-300 pt-1">
              {mode === 'login' ? (
                <>
                  Ainda não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => switchAuthMode('ativar')}
                    className="font-semibold text-[#102A56] dark:text-[#16B981] hover:underline underline-offset-4 cursor-pointer"
                  >
                    Criar conta
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => switchAuthMode('login')}
                    className="font-semibold text-[#102A56] dark:text-[#16B981] hover:underline underline-offset-4 cursor-pointer"
                  >
                    Fazer Login
                  </button>
                </>
              )}
            </p>
          </form>
        ) : supportSent ? (
          <div className="py-6 text-center">
            <CheckCircle2
              className="w-10 h-10 text-[#0B7A54] dark:text-[#16B981] mx-auto mb-3"
              aria-hidden="true"
            />
            <h3 className="font-display text-xl font-bold text-[#102A56] dark:text-white mb-1">
              Mensagem Enviada
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              Responderemos para <strong className="font-semibold">{supportEmail}</strong> em
              instantes.
            </p>
            <button
              type="button"
              onClick={() => {
                setSupportSent(false);
                setSupportMsg('');
                onClose();
              }}
              className="min-h-[42px] px-5 py-2 bg-[#102A56] dark:bg-[#16B981] text-white dark:text-[#091936] text-sm font-semibold rounded-xl cursor-pointer"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Atendimento contínuo para dúvidas sobre a sua conta, integrações ou pagamentos.
            </p>
            <div>
              <label
                htmlFor="s-email"
                className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1"
              >
                Seu E-mail
              </label>
              <input
                id="s-email"
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="nome@exemplo.ao"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#102A56] dark:focus:border-[#16B981]"
              />
            </div>
            <div>
              <label
                htmlFor="s-msg"
                className="block text-xs font-semibold text-[#102A56] dark:text-slate-200 mb-1"
              >
                Mensagem
              </label>
              <textarea
                id="s-msg"
                rows={3}
                required
                value={supportMsg}
                onChange={(e) => setSupportMsg(e.target.value)}
                placeholder="Como podemos ajudar?"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-xl text-[#102A56] dark:text-white focus:outline-none focus:border-[#102A56] dark:focus:border-[#16B981]"
              />
            </div>
            <Cta3DButton type="submit" variant="dark" size="lg" className="w-full">
              <span>Enviar Pedido 24h</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Cta3DButton>
          </form>
        )}
      </div>
    </div>
  );
}
