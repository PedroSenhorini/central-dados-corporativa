import { Controller, useFieldArray, type Control } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import type { VisitaSchema } from '../schemas/visitaSchema.js';
import type { CategoriaEtapa } from '../types.js';
import { ImageInput } from './ImageInput.js';
import { gerarId } from '../utils/id.js';

interface TrocasSectionProps {
  control: Control<VisitaSchema>;
  categoria: CategoriaEtapa;
}

export function TrocasSection({ control, categoria }: TrocasSectionProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'trocas' });

  const trocasDaEtapa = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.categoria === categoria);

  function handleAdicionarTroca() {
    append({
      id: gerarId(),
      categoria,
      equipamento: '',
      motivo: '',
      numeroSerieAntigo: '',
      numeroSerieNovo: '',
      fotoAntes: null as unknown as File,
      fotoDepois: null as unknown as File,
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">Equipamentos trocados</h2>
        <button
          type="button"
          onClick={handleAdicionarTroca}
          className="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white"
        >
          <Plus size={16} /> Troca
        </button>
      </div>

      {trocasDaEtapa.length === 0 && (
        <p className="text-sm text-slate-400">Nenhuma troca registrada nessa etapa.</p>
      )}

      {trocasDaEtapa.map(({ field, index }, ordem) => (
        <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Troca {ordem + 1}</span>
            <button type="button" onClick={() => remove(index)} className="text-red-500">
              <Trash2 size={16} />
            </button>
          </div>

          <Controller
            control={control}
            name={`trocas.${index}.equipamento`}
            render={({ field: eqField }) => (
              <input
                {...eqField}
                placeholder="Equipamento (ex: Switch 8 portas)"
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
              />
            )}
          />

          <Controller
            control={control}
            name={`trocas.${index}.motivo`}
            render={({ field: motivoField }) => (
              <input
                {...motivoField}
                placeholder="Motivo da troca"
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
              />
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name={`trocas.${index}.numeroSerieAntigo`}
              render={({ field: serieField }) => (
                <input
                  {...serieField}
                  placeholder="Nº série (antigo)"
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                />
              )}
            />
            <Controller
              control={control}
              name={`trocas.${index}.numeroSerieNovo`}
              render={({ field: serieField }) => (
                <input
                  {...serieField}
                  placeholder="Nº série (novo)"
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name={`trocas.${index}.fotoAntes`}
              render={({ field: antesField }) => (
                <ImageInput label="Antes" value={antesField.value} onChange={antesField.onChange} />
              )}
            />
            <Controller
              control={control}
              name={`trocas.${index}.fotoDepois`}
              render={({ field: depoisField }) => (
                <ImageInput label="Depois" value={depoisField.value} onChange={depoisField.onChange} />
              )}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
