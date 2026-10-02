interface TabsProps<T extends string> {
  opcoes: { id: T; label: string }[];
  valor: T;
  onChange: (id: T) => void;
  rotulo: string;
}

/** Controle segmentado usado para filtros de categoria nas páginas. */
export default function Tabs<T extends string>({ opcoes, valor, onChange, rotulo }: TabsProps<T>) {
  return (
    <div
      className="flex flex-wrap gap-1 self-start rounded-lg border border-border bg-surface p-1"
      role="tablist"
      aria-label={rotulo}
    >
      {opcoes.map((opcao) => (
        <button
          key={opcao.id}
          type="button"
          role="tab"
          aria-selected={opcao.id === valor}
          onClick={() => onChange(opcao.id)}
          className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
            opcao.id === valor ? 'bg-ink2 text-white' : 'text-muted hover:text-ink2 hover:bg-canvas'
          }`}
        >
          {opcao.label}
        </button>
      ))}
    </div>
  );
}
