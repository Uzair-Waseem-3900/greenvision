import { motion } from "framer-motion";
import { statusMeta } from "../data/mockData";

export default function RecentScans({ scans }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--line)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[color:var(--line)] bg-[color:var(--canopy-1)] text-xs uppercase tracking-wide text-[color:var(--mist-dim)]">
            <th className="px-4 py-3 font-medium">Tree</th>
            <th className="px-4 py-3 font-medium">Park</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Confidence</th>
            <th className="px-4 py-3 font-medium">Scanned</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((s, i) => {
            const meta = statusMeta[s.status];
            return (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="border-b border-[color:var(--line)] last:border-0 hover:bg-[color:var(--canopy-2)]"
              >
                <td className="px-4 py-3 font-medium text-[color:var(--mist)]">{s.tree}</td>
                <td className="px-4 py-3 text-[color:var(--mist-dim)]">{s.park}</td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[color:var(--mist)]">{s.confidence}%</td>
                <td className="px-4 py-3 text-[color:var(--mist-dim)]">{s.time}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
