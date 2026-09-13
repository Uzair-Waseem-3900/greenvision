import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { statusMeta } from "../data/mockData";

export default function ParkList({ parks }) {
  return (
    <div className="space-y-2">
      {parks.map((park, i) => {
        const meta = statusMeta[park.status];
        return (
          <motion.div
            key={park.id}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Link
              to={`/parks/${park.id}/reports`}
              className="flex items-center justify-between rounded-xl border border-[color:var(--line)] bg-[color:var(--canopy-1)] px-4 py-3 transition-colors hover:border-[color:var(--line-strong)]"
            >
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-[color:var(--mist-dim)]" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--mist)]">{park.name}</p>
                  <p className="font-mono text-xs text-[color:var(--mist-dim)]">
                    {park.trees} trees monitored
                  </p>
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: meta.bg, color: meta.color }}
              >
                {meta.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
