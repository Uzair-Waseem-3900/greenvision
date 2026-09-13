import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import ReportCard from "../components/ReportCard";
import { parksApi, reportsApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";
import { useDebouncedValue } from "../lib/useDebouncedValue";

const TABS = [
  { value: "", label: "All" },
  { value: "healthy", label: "Healthy" },
  { value: "mild", label: "Mild stress" },
  { value: "high", label: "High stress" },
];

export default function ParkTreesReportPage() {
  const { parkId } = useParams();
  const navigate = useNavigate();
  const [park, setPark] = useState(null);
  const [items, setItems] = useState([]);
  const [severity, setSeverity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    parksApi.get(parkId).then((res) => setPark(res.data)).catch(() => {});
  }, [parkId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reportsApi.latestByPark(parkId, {
        severity: severity || undefined,
        search: search || undefined,
        page: 1,
        page_size: 50,
      });
      setItems(res.data.items);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load scans for this park."));
    } finally {
      setLoading(false);
    }
  }, [parkId, severity, search]);

  useEffect(() => {
    load();
  }, [load]);

  const goScan = (tree) => {
    navigate("/scan", {
      state: {
        presetPark: park ? { id: park.id, label: park.name, sublabel: park.address } : null,
        presetTree: { id: tree.tree_id, label: tree.tree_label, sublabel: tree.tree_species },
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link
          to="/parks"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--mist-dim)] hover:text-[color:var(--mist)]"
        >
          <ArrowLeft size={13} /> Back to parks
        </Link>
        <p className="font-mono text-xs text-[color:var(--moss)]">Latest scans</p>
        <h1 className="mt-2 font-display text-4xl text-[color:var(--mist)]">
          {park ? park.name : "Park"}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--mist-dim)]">
          The most recent scan for every tree in this park.
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
          placeholder="Search trees by label or species…"
          className="w-full bg-transparent text-sm text-[color:var(--mist)] outline-none placeholder:text-[color:var(--mist-dim)]"
        />
      </div>

      {loading && <p className="text-sm text-[color:var(--mist-dim)]">Loading scans…</p>}
      {error && <p className="text-sm text-[color:var(--clay)]">{error}</p>}

      <div className="space-y-3">
        {items.map((item) => (
          <ReportCard
            key={item.tree_id}
            imageUrl={item.image_url}
            title={item.title}
            severity={item.severity}
            status={item.status}
            confidence={item.confidence}
            treeLabel={item.tree_label}
            timestamp={item.scanned_at ? new Date(item.scanned_at).toLocaleString() : null}
            neverScanned={!item.report_id}
            onScanNow={() => goScan(item)}
            onClick={
              item.report_id ? () => navigate(`/trees/${item.tree_id}/reports`) : undefined
            }
          />
        ))}

        {!loading && items.length === 0 && (
          <p className="text-sm text-[color:var(--mist-dim)]">No trees match this filter.</p>
        )}
      </div>
    </div>
  );
}
