import { useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, ArrowRight, Siren } from 'lucide-react';
import { visitaSchema, type VisitaSchema } from '../schemas/visitaSchema.js';
import { criarChecklistPadrao } from '../data/checklistPadrao.js';
import { ETAPAS } from '../data/etapas.js';
import { EtapaChecklist } from '../components/EtapaChecklist.js';
import { AssinaturaSection } from '../components/AssinaturaSection.js';

const valoresIniciais: VisitaSchema = {
  tecnicoNome: '',
  academiaNome: '',
  dataVisita: new Date().toISOString().slice(0, 10),
  checklistGeral: criarChecklistPadrao(),
  trocas: [],
  assinatura: {
    gestorNome: '',
    imagemBase64: null,
  },
};

function ResumoAntesDeAssinar({ control }: { control: ReturnType<typeof useForm<VisitaSchema>>['control'] }) {
  const checklist = useWatch({ control, name: 'checklistGeral' });
  const urgentes = checklist.filter((item) => item.urgente).length;
  const pendentesSupervisor = checklist.filter((item) => item.precisaSupervisor).length;

  if (urgentes === 0 && pendentesSupervisor === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      {urgentes > 0 && (
        <p className="flex items-center gap-2">
          <Siren size={16} /> {urgentes} {urgentes === 1 ? 'item marcado' : 'itens marcados'} como urgência extrema.
        </p>
      )}
      {pendentesSupervisor > 0 && (
        <p className="flex items-center gap-2">
          <AlertTriangle size={16} /> {pendentesSupervisor}{' '}
          {pendentesSupervisor === 1 ? 'item pedindo' : 'itens pedindo'} validação do supervisor.
        </p>
      )}
    </div>
  );
}

function StepPills({ etapaAtual, onIrPara }: { etapaAtual: number; onIrPara: (indice: number) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {ETAPAS.map((etapa, indice) => {
        const Icone = etapa.icone;
        const ativa = indice === etapaAtual;
        const concluida = indice < etapaAtual;
        return (
          <button
            key={etapa.id}
            type="button"
            onClick={() => onIrPara(indice)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              ativa
                ? 'bg-ink text-white'
                : concluida
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Icone size={13} />
            {etapa.titulo}
          </button>
        );
      })}
    </div>
  );
}

export default function AcademiasDrakosPage() {
  const [enviado, setEnviado] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState(0);

  const { control, handleSubmit, formState, reset } = useForm<VisitaSchema>({
    resolver: zodResolver(visitaSchema),
    defaultValues: valoresIniciais,
  });

  function onSubmit(dados: VisitaSchema) {
    console.log('visita finalizada', dados);
    setEnviado(true);
  }

  function handleNovaVisita() {
    reset(valoresIniciais);
    setEtapaAtual(0);
    setEnviado(false);
  }

  if (enviado) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <h1 className="font-display text-xl font-semibold text-ink2">Visita registrada!</h1>
        <p className="text-sm text-muted">
          O envio pro backend ainda não existe, isso aqui é só o front por enquanto.
        </p>
        <button
          type="button"
          onClick={handleNovaVisita}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          Registrar outra visita
        </button>
      </div>
    );
  }

  const etapa = ETAPAS[etapaAtual];
  const ehUltimaEtapa = etapaAtual === ETAPAS.length - 1;
  const ehPrimeiraEtapa = etapaAtual === 0;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Academias Drakos</p>
        <h1 className="font-display text-xl font-semibold text-ink2">Nova visita técnica</h1>
      </div>

      <StepPills etapaAtual={etapaAtual} onIrPara={setEtapaAtual} />
      <p className="-mt-1 px-1 text-xs text-slate-400">
        Etapa {etapaAtual + 1} de {ETAPAS.length} · {etapa.titulo}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {etapa.id === 'intro' && (
          <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
            <Controller
              control={control}
              name="tecnicoNome"
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Seu nome"
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                />
              )}
            />
            <Controller
              control={control}
              name="academiaNome"
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Academia visitada"
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                />
              )}
            />
            <Controller
              control={control}
              name="dataVisita"
              render={({ field }) => (
                <input {...field} type="date" className="w-full rounded-md border border-slate-300 p-2 text-sm" />
              )}
            />
          </section>
        )}

        {etapa.categoria && <EtapaChecklist control={control} categoria={etapa.categoria} />}

        {etapa.id === 'assinatura' && (
          <>
            <ResumoAntesDeAssinar control={control} />
            <AssinaturaSection control={control} />
          </>
        )}

        <div className="flex gap-3">
          {!ehPrimeiraEtapa && (
            <button
              type="button"
              onClick={() => setEtapaAtual((v) => v - 1)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 py-3 text-sm font-medium text-slate-600"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          )}

          {!ehUltimaEtapa && (
            <button
              type="button"
              onClick={() => setEtapaAtual((v) => v + 1)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink py-3 text-sm font-medium text-white"
            >
              Avançar <ArrowRight size={16} />
            </button>
          )}

          {ehUltimaEtapa && (
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="flex-1 rounded-lg bg-emerald-600 py-3 text-center font-semibold text-white active:bg-emerald-700"
            >
              Finalizar visita
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
