import { UserX, CalendarX, ShieldOff, Building2, Briefcase } from 'lucide-react';

/**
 * Resumo exibido ao final da automação de desligamento — confirma que o
 * acesso à Central de Dados foi bloqueado e o que mais foi revogado.
 */
export default function DesligamentoSummary({
  nome,
  cargo,
  papelLabel,
  dataDesligamento,
  licencasRevogadas,
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/60 p-5 flex flex-col gap-4">
      <div>
        <p className="font-display text-sm font-semibold text-ink2">
          Acesso de {nome.split(' ')[0]} bloqueado
        </p>
        <p className="text-[13px] text-muted mt-0.5">
          Conta desativada e licenças revogadas com sucesso.
        </p>
      </div>

      <div className="flex items-center gap-2.5 rounded-lg bg-surface border border-border px-3.5 py-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-md bg-red-100 text-red-600 shrink-0">
          <ShieldOff size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] text-muted uppercase tracking-wide">Acesso à Central de Dados</p>
          <p className="text-sm font-medium text-ink2">Bloqueado</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <Building2 size={15} className="text-muted mt-0.5 shrink-0" />
          <div>
            <dt className="text-[11px] text-muted">Setor</dt>
            <dd className="text-ink2 font-medium">{papelLabel}</dd>
          </div>
        </div>
        {cargo && (
          <div className="flex items-start gap-2">
            <Briefcase size={15} className="text-muted mt-0.5 shrink-0" />
            <div>
              <dt className="text-[11px] text-muted">Cargo</dt>
              <dd className="text-ink2 font-medium">{cargo}</dd>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2 sm:col-span-2">
          <CalendarX size={15} className="text-muted mt-0.5 shrink-0" />
          <div>
            <dt className="text-[11px] text-muted">Data do desligamento</dt>
            <dd className="text-ink2 font-medium">{dataDesligamento}</dd>
          </div>
        </div>
      </dl>

      <div>
        <p className="flex items-center gap-1.5 text-[12px] font-medium text-muted mb-1.5">
          <UserX size={14} /> Licenças revogadas
        </p>
        <div className="flex flex-wrap gap-1.5">
          {licencasRevogadas.map((l) => (
            <span key={l} className="text-[12px] px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
