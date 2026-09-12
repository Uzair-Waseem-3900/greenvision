import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-mono text-[color:var(--mist-dim)]">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function TrendChart({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="healthyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--moss)" stopOpacity={0.5} />
              <stop offset="95%" stopColor="var(--moss)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mildFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--amber)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="highFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--clay)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--clay)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="var(--mist-dim)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="var(--mist-dim)" fontSize={12} tickLine={false} axisLine={false} width={30} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="healthy"
            name="Healthy"
            stroke="var(--moss)"
            fill="url(#healthyFill)"
            strokeWidth={2}
            animationDuration={900}
          />
          <Area
            type="monotone"
            dataKey="mild"
            name="Mild stress"
            stroke="var(--amber)"
            fill="url(#mildFill)"
            strokeWidth={2}
            animationDuration={900}
          />
          <Area
            type="monotone"
            dataKey="high"
            name="High stress"
            stroke="var(--clay)"
            fill="url(#highFill)"
            strokeWidth={2}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
