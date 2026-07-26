import { z } from 'zod';

const statusSchema = z.enum(['ok', 'atencao', 'nao_aplica']).nullable();

const fotoSchema = z.object({
  id: z.string(),
  arquivo: z.instanceof(File),
  legenda: z.string().optional(),
});

const itemChecklistSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  status: statusSchema,
  urgente: z.boolean(),
  precisaSupervisor: z.boolean(),
  observacao: z.string(),
  fotos: z.array(fotoSchema),
});

const trocaSchema = z.object({
  id: z.string(),
  equipamento: z.string().min(1, 'Informe o equipamento'),
  motivo: z.string().min(1, 'Informe o motivo da troca'),
  fotoAntes: z.instanceof(File, { message: 'Foto do "antes" é obrigatória' }),
  fotoDepois: z.instanceof(File, { message: 'Foto do "depois" é obrigatória' }),
});

export const visitaSchema = z.object({
  tecnicoNome: z.string().min(1, 'Informe seu nome'),
  academiaNome: z.string().min(1, 'Informe a academia'),
  dataVisita: z.string().min(1),
  checklistGeral: z.array(itemChecklistSchema),
  trocas: z.array(trocaSchema),
  assinatura: z.object({
    gestorNome: z.string().min(1, 'Nome do gestor é obrigatório'),
    imagemBase64: z.string().nullable().refine((valor) => !!valor, { message: 'Assinatura é obrigatória' }),
  }),
});

export type VisitaSchema = z.infer<typeof visitaSchema>;
