import { LayoutDashboard, Factory, Headphones, TrendingUp, ShoppingCart, Cpu, Users, Megaphone } from 'lucide-react';

/**
 * Dashboards por área da empresa.
 *
 * Cada área tem seus próprios KPIs e gráficos. Para adicionar uma nova
 * área (ex: Logística, Qualidade), basta acrescentar um objeto aqui —
 * a página renderiza tudo a partir desta lista, sem mudar componente.
 *
 * Estrutura de cada área:
 * - id / label / icon: identificação e exibição no seletor
 * - descricao: subtítulo mostrado no topo da página
 * - kpis: cards de indicadores (mesmo formato do KpiCard)
 * - graficoLinha / graficoBarra: título, subtítulo, chave do eixo X,
 *   chave do valor e a série de dados
 */
export const AREAS_DASHBOARD = [
  {
    id: 'geral',
    label: 'Visão Geral',
    icon: LayoutDashboard,
    descricao: 'Visão consolidada dos principais indicadores da operação.',
    kpis: [
      { label: 'Registros Processados', value: '128.402', delta: 6.4, sparkline: [4, 6, 5, 8, 7, 9, 11], accent: 'primary', melhorQuandoAumenta: true },
      { label: 'Taxa de Sucesso', value: '99,2%', delta: 0.3, sparkline: [98, 98.4, 98.9, 99, 99.1, 99.2, 99.2], accent: 'accent', melhorQuandoAumenta: true },
      { label: 'Tempo Médio de Sync', value: '1,8s', delta: -3.1, sparkline: [2.4, 2.2, 2.1, 2.0, 1.9, 1.85, 1.8], accent: 'primary', melhorQuandoAumenta: false },
      { label: 'Onboardings no Mês', value: '37', delta: 12.0, sparkline: [12, 18, 20, 25, 29, 33, 37], accent: 'accent', melhorQuandoAumenta: true },
    ],
    graficoLinha: {
      titulo: 'Volume de Dados Processados',
      subtitulo: 'Últimos 6 meses',
      eixoX: 'mes',
      dataKey: 'valor',
      dados: [
        { mes: 'Fev', valor: 74000 },
        { mes: 'Mar', valor: 81500 },
        { mes: 'Abr', valor: 88200 },
        { mes: 'Mai', valor: 96700 },
        { mes: 'Jun', valor: 111300 },
        { mes: 'Jul', valor: 128400 },
      ],
    },
    graficoBarra: {
      titulo: 'Distribuição por Categoria',
      subtitulo: 'Participação percentual no mês atual',
      eixoX: 'categoria',
      dataKey: 'valor',
      dados: [
        { categoria: 'Vendas', valor: 42 },
        { categoria: 'Financeiro', valor: 27 },
        { categoria: 'RH', valor: 18 },
        { categoria: 'Operações', valor: 13 },
      ],
    },
  },
  {
    id: 'pcp',
    label: 'PCP',
    icon: Factory,
    descricao: 'Planejamento e Controle de Produção — ordens, eficiência e paradas.',
    kpis: [
      { label: 'Ordens Concluídas', value: '312', delta: 4.8, sparkline: [248, 260, 271, 284, 298, 305, 312], accent: 'primary', melhorQuandoAumenta: true },
      { label: 'Eficiência (OEE)', value: '87,4%', delta: 1.2, sparkline: [83, 84, 84.5, 85.8, 86.2, 87, 87.4], accent: 'accent', melhorQuandoAumenta: true },
      { label: 'Lead Time Médio', value: '5,2 dias', delta: -6.5, sparkline: [6.4, 6.1, 6.0, 5.8, 5.5, 5.3, 5.2], accent: 'primary', melhorQuandoAumenta: false },
      { label: 'Paradas Não Planejadas', value: '9', delta: -18.0, sparkline: [16, 14, 15, 12, 11, 10, 9], accent: 'accent', melhorQuandoAumenta: false },
    ],
    graficoLinha: {
      titulo: 'Produção Mensal',
      subtitulo: 'Unidades produzidas nos últimos 6 meses',
      eixoX: 'mes',
      dataKey: 'valor',
      dados: [
        { mes: 'Fev', valor: 2400 },
        { mes: 'Mar', valor: 2650 },
        { mes: 'Abr', valor: 2580 },
        { mes: 'Mai', valor: 2890 },
        { mes: 'Jun', valor: 3040 },
        { mes: 'Jul', valor: 3210 },
      ],
    },
    graficoBarra: {
      titulo: 'Ocupação por Linha de Produção',
      subtitulo: 'Percentual de utilização no mês atual',
      eixoX: 'categoria',
      dataKey: 'valor',
      dados: [
        { categoria: 'Linha A', valor: 92 },
        { categoria: 'Linha B', valor: 78 },
        { categoria: 'Linha C', valor: 85 },
        { categoria: 'Montagem', valor: 64 },
      ],
    },
  },
  {
    id: 'sac',
    label: 'SAC',
    icon: Headphones,
    descricao: 'Atendimento ao cliente — chamados, satisfação e tempo de resposta.',
    kpis: [
      { label: 'Chamados no Mês', value: '1.842', delta: -8.2, sparkline: [2310, 2150, 2280, 2020, 1960, 1890, 1842], accent: 'primary', melhorQuandoAumenta: false },
      { label: 'Satisfação (CSAT)', value: '4,6/5', delta: 2.1, sparkline: [4.2, 4.3, 4.3, 4.4, 4.5, 4.55, 4.6], accent: 'accent', melhorQuandoAumenta: true },
      { label: 'Tempo Médio de Resposta', value: '2h 14min', delta: -12.4, sparkline: [3.1, 2.9, 2.8, 2.6, 2.5, 2.4, 2.23], accent: 'primary', melhorQuandoAumenta: false },
      { label: 'Resolução no 1º Contato', value: '81%', delta: 3.5, sparkline: [72, 74, 75, 77, 78, 80, 81], accent: 'accent', melhorQuandoAumenta: true },
    ],
    graficoLinha: {
      titulo: 'Chamados Recebidos',
      subtitulo: 'Últimos 6 meses',
      eixoX: 'mes',
      dataKey: 'valor',
      dados: [
        { mes: 'Fev', valor: 2310 },
        { mes: 'Mar', valor: 2150 },
        { mes: 'Abr', valor: 2280 },
        { mes: 'Mai', valor: 2020 },
        { mes: 'Jun', valor: 1960 },
        { mes: 'Jul', valor: 1842 },
      ],
    },
    graficoBarra: {
      titulo: 'Chamados por Canal',
      subtitulo: 'Participação percentual no mês atual',
      eixoX: 'categoria',
      dataKey: 'valor',
      dados: [
        { categoria: 'WhatsApp', valor: 46 },
        { categoria: 'E-mail', valor: 27 },
        { categoria: 'Telefone', valor: 18 },
        { categoria: 'Chat', valor: 9 },
      ],
    },
  },
  {
    id: 'vendas',
    label: 'Vendas',
    icon: TrendingUp,
    descricao: 'Desempenho comercial — receita, conversão e novos clientes.',
    kpis: [
      { label: 'Receita no Mês', value: 'R$ 1,24M', delta: 9.6, sparkline: [890, 940, 1010, 1080, 1150, 1200, 1240], accent: 'primary', melhorQuandoAumenta: true },
      { label: 'Novos Clientes', value: '58', delta: 14.0, sparkline: [34, 38, 41, 45, 49, 53, 58], accent: 'accent', melhorQuandoAumenta: true },
      { label: 'Ticket Médio', value: 'R$ 21,4 mil', delta: 3.2, sparkline: [19.2, 19.6, 20.1, 20.4, 20.8, 21.1, 21.4], accent: 'primary', melhorQuandoAumenta: true },
      { label: 'Taxa de Conversão', value: '23%', delta: 1.8, sparkline: [18, 19, 20, 21, 21.5, 22, 23], accent: 'accent', melhorQuandoAumenta: true },
    ],
    graficoLinha: {
      titulo: 'Receita Mensal',
      subtitulo: 'Em R$ mil, últimos 6 meses',
      eixoX: 'mes',
      dataKey: 'valor',
      dados: [
        { mes: 'Fev', valor: 890 },
        { mes: 'Mar', valor: 940 },
        { mes: 'Abr', valor: 1010 },
        { mes: 'Mai', valor: 1080 },
        { mes: 'Jun', valor: 1150 },
        { mes: 'Jul', valor: 1240 },
      ],
    },
    graficoBarra: {
      titulo: 'Vendas por Região',
      subtitulo: 'Participação percentual no mês atual',
      eixoX: 'categoria',
      dataKey: 'valor',
      dados: [
        { categoria: 'Sudeste', valor: 44 },
        { categoria: 'Sul', valor: 26 },
        { categoria: 'Nordeste', valor: 17 },
        { categoria: 'Centro-Oeste', valor: 13 },
      ],
    },
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: ShoppingCart,
    descricao: 'Suprimentos — pedidos, economia negociada e prazos de entrega.',
    kpis: [
      { label: 'Pedidos Emitidos', value: '246', delta: 5.1, sparkline: [198, 205, 212, 224, 231, 240, 246], accent: 'primary', melhorQuandoAumenta: true },
      { label: 'Economia Negociada', value: 'R$ 84 mil', delta: 11.3, sparkline: [52, 58, 61, 67, 72, 78, 84], accent: 'accent', melhorQuandoAumenta: true },
      { label: 'Prazo Médio de Entrega', value: '8,4 dias', delta: -4.7, sparkline: [9.8, 9.5, 9.3, 9.0, 8.8, 8.6, 8.4], accent: 'primary', melhorQuandoAumenta: false },
      { label: 'Fornecedores Ativos', value: '132', delta: 2.3, sparkline: [121, 123, 125, 127, 128, 130, 132], accent: 'accent', melhorQuandoAumenta: true },
    ],
    graficoLinha: {
      titulo: 'Gasto Mensal',
      subtitulo: 'Em R$ mil, últimos 6 meses',
      eixoX: 'mes',
      dataKey: 'valor',
      dados: [
        { mes: 'Fev', valor: 620 },
        { mes: 'Mar', valor: 585 },
        { mes: 'Abr', valor: 640 },
        { mes: 'Mai', valor: 610 },
        { mes: 'Jun', valor: 660 },
        { mes: 'Jul', valor: 645 },
      ],
    },
    graficoBarra: {
      titulo: 'Gasto por Categoria',
      subtitulo: 'Participação percentual no mês atual',
      eixoX: 'categoria',
      dataKey: 'valor',
      dados: [
        { categoria: 'Matéria-prima', valor: 52 },
        { categoria: 'Insumos', valor: 21 },
        { categoria: 'Serviços', valor: 16 },
        { categoria: 'Logística', valor: 11 },
      ],
    },
  },
  {
    id: 'ti',
    label: 'T.I.',
    icon: Cpu,
    descricao: 'Tecnologia da Informação — chamados, disponibilidade e infraestrutura.',
    kpis: [
      { label: 'Chamados Resolvidos', value: '486', delta: 7.3, sparkline: [372, 390, 405, 428, 450, 468, 486], accent: 'primary', melhorQuandoAumenta: true },
      { label: 'Disponibilidade (Uptime)', value: '99,8%', delta: 0.1, sparkline: [99.5, 99.6, 99.6, 99.7, 99.7, 99.8, 99.8], accent: 'accent', melhorQuandoAumenta: true },
      { label: 'Tempo Médio de Resolução', value: '3h 12min', delta: -9.4, sparkline: [4.2, 4.0, 3.8, 3.6, 3.4, 3.3, 3.2], accent: 'primary', melhorQuandoAumenta: false },
      { label: 'Incidentes Críticos', value: '2', delta: -50.0, sparkline: [6, 5, 5, 4, 3, 3, 2], accent: 'accent', melhorQuandoAumenta: false },
    ],
    graficoLinha: {
      titulo: 'Chamados de Suporte',
      subtitulo: 'Últimos 6 meses',
      eixoX: 'mes',
      dataKey: 'valor',
      dados: [
        { mes: 'Fev', valor: 372 },
        { mes: 'Mar', valor: 390 },
        { mes: 'Abr', valor: 405 },
        { mes: 'Mai', valor: 428 },
        { mes: 'Jun', valor: 450 },
        { mes: 'Jul', valor: 486 },
      ],
    },
    graficoBarra: {
      titulo: 'Chamados por Categoria',
      subtitulo: 'Participação percentual no mês atual',
      eixoX: 'categoria',
      dataKey: 'valor',
      dados: [
        { categoria: 'Infraestrutura', valor: 38 },
        { categoria: 'Suporte', valor: 31 },
        { categoria: 'Segurança', valor: 18 },
        { categoria: 'Sistemas', valor: 13 },
      ],
    },
  },
  {
    id: 'rh',
    label: 'RH',
    icon: Users,
    descricao: 'Recursos Humanos — headcount, turnover e clima organizacional.',
    kpis: [
      { label: 'Colaboradores Ativos', value: '842', delta: 2.6, sparkline: [790, 802, 811, 820, 828, 835, 842], accent: 'primary', melhorQuandoAumenta: true },
      { label: 'Turnover Mensal', value: '1,8%', delta: -0.6, sparkline: [2.6, 2.4, 2.3, 2.1, 2.0, 1.9, 1.8], accent: 'accent', melhorQuandoAumenta: false },
      { label: 'Tempo Médio de Contratação', value: '18 dias', delta: -8.1, sparkline: [24, 23, 22, 21, 20, 19, 18], accent: 'primary', melhorQuandoAumenta: false },
      { label: 'eNPS', value: '68', delta: 5.4, sparkline: [54, 57, 59, 62, 64, 66, 68], accent: 'accent', melhorQuandoAumenta: true },
    ],
    graficoLinha: {
      titulo: 'Headcount',
      subtitulo: 'Últimos 6 meses',
      eixoX: 'mes',
      dataKey: 'valor',
      dados: [
        { mes: 'Fev', valor: 790 },
        { mes: 'Mar', valor: 802 },
        { mes: 'Abr', valor: 811 },
        { mes: 'Mai', valor: 820 },
        { mes: 'Jun', valor: 828 },
        { mes: 'Jul', valor: 842 },
      ],
    },
    graficoBarra: {
      titulo: 'Colaboradores por Departamento',
      subtitulo: 'Participação percentual no mês atual',
      eixoX: 'categoria',
      dataKey: 'valor',
      dados: [
        { categoria: 'Operações', valor: 41 },
        { categoria: 'Comercial', valor: 24 },
        { categoria: 'Administrativo', valor: 19 },
        { categoria: 'TI', valor: 16 },
      ],
    },
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    descricao: 'Marketing — geração de leads, engajamento e retorno sobre investimento.',
    kpis: [
      { label: 'Leads Gerados', value: '3.184', delta: 15.2, sparkline: [2150, 2380, 2610, 2840, 2990, 3060, 3184], accent: 'primary', melhorQuandoAumenta: true },
      { label: 'Custo por Lead', value: 'R$ 24,60', delta: -6.8, sparkline: [31.2, 29.8, 28.4, 27.1, 26.0, 25.2, 24.6], accent: 'accent', melhorQuandoAumenta: false },
      { label: 'Taxa de Engajamento', value: '6,4%', delta: 1.1, sparkline: [5.0, 5.2, 5.5, 5.8, 6.0, 6.2, 6.4], accent: 'primary', melhorQuandoAumenta: true },
      { label: 'ROI de Campanhas', value: '3,8x', delta: 8.6, sparkline: [2.9, 3.1, 3.2, 3.4, 3.5, 3.7, 3.8], accent: 'accent', melhorQuandoAumenta: true },
    ],
    graficoLinha: {
      titulo: 'Leads Gerados',
      subtitulo: 'Últimos 6 meses',
      eixoX: 'mes',
      dataKey: 'valor',
      dados: [
        { mes: 'Fev', valor: 2150 },
        { mes: 'Mar', valor: 2380 },
        { mes: 'Abr', valor: 2610 },
        { mes: 'Mai', valor: 2840 },
        { mes: 'Jun', valor: 2990 },
        { mes: 'Jul', valor: 3184 },
      ],
    },
    graficoBarra: {
      titulo: 'Leads por Canal',
      subtitulo: 'Participação percentual no mês atual',
      eixoX: 'categoria',
      dataKey: 'valor',
      dados: [
        { categoria: 'Redes Sociais', valor: 39 },
        { categoria: 'Google Ads', valor: 28 },
        { categoria: 'E-mail', valor: 20 },
        { categoria: 'Orgânico', valor: 13 },
      ],
    },
  },
];
