import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

const DESTAQUES = [
  'KPIs e indicadores de todas as áreas em um só lugar',
  'Onboarding de colaboradores automatizado no Microsoft 365',
  'Assistente com insights automáticos sobre os seus dados',
];

interface AuthLayoutProps {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}

export default function AuthLayout({ titulo, subtitulo, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Lado de marca — visível a partir de telas médias */}
      <div className="hidden lg:flex lg:w-[42%] bg-ink2 text-white flex-col justify-between p-10">
        <div>
          <p className="font-display font-semibold tracking-wide">CENTRAL DE DADOS</p>
          <p className="text-[11px] text-white/50">Painel Corporativo</p>
        </div>

        <div className="flex flex-col gap-5">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 text-white">
            <Sparkles size={20} />
          </span>
          <p className="text-[24px] leading-none font-semibold tracking-tight tabular-nums leading-snug">
            Todos os indicadores da sua empresa, em uma experiência só.
          </p>
          <ul className="flex flex-col gap-2.5">
            {DESTAQUES.map((texto) => (
              <li key={texto} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[12px] text-white/35">
          Feito para funcionar do jeito da sua empresa, do seu jeito.
        </p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <p className="font-display font-semibold text-ink2">CENTRAL DE DADOS</p>
            <p className="text-[11px] text-muted">Painel Corporativo</p>
          </div>

          <h1 className="text-[22px] font-semibold text-ink2">{titulo}</h1>
          {subtitulo && <p className="text-sm text-muted mt-1 mb-6">{subtitulo}</p>}

          {children}
        </div>
      </div>
    </div>
  );
}
