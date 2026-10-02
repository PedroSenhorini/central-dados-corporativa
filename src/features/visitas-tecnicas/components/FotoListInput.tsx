import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Plus, X } from 'lucide-react';
import type { Foto } from '../types.js';
import { gerarId } from '../utils/id.js';

interface FotoListInputProps {
  label: string;
  fotos: Foto[];
  onChange: (fotos: Foto[]) => void;
}

function FotoThumb({ foto, onRemover }: { foto: Foto; onRemover: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(foto.arquivo);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [foto.arquivo]);

  return (
    <div className="relative shrink-0">
      {url && <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />}
      <button
        type="button"
        onClick={onRemover}
        className="absolute -right-1 -top-1 rounded-full bg-black/60 p-1 text-white"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function FotoListInput({ label, fotos, onChange }: FotoListInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdicionar(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    onChange([...fotos, { id: gerarId(), arquivo }]);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleRemover(id: string) {
    onChange(fotos.filter((foto) => foto.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {fotos.map((foto) => (
          <FotoThumb key={foto.id} foto={foto} onRemover={() => handleRemover(foto.id)} />
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400"
        >
          <Plus size={20} />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleAdicionar}
        className="hidden"
      />
    </div>
  );
}
