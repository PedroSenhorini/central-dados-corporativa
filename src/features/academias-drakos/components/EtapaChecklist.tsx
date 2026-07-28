import type { Control } from 'react-hook-form';
import type { VisitaSchema } from '../schemas/visitaSchema.js';
import type { CategoriaEtapa } from '../types.js';
import { ChecklistSection } from './ChecklistSection.js';
import { TrocasSection } from './TrocasSection.js';

interface EtapaChecklistProps {
  control: Control<VisitaSchema>;
  categoria: CategoriaEtapa;
}

export function EtapaChecklist({ control, categoria }: EtapaChecklistProps) {
  return (
    <div className="flex flex-col gap-4">
      <ChecklistSection control={control} categoria={categoria} />
      <TrocasSection control={control} categoria={categoria} />
    </div>
  );
}
