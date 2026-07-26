import { useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Siren } from 'lucide-react';
import { visitaSchema, type VisitaSchema } from '../schemas/visitaSchema.js';
import { criarChecklistPadrao } from '../data/checklistPadrao.js';
import { ChecklistSection } from '../components/ChecklistSection.js';
import { TrocasSection } from '../components/TrocasSection.js';
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

export default function AcademiasDrakosPage() {
  const [enviado, setEnviado] = useState(false);

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

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Academias Drakos</p>
        <h1 className="font-display text-xl font-semibold text-ink2">Nova visita técnica</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

        <ChecklistSection control={control} />
        <TrocasSection control={control} />

        <ResumoAntesDeAssinar control={control} />
        <AssinaturaSection control={control} />

        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="rounded-lg bg-emerald-600 py-3 text-center font-semibold text-white active:bg-emerald-700"
        >
          Finalizar visita
        </button>
      </form>
    </div>
  );
}
