import clsx from 'clsx';
import type { StatusItem } from '../types.js';

interface StatusToggleProps {
  value: StatusItem | null;
  onChange: (status: StatusItem) => void;
}

const opcoes: { valor: StatusItem; texto: string; corAtiva: string }[] = [
  { valor: 'ok', texto: 'OK', corAtiva: 'bg-emerald-500 text-white' },
  { valor: 'atencao', texto: 'Atenção', corAtiva: 'bg-amber-500 text-white' },
  { valor: 'nao_aplica', texto: 'N/A', corAtiva: 'bg-slate-400 text-white' },
];

export function StatusToggle({ value, onChange }: StatusToggleProps) {
  return (
    <div className="flex gap-2">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          onClick={() => onChange(opcao.valor)}
          className={clsx(
            'flex-1 rounded-md border border-slate-300 py-2 text-sm font-medium',
            value === opcao.valor ? opcao.corAtiva : 'bg-white text-slate-600'
          )}
        >
          {opcao.texto}
        </button>
      ))}
    </div>
  );
}
