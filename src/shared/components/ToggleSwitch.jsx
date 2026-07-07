/**
 * Toggle switch acessível (botão de ativar/desativar).
 *
 * props:
 * - checked: boolean
 * - onChange: (next: boolean) => void
 * - label: string
 * - description?: string
 * - icon?: componente de ícone (lucide-react)
 * - suggested?: boolean -> mostra um selo "Sugerido" (ex: licença padrão do cargo)
 */
export default function ToggleSwitch({ checked, onChange, label, description, icon: Icon, suggested }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-3 cursor-pointer hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <span
            className={`flex items-center justify-center w-9 h-9 rounded-md shrink-0 transition-colors ${
              checked ? 'bg-accent-soft text-accent' : 'bg-canvas text-muted'
            }`}
          >
            <Icon size={16} />
          </span>
        )}
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="block text-sm font-medium text-ink2 truncate">{label}</span>
            {suggested && (
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-accent bg-accent-soft px-1.5 py-0.5 rounded-full">
                Sugerido
              </span>
            )}
          </span>
          {description && (
            <span className="block text-[12px] text-muted truncate">{description}</span>
          )}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
          checked ? 'bg-accent' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}
