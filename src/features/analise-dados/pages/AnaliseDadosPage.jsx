import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import KpiCard from '../../../shared/components/KpiCard.jsx';

const KPIS = [
  { label: 'Registros Processados', value: '128.402', delta: 6.4, sparkline: [4, 6, 5, 8, 7, 9, 11], accent: 'primary' },
  { label: 'Taxa de Sucesso', value: '99,2%', delta: 0.3, sparkline: [98, 98.4, 98.9, 99, 99.1, 99.2, 99.2], accent: 'accent' },
  { label: 'Tempo Médio de Sync', value: '1,8s', delta: -3.1, sparkline: [2.4, 2.2, 2.1, 2.0, 1.9, 1.85, 1.8], accent: 'primary' },
  { label: 'Onboardings no Mês', value: '37', delta: 12.0, sparkline: [12, 18, 20, 25, 29, 33, 37], accent: 'accent' },
];

const VOLUME_MENSAL = [
  { mes: 'Fev', registros: 74000 },
  { mes: 'Mar', registros: 81500 },
  { mes: 'Abr', registros: 88200 },
  { mes: 'Mai', registros: 96700 },
  { mes: 'Jun', registros: 111300 },
  { mes: 'Jul', registros: 128400 },
];

const DISTRIBUICAO_CATEGORIA = [
  { categoria: 'Vendas', valor: 42 },
  { categoria: 'Financeiro', valor: 27 },
  { categoria: 'RH', valor: 18 },
  { categoria: 'Operações', valor: 13 },
];

export default function AnaliseDados() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink2">Análise de Dados</h1>
        <p className="text-sm text-muted mt-0.5">
          Visão consolidada dos principais indicadores da operação.
        </p>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Gráficos grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
          <p className="font-display text-sm font-semibold text-ink2 mb-1">
            Volume de Dados Processados
          </p>
          <p className="text-[12px] text-muted mb-4">Últimos 6 meses</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VOLUME_MENSAL} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="registros"
                  stroke="#2454E0"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2454E0' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
          <p className="font-display text-sm font-semibold text-ink2 mb-1">
            Distribuição por Categoria
          </p>
          <p className="text-[12px] text-muted mb-4">Participação percentual no mês atual</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRIBUICAO_CATEGORIA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="categoria" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
                <Bar dataKey="valor" fill="#0EA5A5" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
