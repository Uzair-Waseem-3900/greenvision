import { motion } from "framer-motion";
import { TreePine, Images, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";
import ParkList from "../components/ParkList";
import RecentScans from "../components/RecentScans";
import { dashboardStats, healthTrend, parks, recentScans } from "../data/mockData";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="font-mono text-xs text-[color:var(--moss)]">Park overview</p>
        <h1 className="mt-2 font-display text-4xl text-[color:var(--mist)]">
          Community dashboard
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-[color:var(--mist-dim)]">
          Aggregated results across every scan submitted by the community,
          shown here with sample data for the demo.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={TreePine} label="Trees monitored" value={dashboardStats.treesMonitored} accent="var(--moss)" />
        <StatCard icon={Images} label="Images analyzed" value={dashboardStats.imagesAnalyzed} accent="var(--sky)" />
        <StatCard icon={CheckCircle2} label="Healthy" value={dashboardStats.healthy} accent="var(--moss)" />
        <StatCard icon={AlertTriangle} label="Mild stress" value={dashboardStats.mildStress} accent="var(--amber)" />
        <StatCard icon={AlertCircle} label="High stress" value={dashboardStats.highStress} accent="var(--clay)" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-6"
        >
          <h2 className="font-display text-lg text-[color:var(--mist)]">Health trend over time</h2>
          <p className="mb-4 text-xs text-[color:var(--mist-dim)]">Monthly scan totals by status</p>
          <TrendChart data={healthTrend} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-6"
        >
          <h2 className="font-display text-lg text-[color:var(--mist)]">Parks &amp; locations</h2>
          <p className="mb-4 text-xs text-[color:var(--mist-dim)]">{parks.length} parks currently covered</p>
          <ParkList parks={parks} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        <h2 className="mb-4 font-display text-lg text-[color:var(--mist)]">Recent scans</h2>
        <RecentScans scans={recentScans} />
      </motion.div>
    </div>
  );
}
