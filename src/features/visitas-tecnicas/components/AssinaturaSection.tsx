import { Controller, type Control } from 'react-hook-form';
import type { VisitaSchema } from '../schemas/visitaSchema.js';
import { SignatureField } from './SignatureField.js';

interface AssinaturaSectionProps {
  control: Control<VisitaSchema>;
}

export function AssinaturaSection({ control }: AssinaturaSectionProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Assinatura do responsável</h2>
        <p className="text-xs text-slate-400">
          Confirma que toda a vistoria foi validada, incluindo rede e internet.
        </p>
      </div>

      <Controller
        control={control}
        name="assinatura.gestorNome"
        render={({ field }) => (
          <input
            {...field}
            placeholder="Nome do gestor da academia"
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
        )}
      />

      <Controller
        control={control}
        name="assinatura.imagemBase64"
        render={({ field }) => <SignatureField value={field.value} onChange={field.onChange} />}
      />
    </section>
  );
}
