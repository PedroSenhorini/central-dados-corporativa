import {
  Server,
  MousePointer2,
  Keyboard,
  Monitor,
  Wifi,
  Cable,
  Video,
  Globe,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';

export const ICONES_CHECKLIST: Record<string, LucideIcon> = {
  rack: Server,
  mouse: MousePointer2,
  teclado: Keyboard,
  computadores: Monitor,
  aps: Wifi,
  'cabos-rede': Cable,
  cameras: Video,
  internet: Globe,
};

export function iconeDoItem(id: string): LucideIcon {
  return ICONES_CHECKLIST[id] ?? ClipboardList;
}
