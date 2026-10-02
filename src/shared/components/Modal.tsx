import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  largura?: 'md' | 'lg';
}

export default function Modal({ titulo, onFechar, children, largura = 'md' }: ModalProps) {
  useEffect(() => {
    const fecharNoEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', fecharNoEsc);
    return () => window.removeEventListener('keydown', fecharNoEsc);
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`bg-surface border border-border rounded-xl shadow-xl w-full ${
          largura === 'lg' ? 'max-w-xl' : 'max-w-md'
        } max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-ink2">{titulo}</p>
          <button
            type="button"
            onClick={onFechar}
            className="p-1 rounded-md text-muted hover:text-ink2 hover:bg-canvas transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto scroll-slim">{children}</div>
      </div>
    </div>
  );
}
