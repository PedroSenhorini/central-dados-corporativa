import type { CategoriaEtapa, ItemChecklist } from '../types.js';

const ITENS_PADRAO: { id: string; titulo: string; categoria: CategoriaEtapa }[] = [
  { id: 'rack', titulo: 'Rack', categoria: 'rede' },
  { id: 'cabos-rede', titulo: 'Cabos de rede', categoria: 'rede' },
  { id: 'aps', titulo: 'Access Points (APs)', categoria: 'rede' },
  { id: 'internet', titulo: 'Internet', categoria: 'rede' },
  { id: 'mouse', titulo: 'Mouse', categoria: 'perifericos' },
  { id: 'teclado', titulo: 'Teclado', categoria: 'perifericos' },
  { id: 'computadores', titulo: 'Computadores e monitores', categoria: 'computadores' },
  { id: 'cameras', titulo: 'Câmeras', categoria: 'cameras' },
];

export function criarChecklistPadrao(): ItemChecklist[] {
  return ITENS_PADRAO.map((item) => ({
    id: item.id,
    titulo: item.titulo,
    categoria: item.categoria,
    status: null,
    urgente: false,
    precisaSupervisor: false,
    observacao: '',
    fotos: [],
  }));
}
