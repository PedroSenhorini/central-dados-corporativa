export type StatusItem = 'ok' | 'atencao' | 'nao_aplica';

export interface Foto {
  id: string;
  arquivo: File;
  legenda?: string;
}

export interface ItemChecklist {
  id: string;
  titulo: string;
  status: StatusItem | null;
  urgente: boolean;
  precisaSupervisor: boolean;
  observacao: string;
  fotos: Foto[];
}

export interface TrocaEquipamento {
  id: string;
  equipamento: string;
  motivo: string;
  fotoAntes: File | null;
  fotoDepois: File | null;
}
