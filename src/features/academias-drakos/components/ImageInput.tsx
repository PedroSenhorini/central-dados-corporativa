import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera, X } from 'lucide-react';

interface ImageInputProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

export function ImageInput({ label, value, onChange }: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  }

  function handleRemover() {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>

      {preview ? (
        <div className="relative">
          <img src={preview} alt={label} className="h-40 w-full rounded-lg object-cover" />
          <button
            type="button"
            onClick={handleRemover}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 active:bg-slate-50"
        >
          <Camera size={28} />
          <span className="text-xs">Toque para tirar foto</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
