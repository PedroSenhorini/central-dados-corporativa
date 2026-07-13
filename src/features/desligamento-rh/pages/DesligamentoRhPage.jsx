import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx';
import IntegrationStatus from '../../../shared/components/IntegrationStatus.jsx';
import DesligamentoSummary from '../components/DesligamentoSummary.jsx';
import { useAppContext } from '../../../shared/context/AppContext.jsx';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import { supabase } from '../../../shared/lib/supabase/client.js';
import { LICENCAS_M365 } from '../../../shared/data/licencas.js';
import { AREAS_DASHBOARD } from '../../analise-dados/data/dashboards.js';

const STEPS = [
  { id: 'confirmar', label: 'Confirmar desligamento do colaborador' },
  { id: 'licencas', label: 'Revogar licenças do Microsoft 365' },
  { id: 'acessos', label: 'Remover acessos do setor (SharePoint, e-mails compartilhados)' },
  { id: 'conta', label: 'Bloquear conta no Azure AD' },
  { id: 'painel', label: 'Bloquear acesso à Central de Dados' },
  { id: 'notificar', label: 'Notificar gestor responsável' },
];

function papelLabel(papel) {
  return AREAS_DASHBOARD.find((a) => a.id === papel)?.label ?? papel;
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export default function DesligamentoRH() {
  const { startAutomation, finishAutomation } = useAppContext();
  const { user } = useAuth();

  const [perfis, setPerfis] = useState([]);
  const [carregandoPerfis, setCarregandoPerfis] = useState(true);
  const [erroCarga, setErroCarga] = useState('');

  const [colaboradorId, setColaboradorId] = useState('');
  const [dataDesligamento, setDataDesligamento] = useState(hoje);
  const [licenses, setLicenses] = useState(() =>
    Object.fromEntries(LICENCAS_M365.map((l) => [l.id, true]))
  );

  const [status, setStatus] = useState('idle'); // idle | running | done
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [resumo, setResumo] = useState(null);
  const [erroExecucao, setErroExecucao] = useState('');
  const timers = useRef([]);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, nome, cargo, papel')
      .eq('ativo', true)
      .order('nome', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setErroCarga(
            'Não foi possível carregar a lista de colaboradores. Confirme se a versão mais recente do supabase/schema.sql foi aplicada (ela adiciona a coluna "ativo" e as permissões de RH).'
          );
        } else {
          setPerfis(data.filter((p) => p.id !== user?.id && p.papel !== 'admin'));
        }
        setCarregandoPerfis(false);
      });
  }, [user?.id]);

  const colaborador = useMemo(() => perfis.find((p) => p.id === colaboradorId), [perfis, colaboradorId]);

  const toggleLicense = (id) => setLicenses((prev) => ({ ...prev, [id]: !prev[id] }));
  const selectedLicenseLabels = LICENCAS_M365.filter((l) => licenses[l.id]).map((l) => l.label);

  const canSubmit = colaboradorId && dataDesligamento && status !== 'running';

  const runAutomation = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setResumo({
      nome: colaborador.nome,
      cargo: colaborador.cargo,
      papelLabel: papelLabel(colaborador.papel),
      dataDesligamento,
      licencasRevogadas: selectedLicenseLabels,
    });

    setErroExecucao('');
    setStatus('running');
    setCurrentStepIndex(0);
    startAutomation();

    STEPS.forEach((_, index) => {
      const t = setTimeout(async () => {
        if (index === STEPS.length - 1) {
          const { error } = await supabase
            .from('profiles')
            .update({ ativo: false, data_desligamento: dataDesligamento })
            .eq('id', colaboradorId);
          finishAutomation();
          if (error) {
            setErroExecucao(
              'As etapas foram simuladas, mas não foi possível bloquear o acesso no banco de dados. O colaborador ainda consegue acessar a Central de Dados.'
            );
            setStatus('idle');
            setCurrentStepIndex(-1);
          } else {
            setPerfis((prev) => prev.filter((p) => p.id !== colaboradorId));
            setStatus('done');
            setCurrentStepIndex(STEPS.length);
          }
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

  const handleNovoDesligamento = () => {
    setColaboradorId('');
    setDataDesligamento(hoje());
    setLicenses(Object.fromEntries(LICENCAS_M365.map((l) => [l.id, true])));
    setStatus('idle');
    setCurrentStepIndex(-1);
    setResumo(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink2">Desligamento de Colaborador</h1>
        <p className="text-sm text-muted mt-0.5">
          Revogação automática de licenças e bloqueio de acesso à Central de Dados.
        </p>
      </div>

      {erroCarga ? (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {erroCarga}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 bg-surface border border-border rounded-xl p-5 shadow-card flex flex-col gap-5"
          >
            <p className="font-display text-sm font-semibold text-ink2">Colaborador a desligar</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="colaborador" className="text-[13px] font-medium text-ink2">
                  Colaborador
                </label>
                <select
                  id="colaborador"
                  value={colaboradorId}
                  onChange={(e) => setColaboradorId(e.target.value)}
                  disabled={carregandoPerfis || status === 'running'}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-ink2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-canvas disabled:text-muted"
                >
                  <option value="">
                    {carregandoPerfis ? 'Carregando...' : 'Selecione um colaborador'}
                  </option>
                  {perfis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — {papelLabel(p.papel)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="dataDesligamento" className="text-[13px] font-medium text-ink2">
                  Data do desligamento
                </label>
                <input
                  id="dataDesligamento"
                  type="date"
                  value={dataDesligamento}
                  onChange={(e) => setDataDesligamento(e.target.value)}
                  disabled={status === 'running'}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-ink2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-canvas disabled:text-muted"
                />
              </div>
            </div>

            {erroExecucao && (
              <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2.5 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {erroExecucao}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-ink2">Licenças do Microsoft 365 a revogar</p>
                <span className="text-[12px] text-muted">{selectedLicenseLabels.length} selecionada(s)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LICENCAS_M365.map((license) => (
                  <ToggleSwitch
                    key={license.id}
                    label={license.label}
                    description={license.description}
                    icon={license.icon}
                    checked={licenses[license.id]}
                    onChange={() => toggleLicense(license.id)}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="self-start mt-1 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'running' ? 'Processando desligamento...' : 'Iniciar desligamento'}
            </button>
          </form>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {carregandoPerfis ? (
              <div className="flex items-center justify-center gap-2 text-muted py-16">
                <Loader2 size={18} className="animate-spin" />
                Carregando colaboradores...
              </div>
            ) : (
              status !== 'idle' && (
                <IntegrationStatus steps={STEPS} status={status} currentStepIndex={currentStepIndex} />
              )
            )}

            {status === 'done' && resumo && (
              <>
                <DesligamentoSummary {...resumo} />
                <button
                  type="button"
                  onClick={handleNovoDesligamento}
                  className="self-start text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Iniciar novo desligamento
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
