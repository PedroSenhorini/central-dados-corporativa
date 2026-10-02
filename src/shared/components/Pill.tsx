import type { ReactNode } from 'react';

export type TomPill = 'neutro' | 'azul' | 'verde' | 'ambar' | 'vermelho';

const TONS: Record<TomPill, string> = {
  neutro: 'bg-canvas text-muted ring-1 ring-inset ring-border',
  azul: 'bg-primary-soft text-primary',
  verde: 'bg-success/10 text-success',
  ambar: 'bg-amber-50 text-amber-700',
  vermelho: 'bg-red-50 text-red-600',
};

export default function Pill({ tom = 'neutro', children }: { tom?: TomPill; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${TONS[tom]}`}
    >
      {children}
    </span>
  );
}
