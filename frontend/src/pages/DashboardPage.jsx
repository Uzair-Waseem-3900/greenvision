import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TreePine, Images, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import StatCard from "../components/StatCard";
import ParkList from "../components/ParkList";
import ReportCard from "../components/ReportCard";
import { aiApi, parksApi, reportsApi, treesApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [parks, setParks] = useState([]);
  const [treeCount, setTreeCount] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, parksRes, treesRes, recentRes] = await Promise.all([
          aiApi.dashboardSummary(),
          parksApi.list({ page: 1, page_size: 12 }),
          treesApi.list({ page: 1, page_size: 1 }),
          reportsApi.list({ sort_by: "created_at", sort_dir: "desc", page: 1, page_size: 5 }),
        ]);
        setSummary(summaryRes.data);
        setParks(parksRes.data.items);
        setTreeCount(treesRes.data.total);
        setRecent(recentRes.data.items);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load dashboard data."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Parks don't carry an aggregate health status from the API, so default
  // the badge to "healthy" until a per-park rollup endpoint exists.
  const parksForList = parks.map((p) => ({
    id: p.id,
    name: p.name,
    trees: p.tree_count ?? 0,
    status: "healthy",
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
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
          Live results aggregated from every scan submitted so far.
        </p>
      </motion.div>

      {error && <p className="mb-6 text-sm text-[color:var(--clay)]">{error}</p>}

      {!loading && summary && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard icon={TreePine} label="Trees monitored" value={treeCount} accent="var(--moss)" />
            <StatCard icon={Images} label="Images analyzed" value={summary.images_analyzed} accent="var(--sky)" />
            <StatCard icon={CheckCircle2} label="Healthy" value={summary.healthy} accent="var(--moss)" />
            <StatCard icon={AlertTriangle} label="Mild stress" value={summary.mild} accent="var(--amber)" />
            <StatCard icon={AlertCircle} label="High stress" value={summary.high} accent="var(--clay)" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg text-[color:var(--mist)]">Recent scans</h2>
                <Link to="/reports" className="text-xs font-medium text-[color:var(--moss)] hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recent.map((report) => (
                  <ReportCard
                    key={report.id}
                    imageUrl={report.image_url}
                    title={report.title}
                    severity={report.severity}
                    status={report.status}
                    confidence={report.confidence}
                    treeLabel={report.tree_label}
                    parkName={report.park_name}
                    timestamp={new Date(report.created_at).toLocaleString()}
                  />
                ))}
                {recent.length === 0 && (
                  <p className="text-sm text-[color:var(--mist-dim)]">No scans yet.</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-6"
            >
              <h2 className="font-display text-lg text-[color:var(--mist)]">Parks &amp; locations</h2>
              <p className="mb-4 text-xs text-[color:var(--mist-dim)]">
                {parksForList.length} parks currently covered
              </p>
              <ParkList parks={parksForList} />
            </motion.div>
          </div>
        </>
      )}

      {loading && <p className="text-sm text-[color:var(--mist-dim)]">Loading dashboard…</p>}
    </div>
  );
}
