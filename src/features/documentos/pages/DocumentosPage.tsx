import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Download, FileText, Loader2, Search, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client.js';
import { useAuth } from '../../../shared/context/AuthContext.js';
import PageHeader from '../../../shared/components/PageHeader.js';
import Modal from '../../../shared/components/Modal.js';
import Tabs from '../../../shared/components/Tabs.js';
import { btnPrimario, btnSecundario, inputClass, labelClass, painelClass } from '../../../shared/styles/classes.js';
import { podeGerenciarDocumentos } from '../../../shared/utils/permissoes.js';
import { formatarData, formatarTamanho } from '../../../shared/utils/formatacao.js';
import type { CategoriaDocumento, DocumentoRow } from '../../../shared/types/database.js';

const BUCKET = 'documentos';
const TAMANHO_MAXIMO = 20 * 1024 * 1024;

const CATEGORIAS: { id: CategoriaDocumento; label: string }[] = [
  { id: 'politica', label: 'Políticas' },
  { id: 'manual', label: 'Manuais' },
  { id: 'procedimento', label: 'Procedimentos (POP)' },
  { id: 'modelo', label: 'Modelos' },
  { id: 'outro', label: 'Outros' },
];
const nomeCategoria = (id: CategoriaDocumento) => CATEGORIAS.find((c) => c.id === id)?.label ?? 'Outros';
const extensao = (nome: string) => (nome.includes('.') ? nome.split('.').pop()!.toUpperCase().slice(0, 4) : 'ARQ');

