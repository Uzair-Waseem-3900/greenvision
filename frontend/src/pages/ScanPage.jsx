import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ScanUploader from "../components/ScanUploader";
import { parksApi, treesApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";

export default function ScanPage() {
  const [parks, setParks] = useState([]);
  const [selectedParkId, setSelectedParkId] = useState("");
  const [trees, setTrees] = useState([]);
  const [selectedTreeId, setSelectedTreeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadParks = async () => {
      try {
        const res = await parksApi.list({ page: 1, page_size: 100 });
        setParks(res.data.items);
        if (res.data.items.length > 0) setSelectedParkId(res.data.items[0].id);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load parks."));
      } finally {
        setLoading(false);
      }
    };
    loadParks();
  }, []);

  useEffect(() => {
    if (!selectedParkId) {
      setTrees([]);
      setSelectedTreeId("");
      return;
    }
    const loadTrees = async () => {
      try {
        const res = await treesApi.list({ park_id: selectedParkId, page: 1, page_size: 100 });
        setTrees(res.data.items);
        setSelectedTreeId(res.data.items[0]?.id || "");
      } catch {
        setTrees([]);
        setSelectedTreeId("");
      }
    };
    loadTrees();
  }, [selectedParkId]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 max-w-xl"
      >
        <p className="font-mono text-xs text-[color:var(--moss)]">Live analysis</p>
        <h1 className="mt-2 font-display text-4xl text-[color:var(--mist)]">
          Scan a tree
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--mist-dim)]">
          Choose a park and tree, then upload a photo. It's sent straight to
          the AI pipeline for a live assessment.
        </p>
      </motion.div>

      {!loading && parks.length === 0 && (
        <div className="mb-8 rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-6 text-sm text-[color:var(--mist-dim)]">
          You don't have any parks yet.{" "}
          <Link to="/parks" className="font-medium text-[color:var(--moss)] hover:underline">
            Add a park and a tree first
          </Link>{" "}
          before scanning a photo.
        </div>
      )}

      {error && <p className="mb-6 text-sm text-[color:var(--clay)]">{error}</p>}

      {parks.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--mist-dim)]">
              Park
            </label>
            <select
              value={selectedParkId}
              onChange={(e) => setSelectedParkId(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)]"
            >
              {parks.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--mist-dim)]">
              Tree
            </label>
            <select
              value={selectedTreeId}
              onChange={(e) => setSelectedTreeId(e.target.value)}
              disabled={trees.length === 0}
              className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)] disabled:opacity-50"
            >
              {trees.length === 0 && <option>No trees in this park</option>}
              {trees.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {trees.length === 0 && selectedParkId && (
            <p className="sm:col-span-2 text-xs text-[color:var(--mist-dim)]">
              This park has no trees yet.{" "}
              <Link to="/parks" className="font-medium text-[color:var(--moss)] hover:underline">
                Add one
              </Link>
              .
            </p>
          )}
        </div>
      )}

      <ScanUploader treeId={selectedTreeId || null} />
    </div>
  );
}
