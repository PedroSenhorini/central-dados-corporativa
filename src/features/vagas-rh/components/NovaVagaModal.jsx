import { useState } from 'react';
import { X } from 'lucide-react';
import { SETORES_VAGA, PRIORIDADES } from '../data/constants.js';

const inputClass =
  'rounded-lg border border-border px-3 py-2 text-sm text-ink2 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

export default function NovaVagaModal({ perfis, responsaveisRh, perfilAtualId, onFechar, onCriar }) {
  const [titulo, setTitulo] = useState('');
  const [setorArea, setSetorArea] = useState('');
  const [gestorId, setGestorId] = useState('');
  const [responsavelId, setResponsavelId] = useState(perfilAtualId ?? '');
  const [prioridade, setPrioridade] = useState('media');
  const [prazoSlaDias, setPrazoSlaDias] = useState(30);
  const [salvando, setSalvando] = useState(false);

  const podeSalvar = titulo.trim().length > 1 && setorArea && gestorId && prazoSlaDias > 0 && !salvando;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!podeSalvar) return;
    setSalvando(true);
    await onCriar({
      titulo: titulo.trim(),
      setor_area: setorArea,
      gestor_solicitante_id: gestorId,
      responsavel_rh_id: responsavelId || null,
      prioridade,
      prazo_sla_dias: Number(prazoSlaDias),
    });
    setSalvando(false);
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl shadow-card w-full max-w-md p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-ink2">Nova vaga</p>
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
            <label htmlFor="titulo" className="text-[13px] font-medium text-ink2">
              Título da vaga
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Analista de Dados Pleno"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="setor" className="text-[13px] font-medium text-ink2">
                Área
              </label>
              <select
                id="setor"
                value={setorArea}
                onChange={(e) => setSetorArea(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Selecione</option>
                {SETORES_VAGA.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="prioridade" className="text-[13px] font-medium text-ink2">
                Prioridade
              </label>
              <select
                id="prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="gestor" className="text-[13px] font-medium text-ink2">
              Gestor solicitante
            </label>
            <select
              id="gestor"
              value={gestorId}
              onChange={(e) => setGestorId(e.target.value)}
              className={`${inputClass} bg-white`}
            >
              <option value="">Selecione</option>
              {perfis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="responsavel" className="text-[13px] font-medium text-ink2">
                Responsável (RH)
              </label>
              <select
                id="responsavel"
                value={responsavelId}
                onChange={(e) => setResponsavelId(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Sem responsável</option>
                {responsaveisRh.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sla" className="text-[13px] font-medium text-ink2">
                Prazo de SLA (dias)
              </label>
              <input
                id="sla"
                type="number"
                min={1}
                value={prazoSlaDias}
                onChange={(e) => setPrazoSlaDias(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!podeSalvar}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {salvando ? 'Criando...' : 'Criar vaga'}
          </button>
        </form>
      </div>
    </div>
  );
}
