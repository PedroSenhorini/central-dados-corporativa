export type StatusItem = 'ok' | 'atencao' | 'nao_aplica';

export type CategoriaEtapa = 'rede' | 'perifericos' | 'computadores' | 'cameras';

export interface Foto {
  id: string;
  arquivo: File;
  legenda?: string;
}

export interface ItemChecklist {
  id: string;
  titulo: string;
  categoria: CategoriaEtapa;
  status: StatusItem | null;
  urgente: boolean;
  precisaSupervisor: boolean;
  observacao: string;
  fotos: Foto[];
}

export interface TrocaEquipamento {
  id: string;
  categoria: CategoriaEtapa;
  equipamento: string;
  motivo: string;
  numeroSerieAntigo: string;
  numeroSerieNovo: string;
  fotoAntes: File | null;
  fotoDepois: File | null;
}
