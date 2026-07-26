import { useState } from 'react';
import { Controller, type Control } from 'react-hook-form';
import {
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Circle,
  ChevronDown,
  Siren,
  UserCheck,
} from 'lucide-react';
import type { VisitaSchema } from '../schemas/visitaSchema.js';
import type { StatusItem } from '../types.js';
import { StatusToggle } from './StatusToggle.js';
import { FotoListInput } from './FotoListInput.js';
import { iconeDoItem } from '../data/iconesChecklist.js';

interface ChecklistItemCardProps {
  control: Control<VisitaSchema>;
  index: number;
  itemId: string;
  titulo: string;
}

function IconeStatus({ status }: { status: StatusItem | null }) {
  if (status === 'ok') return <CheckCircle2 size={20} className="text-emerald-500" />;
  if (status === 'atencao') return <AlertTriangle size={20} className="text-amber-500" />;
  if (status === 'nao_aplica') return <MinusCircle size={20} className="text-slate-400" />;
  return <Circle size={20} className="text-slate-300" />;
}

export function ChecklistItemCard({ control, index, itemId, titulo }: ChecklistItemCardProps) {
  const [aberto, setAberto] = useState(false);
  const Icone = iconeDoItem(itemId);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icone size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-800">{titulo}</span>
          <Controller
            control={control}
            name={`checklistGeral.${index}.status`}
            render={({ field }) => (
              <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <IconeStatus status={field.value} />
                {field.value === 'ok' && 'Validado'}
                {field.value === 'atencao' && 'Precisa de atenção'}
                {field.value === 'nao_aplica' && 'Não se aplica'}
                {!field.value && 'Ainda não validado'}
              </span>
            )}
          />
        </span>

        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="flex flex-col gap-3 border-t border-slate-100 p-4 pt-3">
          <Controller
            control={control}
            name={`checklistGeral.${index}.status`}
            render={({ field }) => <StatusToggle value={field.value} onChange={field.onChange} />}
          />

          <div className="flex flex-wrap gap-2">
            <Controller
              control={control}
              name={`checklistGeral.${index}.urgente`}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    field.value
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-slate-300 text-slate-500'
                  }`}
                >
                  <Siren size={14} />
                  Urgência extrema
                </button>
              )}
            />

            <Controller
              control={control}
              name={`checklistGeral.${index}.precisaSupervisor`}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    field.value
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-slate-300 text-slate-500'
                  }`}
                >
                  <UserCheck size={14} />
                  Pedir validação do supervisor
                </button>
              )}
            />
          </div>

          <Controller
            control={control}
            name={`checklistGeral.${index}.observacao`}
            render={({ field }) => (
              <textarea
                {...field}
                placeholder="O que foi validado aqui?"
                rows={2}
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
              />
            )}
          />

          <Controller
            control={control}
            name={`checklistGeral.${index}.fotos`}
            render={({ field }) => (
              <FotoListInput label="Fotos" fotos={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      )}
    </div>
  );
}
