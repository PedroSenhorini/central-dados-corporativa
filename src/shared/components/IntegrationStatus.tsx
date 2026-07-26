import { Check, Loader2, Circle } from 'lucide-react';

export interface IntegrationStep {
  id: string;
  label: string;
}

export type IntegrationStatusValue = 'idle' | 'running' | 'done';

interface IntegrationStatusProps {
  steps: IntegrationStep[];
  status: IntegrationStatusValue;
  currentStepIndex: number;
}

// mostra o progresso da automação de onboarding em tempo real
export default function IntegrationStatus({ steps, status, currentStepIndex }: IntegrationStatusProps) {
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

          // monta as classes de cor conforme o estado da etapa
          let corBolinha = 'bg-canvas text-muted';
          if (isDone) {
            corBolinha = 'bg-success text-white';
          } else if (isRunning) {
            corBolinha = 'bg-accent-soft text-accent';
          }

          let corTexto = 'text-muted';
          if (isDone) {
            corTexto = 'text-ink2 font-medium';
          } else if (isRunning) {
            corTexto = 'text-ink2';
          }

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
                className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 z-10 ${corBolinha}`}
              >
                {isDone ? (
                  <Check size={14} />
                ) : isRunning ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Circle size={9} fill="currentColor" />
                )}
              </span>
              <span className={`text-sm pt-0.5 ${corTexto}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
