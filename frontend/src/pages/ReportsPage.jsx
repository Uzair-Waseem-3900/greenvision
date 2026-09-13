import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReportCard from "../components/ReportCard";
import { reportsApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";
import { useDebouncedValue } from "../lib/useDebouncedValue";

const TABS = [
  { value: "", label: "All" },
  { value: "healthy", label: "Healthy" },
  { value: "mild", label: "Mild stress" },
  { value: "high", label: "High stress" },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [severity, setSeverity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reportsApi.list({
        severity: severity || undefined,
        search: search || undefined,
        sort_by: "created_at",
        sort_dir: "desc",
        page: 1,
        page_size: 50,
      });
      setReports(res.data.items);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load reports."));
    } finally {
      setLoading(false);
    }
  }, [severity, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="font-mono text-xs text-[color:var(--moss)]">All activity</p>
        <h1 className="mt-2 font-display text-4xl text-[color:var(--mist)]">Reports</h1>
        <p className="mt-2 text-sm text-[color:var(--mist-dim)]">
          Every scan across every park, most recent first.
        </p>
      </motion.div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSeverity(tab.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              severity === tab.value
                ? "bg-[color:var(--canopy-3)] text-[color:var(--mist)]"
                : "bg-[color:var(--canopy-2)] text-[color:var(--mist-dim)] hover:text-[color:var(--mist)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-3.5 py-2.5">
        <Search size={14} className="text-[color:var(--mist-dim)]" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by tree, park, or issue…"
          className="w-full bg-transparent text-sm text-[color:var(--mist)] outline-none placeholder:text-[color:var(--mist-dim)]"
        />
      </div>

      {loading && <p className="text-sm text-[color:var(--mist-dim)]">Loading reports…</p>}
      {error && <p className="text-sm text-[color:var(--clay)]">{error}</p>}

      <div className="space-y-3">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            imageUrl={report.image_url}
            title={report.title}
            severity={report.severity}
            status={report.status}
            confidence={report.confidence}
            notes={report.notes}
            treeLabel={report.tree_label}
            parkName={report.park_name}
            timestamp={new Date(report.created_at).toLocaleString()}
            onClick={() => navigate(`/trees/${report.tree_id}/reports`)}
          />
        ))}

        {!loading && reports.length === 0 && (
          <p className="text-sm text-[color:var(--mist-dim)]">No reports match this filter.</p>
        )}
      </div>
    </div>
  );
}
