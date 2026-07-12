import { useState } from 'react';
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
import { AREAS_DASHBOARD } from '../data/dashboards.js';

export default function AnaliseDados() {
  const [areaId, setAreaId] = useState(AREAS_DASHBOARD[0].id);
  const area = AREAS_DASHBOARD.find((a) => a.id === areaId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink2">Análise de Dados</h1>
        <p className="text-sm text-muted mt-0.5">{area.descricao}</p>
      </div>

      {/* Seletor de área da empresa */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Área da empresa">
        {AREAS_DASHBOARD.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === areaId}
            onClick={() => setAreaId(id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
              id === areaId
                ? 'bg-primary border-primary text-white'
                : 'bg-surface border-border text-muted hover:text-ink2 hover:border-primary/40'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Grid de KPIs da área selecionada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {area.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Gráficos grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
          <p className="font-display text-sm font-semibold text-ink2 mb-1">
            {area.graficoLinha.titulo}
          </p>
          <p className="text-[12px] text-muted mb-4">{area.graficoLinha.subtitulo}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={area.graficoLinha.dados}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey={area.graficoLinha.eixoX}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey={area.graficoLinha.dataKey}
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
            {area.graficoBarra.titulo}
          </p>
          <p className="text-[12px] text-muted mb-4">{area.graficoBarra.subtitulo}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={area.graficoBarra.dados}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey={area.graficoBarra.eixoX}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
                <Bar
                  dataKey={area.graficoBarra.dataKey}
                  fill="#0EA5A5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
