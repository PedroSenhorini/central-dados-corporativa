import type { ItemChecklist } from '../types.js';

const ITENS_PADRAO: { id: string; titulo: string }[] = [
  { id: 'rack', titulo: 'Rack' },
  { id: 'mouse', titulo: 'Mouse' },
  { id: 'teclado', titulo: 'Teclado' },
  { id: 'computadores', titulo: 'Computadores e monitores' },
  { id: 'aps', titulo: 'Access Points (APs)' },
  { id: 'cabos-rede', titulo: 'Cabos de rede' },
  { id: 'cameras', titulo: 'Câmeras' },
  { id: 'internet', titulo: 'Internet' },
];

export function criarChecklistPadrao(): ItemChecklist[] {
  return ITENS_PADRAO.map((item) => ({
    id: item.id,
    titulo: item.titulo,
    status: null,
    urgente: false,
    precisaSupervisor: false,
    observacao: '',
    fotos: [],
  }));
}
