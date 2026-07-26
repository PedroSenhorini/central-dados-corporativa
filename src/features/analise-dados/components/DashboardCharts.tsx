import { memo } from 'react';
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
import type { GraficoDef } from '../data/types.js';

interface DashboardChartsProps {
  graficoLinha: GraficoDef;
  graficoBarra: GraficoDef;
}

// componente separado (e carregado com React.lazy na página) pra o bundle do
// Recharts só baixar quando essa parte realmente precisa aparecer
function DashboardCharts({ graficoLinha, graficoBarra }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
        <p className="font-display text-sm font-semibold text-ink2 mb-1">{graficoLinha.titulo}</p>
        <p className="text-[12px] text-muted mb-4">{graficoLinha.subtitulo}</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graficoLinha.dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey={graficoLinha.eixoX}
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey={graficoLinha.dataKey}
                stroke="#2454E0"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2454E0' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
        <p className="font-display text-sm font-semibold text-ink2 mb-1">{graficoBarra.titulo}</p>
        <p className="text-[12px] text-muted mb-4">{graficoBarra.subtitulo}</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graficoBarra.dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey={graficoBarra.eixoX}
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey={graficoBarra.dataKey} fill="#0EA5A5" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardCharts);
