import { useFieldArray, useWatch, type Control } from 'react-hook-form';
import type { VisitaSchema } from '../schemas/visitaSchema.js';
import { ChecklistItemCard } from './ChecklistItemCard.js';

interface ChecklistSectionProps {
  control: Control<VisitaSchema>;
}

export function ChecklistSection({ control }: ChecklistSectionProps) {
  const { fields } = useFieldArray({ control, name: 'checklistGeral', keyName: 'rhfId' });
  const checklistAtual = useWatch({ control, name: 'checklistGeral' });

  const validados = checklistAtual.filter((item) => item.status !== null).length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-base font-semibold text-slate-800">Checklist da vistoria</h2>
        <span className="text-xs font-medium text-slate-400">
          {validados}/{fields.length} validados
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${fields.length ? (validados / fields.length) * 100 : 0}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <ChecklistItemCard key={field.rhfId} control={control} index={index} itemId={field.id} titulo={field.titulo} />
        ))}
      </div>
    </section>
  );
}
