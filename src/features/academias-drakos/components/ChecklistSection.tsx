import { useFieldArray, useWatch, type Control } from 'react-hook-form';
import type { VisitaSchema } from '../schemas/visitaSchema.js';
import type { CategoriaEtapa } from '../types.js';
import { ChecklistItemCard } from './ChecklistItemCard.js';

interface ChecklistSectionProps {
  control: Control<VisitaSchema>;
  categoria: CategoriaEtapa;
}

export function ChecklistSection({ control, categoria }: ChecklistSectionProps) {
  const { fields } = useFieldArray({ control, name: 'checklistGeral', keyName: 'rhfId' });
  const checklistAtual = useWatch({ control, name: 'checklistGeral' });

  const indicesDaEtapa = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.categoria === categoria);

  const validados = indicesDaEtapa.filter(({ index }) => checklistAtual[index]?.status !== null).length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-base font-semibold text-slate-800">Checklist</h2>
        <span className="text-xs font-medium text-slate-400">
          {validados}/{indicesDaEtapa.length} validados
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${indicesDaEtapa.length ? (validados / indicesDaEtapa.length) * 100 : 0}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {indicesDaEtapa.map(({ field, index }) => (
          <ChecklistItemCard key={field.rhfId} control={control} index={index} itemId={field.id} titulo={field.titulo} />
        ))}
      </div>
    </section>
  );
}
