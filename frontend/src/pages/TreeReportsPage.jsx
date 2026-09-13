import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ScanLine } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReportCard from "../components/ReportCard";
import { reportsApi, treesApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";

export default function TreeReportsPage() {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const [tree, setTree] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [treeRes, reportsRes] = await Promise.all([
        treesApi.get(treeId),
        reportsApi.list({ tree_id: treeId, sort_by: "created_at", sort_dir: "desc", page: 1, page_size: 50 }),
      ]);
      setTree(treeRes.data);
      setReports(reportsRes.data.items);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load this tree's reports."));
    } finally {
      setLoading(false);
    }
  }, [treeId]);

  useEffect(() => {
    load();
  }, [load]);

  const goScan = () => {
    if (!tree) return;
    navigate("/scan", {
      state: {
        presetTree: { id: tree.id, label: tree.label, sublabel: tree.species },
      },
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link
          to="/parks"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--mist-dim)] hover:text-[color:var(--mist)]"
        >
          <ArrowLeft size={13} /> Back to parks
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-[color:var(--moss)]">Tree history</p>
            <h1 className="mt-2 font-display text-4xl text-[color:var(--mist)]">
              {tree ? tree.label : "Tree"}
            </h1>
            {tree?.species && <p className="mt-1 text-sm text-[color:var(--mist-dim)]">{tree.species}</p>}
          </div>
          <button
            onClick={goScan}
            className="flex items-center gap-1.5 rounded-full bg-[color:var(--moss)] px-4 py-2 text-sm font-semibold text-[#0b1a10] transition-transform hover:scale-[1.03] active:scale-95"
          >
            <ScanLine size={14} /> Scan this tree
          </button>
        </div>
      </motion.div>

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
            actionTaken={report.action_taken}
            timestamp={new Date(report.created_at).toLocaleString()}
          />
        ))}

        {!loading && reports.length === 0 && (
          <p className="text-sm text-[color:var(--mist-dim)]">
            This tree hasn't been scanned yet.
          </p>
        )}
      </div>
    </div>
  );
}
