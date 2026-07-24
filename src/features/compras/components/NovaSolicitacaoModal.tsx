import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { CATEGORIAS_COMPRA, URGENCIAS_COMPRA } from '../data/constants.js';
import type { CategoriaCompra, UrgenciaCompra } from '../../../shared/types/database.js';

export interface NovaSolicitacaoInput {
  item: string;
  categoria: CategoriaCompra;
  descricao: string | null;
  quantidade: number;
  valor_estimado: number | null;
  urgencia: UrgenciaCompra;
  justificativa: string | null;
  fornecedor_sugerido: string | null;
  data_necessidade: string | null;
}

interface NovaSolicitacaoModalProps {
  onFechar: () => void;
  onCriar: (novaSolicitacao: NovaSolicitacaoInput) => Promise<void>;
}

const inputClass =
  'rounded-lg border border-border px-3 py-2 text-sm text-ink2 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

export default function NovaSolicitacaoModal({ onFechar, onCriar }: NovaSolicitacaoModalProps) {
  const [item, setItem] = useState('');
  const [categoria, setCategoria] = useState<CategoriaCompra>('material');
  const [quantidade, setQuantidade] = useState(1);
  const [valorEstimado, setValorEstimado] = useState('');
  const [urgencia, setUrgencia] = useState<UrgenciaCompra>('media');
  const [dataNecessidade, setDataNecessidade] = useState('');
  const [fornecedorSugerido, setFornecedorSugerido] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const podeSalvar = Boolean(item.trim().length > 1 && Number(quantidade) > 0 && !salvando);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!podeSalvar) return;
    setSalvando(true);
    await onCriar({
      item: item.trim(),
      categoria,
      descricao: descricao.trim() || null,
      quantidade: Number(quantidade),
      valor_estimado: valorEstimado ? Number(valorEstimado) : null,
      urgencia,
      justificativa: justificativa.trim() || null,
      fornecedor_sugerido: fornecedorSugerido.trim() || null,
      data_necessidade: dataNecessidade || null,
    });
    setSalvando(false);
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl shadow-card w-full max-w-md p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto scroll-slim">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-ink2">Nova solicitação de compra</p>
          <button
            type="button"
            onClick={onFechar}
            className="p-1 rounded-md text-muted hover:text-ink2 hover:bg-canvas transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="item" className="text-[13px] font-medium text-ink2">
              Produto ou equipamento
            </label>
            <input
              id="item"
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Ex.: Notebook para novo colaborador"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoria" className="text-[13px] font-medium text-ink2">
                Categoria
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaCompra)}
                className={`${inputClass} bg-white`}
              >
                {CATEGORIAS_COMPRA.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="urgencia" className="text-[13px] font-medium text-ink2">
                Urgência
              </label>
              <select
                id="urgencia"
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value as UrgenciaCompra)}
                className={`${inputClass} bg-white`}
              >
                {URGENCIAS_COMPRA.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="quantidade" className="text-[13px] font-medium text-ink2">
                Quantidade
              </label>
              <input
                id="quantidade"
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="valor" className="text-[13px] font-medium text-ink2">
                Valor estimado (R$)
              </label>
              <input
                id="valor"
                type="number"
                min={0}
                step="0.01"
                value={valorEstimado}
                onChange={(e) => setValorEstimado(e.target.value)}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dataNecessidade" className="text-[13px] font-medium text-ink2">
                Necessário até
              </label>
              <input
                id="dataNecessidade"
                type="date"
                value={dataNecessidade}
                onChange={(e) => setDataNecessidade(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fornecedor" className="text-[13px] font-medium text-ink2">
                Fornecedor sugerido
              </label>
              <input
                id="fornecedor"
                type="text"
                value={fornecedorSugerido}
                onChange={(e) => setFornecedorSugerido(e.target.value)}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="descricao" className="text-[13px] font-medium text-ink2">
              Descrição / especificações
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Modelo, marca, características desejadas..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="justificativa" className="text-[13px] font-medium text-ink2">
              Justificativa
            </label>
            <textarea
              id="justificativa"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Por que essa compra é necessária?"
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={!podeSalvar}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {salvando ? 'Enviando...' : 'Enviar solicitação'}
          </button>
        </form>
      </div>
    </div>
  );
}
