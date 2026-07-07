import { Mail, Building2, UserCheck, Briefcase, ShieldCheck, Share2 } from 'lucide-react';

/**
 * Resumo humanizado do onboarding, exibido assim que a automação termina.
 * É aqui que o e-mail gerado, o setor, o gestor e os acessos concedidos
 * ficam visíveis para quem está fazendo o onboarding — sem precisar abrir
 * o Microsoft 365 admin center para conferir.
 */
export default function OnboardingSummary({
  nome,
  email,
  cargo,
  setorNome,
  gestor,
  licencasSelecionadas,
  acessosAutomaticos,
}) {
  return (
    <div className="rounded-xl border border-success/30 bg-success/5 p-5 flex flex-col gap-4">
      <div>
        <p className="font-display text-sm font-semibold text-ink2">
          {nome.split(' ')[0]} já pode começar 🎉
        </p>
        <p className="text-[13px] text-muted mt-0.5">
          Conta criada e acessos concedidos com sucesso.
        </p>
      </div>

      {/* E-mail gerado em destaque */}
      <div className="flex items-center gap-2.5 rounded-lg bg-surface border border-border px-3.5 py-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-md bg-primary-soft text-primary shrink-0">
          <Mail size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] text-muted uppercase tracking-wide">E-mail corporativo criado</p>
          <p className="text-sm font-medium text-ink2 truncate">{email}</p>
        </div>
      </div>

      {/* Dados de organização */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <Briefcase size={15} className="text-muted mt-0.5 shrink-0" />
          <div>
            <dt className="text-[11px] text-muted">Cargo</dt>
            <dd className="text-ink2 font-medium">{cargo}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Building2 size={15} className="text-muted mt-0.5 shrink-0" />
          <div>
            <dt className="text-[11px] text-muted">Setor</dt>
            <dd className="text-ink2 font-medium">{setorNome}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2 sm:col-span-2">
          <UserCheck size={15} className="text-muted mt-0.5 shrink-0" />
          <div>
            <dt className="text-[11px] text-muted">Gestor responsável</dt>
            <dd className="text-ink2 font-medium">{gestor}</dd>
          </div>
        </div>
      </dl>

      {/* Licenças concedidas */}
      <div>
        <p className="flex items-center gap-1.5 text-[12px] font-medium text-muted mb-1.5">
          <ShieldCheck size={14} /> Licenças concedidas
        </p>
        <div className="flex flex-wrap gap-1.5">
          {licencasSelecionadas.map((l) => (
            <span
              key={l}
              className="text-[12px] px-2 py-1 rounded-full bg-primary-soft text-primary font-medium"
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Acessos automáticos do setor */}
      <div>
        <p className="flex items-center gap-1.5 text-[12px] font-medium text-muted mb-1.5">
          <Share2 size={14} /> Acessos do setor vinculados automaticamente
        </p>
        <ul className="flex flex-col gap-1">
          {acessosAutomaticos.map((a) => (
            <li key={a.nome} className="text-[13px] text-ink2 flex items-center gap-1.5">
              <span className="text-[11px] text-muted uppercase w-[124px] shrink-0">{a.tipo}</span>
              {a.nome}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
