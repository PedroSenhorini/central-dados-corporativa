import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureFieldProps {
  value: string | null;
  onChange: (assinaturaBase64: string | null) => void;
}

export function SignatureField({ value, onChange }: SignatureFieldProps) {
  const padRef = useRef<SignatureCanvas>(null);

  function handleEnd() {
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) return;
    onChange(pad.getCanvas().toDataURL('image/png'));
  }

  function handleLimpar() {
    padRef.current?.clear();
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
        <SignatureCanvas
          ref={padRef}
          penColor="#0f172a"
          canvasProps={{ className: 'h-48 w-full touch-none' }}
          onEnd={handleEnd}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={value ? 'text-xs text-emerald-600' : 'text-xs text-slate-400'}>
          {value ? 'Assinatura capturada' : 'Aguardando assinatura'}
        </span>
        <button type="button" onClick={handleLimpar} className="text-sm text-red-600 underline">
          Limpar
        </button>
      </div>
    </div>
  );
}
