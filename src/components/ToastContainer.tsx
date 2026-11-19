import { CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notificações em tempo real"
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2.5 w-[min(360px,calc(100vw-2rem))] pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.variant !== 'info';
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto p-4 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 shadow-[0_18px_36px_-12px_rgba(15,23,42,0.28)] flex items-start gap-3 transition-all duration-200"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSuccess
                  ? 'bg-[#16B981]/15 text-[#0B7A54] dark:text-[#34D399]'
                  : 'bg-[#102A56]/10 dark:bg-white/10 text-[#102A56] dark:text-white'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Info className="w-4 h-4" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#102A56] dark:text-white leading-snug">
                {toast.title}
              </div>
              {toast.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug tabular-nums">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Fechar notificação"
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-[#102A56] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
