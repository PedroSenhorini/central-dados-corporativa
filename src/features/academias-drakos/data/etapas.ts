import { Wifi, MousePointer2, Monitor, Video, ClipboardList, PenLine, type LucideIcon } from 'lucide-react';
import type { CategoriaEtapa } from '../types.js';

export type EtapaId = 'intro' | CategoriaEtapa | 'assinatura';

export interface EtapaConfig {
  id: EtapaId;
  titulo: string;
  icone: LucideIcon;
  categoria?: CategoriaEtapa;
}

export const ETAPAS: EtapaConfig[] = [
  { id: 'intro', titulo: 'Visita', icone: ClipboardList },
  { id: 'rede', titulo: 'Rede', icone: Wifi, categoria: 'rede' },
  { id: 'perifericos', titulo: 'Periféricos', icone: MousePointer2, categoria: 'perifericos' },
  { id: 'computadores', titulo: 'Computadores', icone: Monitor, categoria: 'computadores' },
  { id: 'cameras', titulo: 'Câmeras', icone: Video, categoria: 'cameras' },
  { id: 'assinatura', titulo: 'Assinatura', icone: PenLine },
];