function EnviarDocumentoModal({ onFechar, onEnviar }: { onFechar: () => void; onEnviar: (dados: { titulo: string; descricao: string; categoria: CategoriaDocumento; arquivo: File }) => Promise<string | null> }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDocumento>('politica');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!arquivo || titulo.trim().length < 2) return;
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro('O arquivo passa de 20 MB. Envie uma versão menor ou compactada.');
      return;
    }
    setEnviando(true);
    setErro('');
    const falha = await onEnviar({ titulo: titulo.trim(), descricao: descricao.trim(), categoria, arquivo });
    setEnviando(false);
    if (falha) setErro(falha);
  };

  return (
    <Modal titulo="Enviar documento" onFechar={onFechar}>
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="doc-arquivo" className={labelClass}>Arquivo</label>
          <input
            id="doc-arquivo"
            type="file"
            className="text-[13px] text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-ink2"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setArquivo(f);
              if (f && !titulo) setTitulo(f.name.replace(/\.[^.]+$/, ''));
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="doc-titulo" className={labelClass}>Título</label>
          <input id="doc-titulo" className={inputClass} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Manual do colaborador" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="doc-categoria" className={labelClass}>Categoria</label>
          <select id="doc-categoria" className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaDocumento)}>
            {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="doc-descricao" className={labelClass}>Descrição <span className="text-muted font-normal">(opcional)</span></label>
          <input id="doc-descricao" className={inputClass} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: versão 4, vale a partir de novembro" />
        </div>
        {erro && <p className="flex items-start gap-2 text-[13px] text-red-600"><AlertCircle size={14} className="mt-0.5 shrink-0" />{erro}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btnSecundario} onClick={onFechar}>Cancelar</button>
          <button type="submit" className={btnPrimario} disabled={!arquivo || titulo.trim().length < 2 || enviando}>
            {enviando ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}Enviar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function DocumentosPage() {
  const { user, profile } = useAuth();
  const podeGerenciar = podeGerenciarDocumentos(profile?.papel);

  const [documentos, setDocumentos] = useState<DocumentoRow[]>([]);
  const [categoria, setCategoria] = useState<CategoriaDocumento | 'todos'>('todos');
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [baixando, setBaixando] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from('documentos').select('*').order('created_at', { ascending: false });
    if (error) setErro('Não foi possível carregar os documentos. Confirme se a migration 20261002_modulos_intranet.sql foi aplicada no Supabase.');
    else setDocumentos(data ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return documentos.filter(
      (d) =>
        (categoria === 'todos' || d.categoria === categoria) &&
        (!termo || `${d.titulo} ${d.descricao ?? ''}`.toLowerCase().includes(termo))
    );
  }, [documentos, categoria, busca]);

  const enviar = async ({ titulo, descricao, categoria: cat, arquivo }: { titulo: string; descricao: string; categoria: CategoriaDocumento; arquivo: File }) => {
    if (!user) return 'Sessão expirada. Entre novamente.';
    const nomeSeguro = arquivo.name.normalize('NFD').replace(/[^\w.-]+/g, '_');
    const caminho = `${cat}/${crypto.randomUUID()}-${nomeSeguro}`;
    const upload = await supabase.storage.from(BUCKET).upload(caminho, arquivo);
    if (upload.error) return 'Não foi possível enviar o arquivo. Verifique se sua área pode publicar documentos.';
    const { error } = await supabase.from('documentos').insert({
      titulo,
      descricao: descricao || null,
      categoria: cat,
      arquivo_path: caminho,
      arquivo_nome: arquivo.name,
      tamanho_bytes: arquivo.size,
      autor_id: user.id,
    });
    if (error) {
      await supabase.storage.from(BUCKET).remove([caminho]);
      return 'O arquivo subiu, mas não foi possível registrar o documento. Tente de novo.';
    }
    setModalAberto(false);
    carregar();
    return null;
  };

  const baixar = async (doc: DocumentoRow) => {
    setBaixando(doc.id);
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.arquivo_path, 60, { download: doc.arquivo_nome });
    setBaixando(null);
    if (error || !data) {
      setErro('Não foi possível gerar o link de download. Tente de novo.');
      return;
    }
    window.location.assign(data.signedUrl);
  };

  const excluir = async (doc: DocumentoRow) => {
    setDocumentos((prev) => prev.filter((d) => d.id !== doc.id));
    const { error } = await supabase.from('documentos').delete().eq('id', doc.id);
    if (error) {
      carregar();
      return;
    }
    await supabase.storage.from(BUCKET).remove([doc.arquivo_path]);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Documentos"
        descricao="Políticas, manuais e procedimentos sempre na versão mais recente."
        acoes={
          podeGerenciar && (
            <button type="button" className={btnPrimario} onClick={() => setModalAberto(true)}>
              <Upload size={14} /> Enviar documento
            </button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input type="search" aria-label="Buscar documentos" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar documento" className={`${inputClass} pl-9`} />
        </div>
        <Tabs rotulo="Categoria" valor={categoria} onChange={setCategoria} opcoes={[{ id: 'todos', label: 'Todos' }, ...CATEGORIAS]} />
      </div>

      {erro && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />{erro}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 text-muted py-20"><Loader2 size={18} className="animate-spin" /> Carregando documentos...</div>
      ) : visiveis.length === 0 ? (
        <div className={`${painelClass} p-10 flex flex-col items-center text-center gap-2`}>
          <FileText size={20} className="text-muted" />
          <p className="text-sm font-medium text-ink2">Nenhum documento encontrado</p>
          <p className="text-[13px] text-muted">
            {podeGerenciar ? 'Envie políticas, manuais e modelos para toda a empresa.' : 'Os documentos publicados pelo RH e pela TI aparecem aqui.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {visiveis.map((doc) => (
            <li key={doc.id} className={`${painelClass} p-4 flex items-start gap-3`}>
              <span className="w-9 h-11 rounded-md border border-border bg-canvas flex items-end justify-center pb-1.5 text-[9px] font-bold text-muted shrink-0">
                {extensao(doc.arquivo_nome)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink2 truncate">{doc.titulo}</p>
                <p className="text-[12px] text-muted mt-0.5 truncate">
                  {nomeCategoria(doc.categoria)} · {formatarData(doc.created_at)}
                  {doc.tamanho_bytes ? ` · ${formatarTamanho(doc.tamanho_bytes)}` : ''}
                </p>
                {doc.descricao && <p className="text-[12px] text-muted mt-1 line-clamp-2">{doc.descricao}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button type="button" className={btnSecundario} onClick={() => baixar(doc)} disabled={baixando === doc.id}>
                    {baixando === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}Baixar
                  </button>
                  {podeGerenciar &&
                    (confirmandoExclusao === doc.id ? (
                      <button type="button" className={`${btnSecundario} text-red-600 border-red-200`} onClick={() => excluir(doc)}>
                        <Trash2 size={14} /> Confirmar exclusão
                      </button>
                    ) : (
                      <button type="button" className={btnSecundario} onClick={() => setConfirmandoExclusao(doc.id)} aria-label={`Excluir ${doc.titulo}`}>
                        <Trash2 size={14} />
                      </button>
                    ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalAberto && <EnviarDocumentoModal onFechar={() => setModalAberto(false)} onEnviar={enviar} />}
    </div>
  );
}
