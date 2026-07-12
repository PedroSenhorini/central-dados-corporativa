import { useId } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function KpiCard({
  label,
  value,
  delta,
  sparkline = [],
  accent = 'primary',
  melhorQuandoAumenta = true,
}) {
  const gradientId = useId();
  const subiu = delta >= 0;
  const bom = melhorQuandoAumenta ? subiu : !subiu;
  const data = sparkline.map((v, i) => ({ i, v }));
  const accentHex = accent === 'accent' ? '#0EA5A5' : '#2454E0';

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <span
          className={`inline-flex items-center gap-0.5 text-[12px] font-semibold px-1.5 py-0.5 rounded-full ${
            bom ? 'text-success bg-success/10' : 'text-red-600 bg-red-50'
          }`}
        >
          {subiu ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(delta)}%
        </span>
      </div>

      <p className="font-display text-2xl font-semibold text-ink2">{value}</p>

      <div className="h-10 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentHex} stopOpacity={0.35} />
                <stop offset="100%" stopColor={accentHex} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={accentHex}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
