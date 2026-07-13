import { useEffect, useMemo, useRef, useState } from 'react';
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx';
import IntegrationStatus from '../../../shared/components/IntegrationStatus.jsx';
import OnboardingSummary from '../../../shared/components/OnboardingSummary.jsx';
import { useAppContext } from '../../../shared/context/AppContext.jsx';
import { SETORES, LICENCAS_SUGERIDAS_POR_CARGO, getSetorById } from '../../../shared/data/organizacao.js';
import { LICENCAS_M365 } from '../../../shared/data/licencas.js';
import { gerarEmailCorporativo } from '../../../shared/utils/email.js';

const LICENSES = LICENCAS_M365;

const STEPS = [
  { id: 'validar', label: 'Validar dados do funcionário' },
  { id: 'conta', label: 'Criar conta no Azure AD' },
  { id: 'licencas', label: 'Atribuir licenças do Microsoft 365' },
  { id: 'acessos', label: 'Vincular acessos do setor (SharePoint, e-mails compartilhados)' },
  { id: 'credenciais', label: 'Enviar credenciais por e-mail' },
  { id: 'notificar', label: 'Notificar gestor responsável' },
];

export default function AutomacaoRH() {
  const { startAutomation, finishAutomation } = useAppContext();

  const [nome, setNome] = useState('');
  const [setorId, setSetorId] = useState('');
  const [cargo, setCargo] = useState('');
  const [gestor, setGestor] = useState('');
  const [licenses, setLicenses] = useState(() =>
    Object.fromEntries(LICENSES.map((l) => [l.id, false]))
  );

  const [status, setStatus] = useState('idle'); // idle | running | done
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [resumo, setResumo] = useState(null); // snapshot dos dados no momento do envio
  const timers = useRef([]);

  const setor = useMemo(() => getSetorById(setorId), [setorId]);
  const emailPreview = useMemo(
    () => gerarEmailCorporativo(nome, setor?.dominio),
    [nome, setor]
  );

  // Ao trocar de setor, os cargos/gestores disponíveis mudam — evita
  // deixar selecionado um cargo ou gestor que não pertence ao novo setor.
  useEffect(() => {
    setCargo('');
    setGestor('');
  }, [setorId]);

  // Ao trocar de cargo, pré-marca as licenças sugeridas para esse cargo.
  // O usuário ainda pode ligar/desligar qualquer uma manualmente depois.
  useEffect(() => {
    const sugeridas = LICENCAS_SUGERIDAS_POR_CARGO[cargo] ?? [];
    setLicenses(
      Object.fromEntries(LICENSES.map((l) => [l.id, sugeridas.includes(l.id)]))
    );
  }, [cargo]);

  const toggleLicense = (id) =>
    setLicenses((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectedLicenseLabels = LICENSES.filter((l) => licenses[l.id]).map((l) => l.label);
  const selectedLicensesCount = selectedLicenseLabels.length;

  const canSubmit =
    nome.trim().length > 1 && setorId && cargo && gestor && selectedLicensesCount > 0 && status !== 'running';

  const runAutomation = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Guarda uma "foto" dos dados no momento do envio, para o resumo final
    // não mudar caso a pessoa continue mexendo no formulário durante a execução.
    setResumo({
      nome: nome.trim(),
      email: emailPreview,
      cargo,
      setorNome: setor.nome,
      gestor,
      licencasSelecionadas: selectedLicenseLabels,
      acessosAutomaticos: setor.acessosAutomaticos,
    });

    setStatus('running');
    setCurrentStepIndex(0);
    startAutomation();

    STEPS.forEach((_, index) => {
      const t = setTimeout(() => {
        if (index === STEPS.length - 1) {
          setStatus('done');
          setCurrentStepIndex(STEPS.length);
          finishAutomation();
        } else {
          setCurrentStepIndex(index + 1);
        }
      }, (index + 1) * 800);
      timers.current.push(t);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    runAutomation();
  };

  const handleNovoOnboarding = () => {
    setNome('');
    setSetorId('');
    setStatus('idle');
    setCurrentStepIndex(-1);
    setResumo(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink2">Automação de RH</h1>
        <p className="text-sm text-muted mt-0.5">
          Onboarding automatizado de contas no Microsoft 365.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 bg-surface border border-border rounded-xl p-5 shadow-card flex flex-col gap-5"
        >
          <p className="font-display text-sm font-semibold text-ink2">Novo Colaborador</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome" className="text-[13px] font-medium text-ink2">
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Maria Fernanda Costa"
                disabled={status === 'running'}
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink2 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-canvas disabled:text-muted"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="setor" className="text-[13px] font-medium text-ink2">
                Setor
              </label>
              <select
                id="setor"
                value={setorId}
                onChange={(e) => setSetorId(e.target.value)}
                disabled={status === 'running'}
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-canvas disabled:text-muted"
              >
                <option value="">Selecione um setor</option>
                {SETORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cargo" className="text-[13px] font-medium text-ink2">
                Cargo
              </label>
              <select
                id="cargo"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                disabled={!setor || status === 'running'}
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-canvas disabled:text-muted"
              >
                <option value="">{setor ? 'Selecione um cargo' : 'Selecione o setor primeiro'}</option>
                {setor?.cargos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="gestor" className="text-[13px] font-medium text-ink2">
                Gestor responsável
              </label>
              <select
                id="gestor"
                value={gestor}
                onChange={(e) => setGestor(e.target.value)}
                disabled={!setor || status === 'running'}
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-canvas disabled:text-muted"
              >
                <option value="">{setor ? 'Selecione um gestor' : 'Selecione o setor primeiro'}</option>
                {setor?.gestores.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prévia do e-mail que será gerado */}
          <div className="flex items-center gap-2.5 rounded-lg bg-canvas border border-border px-3.5 py-2.5">
            <Mail size={16} className="text-muted shrink-0" />
            <p className="text-[13px] text-muted min-w-0 truncate">
              {emailPreview ? (
                <>
                  E-mail que será criado:{' '}
                  <span className="text-ink2 font-medium">{emailPreview}</span>
                </>
              ) : (
                'Preencha o nome e o setor para ver o e-mail que será gerado.'
              )}
            </p>
          </div>

          {/* Acessos automáticos do setor */}
          {setor && (
            <div className="rounded-lg border border-border px-3.5 py-3">
              <p className="text-[13px] font-medium text-ink2 mb-2">
                Acessos vinculados automaticamente ao setor {setor.nome}
              </p>
              <ul className="flex flex-col gap-1">
                {setor.acessosAutomaticos.map((a) => (
                  <li key={a.nome} className="text-[13px] text-muted flex items-center gap-1.5">
                    <span className="text-[11px] uppercase w-[132px] shrink-0 text-muted/70">
                      {a.tipo}
                    </span>
                    {a.nome}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-muted/70 mt-2">
                Esses acessos são padrão do setor e não precisam ser selecionados manualmente.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-ink2">Licenças do Microsoft 365</p>
              <span className="text-[12px] text-muted">{selectedLicensesCount} selecionada(s)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LICENSES.map((license) => (
                <ToggleSwitch
                  key={license.id}
                  label={license.label}
                  description={license.description}
                  icon={license.icon}
                  checked={licenses[license.id]}
                  onChange={() => toggleLicense(license.id)}
                  suggested={(LICENCAS_SUGERIDAS_POR_CARGO[cargo] ?? []).includes(license.id)}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="self-start mt-1 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'running' ? 'Provisionando conta...' : 'Iniciar onboarding'}
          </button>
        </form>

        {/* Status de integração + resumo final */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <IntegrationStatus steps={STEPS} status={status} currentStepIndex={currentStepIndex} />

          {status === 'done' && resumo && (
            <>
              <OnboardingSummary {...resumo} />
              <button
                type="button"
                onClick={handleNovoOnboarding}
                className="self-start text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Iniciar novo onboarding
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
