import { Check, Loader2, Circle } from 'lucide-react';

/**
 * Exibe o progresso da automação de onboarding em tempo real.
 *
 * props:
 * - steps: { id: string, label: string }[]
 * - status: 'idle' | 'running' | 'done'
 * - currentStepIndex: number  -> índice da etapa em execução (-1 se parado)
 */
export default function IntegrationStatus({ steps, status, currentStepIndex }) {
  const completedCount =
    status === 'done' ? steps.length : Math.max(currentStepIndex, 0);
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card flex flex-col gap-5">
      <div>
        <p className="font-display text-base font-semibold text-ink2">Status de Integração</p>
        <p className="text-[13px] text-muted mt-0.5">
          {status === 'idle' && 'Aguardando envio do formulário de onboarding.'}
          {status === 'running' && 'Provisionando conta e licenças no Microsoft 365...'}
          {status === 'done' && 'Onboarding concluído com sucesso.'}
        </p>
      </div>

      {/* Barra de progresso geral */}
      <div>
        <div className="flex items-center justify-between text-[12px] text-muted mb-1.5">
          <span>Progresso geral</span>
          <span className="font-medium text-ink2">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-canvas overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              status === 'done' ? 'bg-success' : 'bg-accent'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Lista de etapas */}
      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const isDone = status === 'done' || index < currentStepIndex;
          const isRunning = status === 'running' && index === currentStepIndex;

          return (
            <li key={step.id} className="flex gap-3 relative pb-5 last:pb-0">
              {index < steps.length - 1 && (
                <span
                  className={`absolute left-[11px] top-6 w-px h-full ${
                    isDone ? 'bg-success' : 'bg-border'
                  }`}
                />
              )}
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 z-10 ${
                  isDone
                    ? 'bg-success text-white'
                    : isRunning
                    ? 'bg-accent-soft text-accent'
                    : 'bg-canvas text-muted'
                }`}
              >
                {isDone ? (
                  <Check size={14} />
                ) : isRunning ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Circle size={9} fill="currentColor" />
                )}
              </span>
              <span
                className={`text-sm pt-0.5 ${
                  isDone ? 'text-ink2 font-medium' : isRunning ? 'text-ink2' : 'text-muted'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
