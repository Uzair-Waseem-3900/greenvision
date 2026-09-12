import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Droplets, Gauge } from "lucide-react";
import { statusMeta } from "../data/mockData";

const metricLabels = {
  canopyDensity: "Canopy density",
  leafColorIndex: "Leaf color index",
  symmetry: "Structural symmetry",
};

export default function ResultPanel({ result }) {
  const meta = statusMeta[result.level];
  const Icon = result.level === "healthy" ? CheckCircle2 : AlertTriangle;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: meta.bg, color: meta.color }}
        >
          <Icon size={13} />
          {result.status}
        </span>
        <div className="flex items-center gap-1.5 font-mono text-xs text-[color:var(--mist-dim)]">
          <Gauge size={13} />
          {result.confidence}% confidence
        </div>
      </div>

      <h3 className="mt-4 font-display text-2xl text-[color:var(--mist)]">
        {result.issue}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--mist-dim)]">
        {result.detail}
      </p>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-[color:var(--line)] bg-[color:var(--canopy-1)] p-3">
        <Droplets size={15} className="mt-0.5 shrink-0 text-[color:var(--sky)]" />
        <p className="text-sm text-[color:var(--mist)]">
          <span className="font-semibold">Suggested action: </span>
          {result.action}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {Object.entries(result.metrics).map(([key, value], i) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[color:var(--mist-dim)]">{metricLabels[key]}</span>
              <span className="font-mono text-[color:var(--mist)]">{value}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--canopy-3)]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: meta.color }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
