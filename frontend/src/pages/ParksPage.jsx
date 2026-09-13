import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Trash2, TreePine, X } from "lucide-react";
import { parksApi, treesApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";

function ParkForm({ onCreated }) {
  const [form, setForm] = useState({ name: "", address: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await parksApi.create(form);
      onCreated(res.data);
      setForm({ name: "", address: "", description: "" });
    } catch (err) {
      setError(getErrorMessage(err, "Could not create park."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
      <input
        required
        placeholder="Park name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)]"
      />
      <input
        required
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        className="rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)]"
      />
      <div className="flex gap-2">
        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)]"
        />
        <button
          disabled={submitting}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[color:var(--moss)] px-4 py-2.5 text-sm font-semibold text-[#0b1a10] transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
        >
          <Plus size={15} />
          Add
        </button>
      </div>
      {error && <p className="sm:col-span-3 text-xs text-[color:var(--clay)]">{error}</p>}
    </form>
  );
}

function TreeForm({ parkId, onCreated, onCancel }) {
  const [form, setForm] = useState({ label: "", species: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await treesApi.create({ ...form, park_id: parkId });
      onCreated(res.data);
      setForm({ label: "", species: "" });
    } catch (err) {
      setError(getErrorMessage(err, "Could not add tree."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-xl bg-[color:var(--canopy-1)] p-3">
      <input
        required
        placeholder="Tree label, e.g. White Oak #114"
        value={form.label}
        onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
        className="min-w-[180px] flex-1 rounded-lg border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-3 py-2 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)]"
      />
      <input
        placeholder="Species (optional)"
        value={form.species}
        onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
        className="min-w-[140px] flex-1 rounded-lg border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-3 py-2 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)]"
      />
      <button
        disabled={submitting}
        className="rounded-lg bg-[color:var(--moss)] px-3 py-2 text-xs font-semibold text-[#0b1a10] disabled:opacity-60"
      >
        Add tree
      </button>
      <button type="button" onClick={onCancel} className="rounded-lg p-2 text-[color:var(--mist-dim)] hover:text-[color:var(--mist)]">
        <X size={15} />
      </button>
      {error && <p className="w-full text-xs text-[color:var(--clay)]">{error}</p>}
    </form>
  );
}

export default function ParksPage() {
  const [parks, setParks] = useState([]);
  const [treesByPark, setTreesByPark] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [addingTreeFor, setAddingTreeFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadParks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await parksApi.list({ page: 1, page_size: 50 });
      setParks(res.data.items);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load parks."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParks();
  }, []);

  const toggleExpand = async (parkId) => {
    if (expanded === parkId) {
      setExpanded(null);
      return;
    }
    setExpanded(parkId);
    if (!treesByPark[parkId]) {
      try {
        const res = await treesApi.list({ park_id: parkId, page: 1, page_size: 50 });
        setTreesByPark((prev) => ({ ...prev, [parkId]: res.data.items }));
      } catch {
        setTreesByPark((prev) => ({ ...prev, [parkId]: [] }));
      }
    }
  };

  const handleTreeCreated = (parkId, tree) => {
    setTreesByPark((prev) => ({ ...prev, [parkId]: [tree, ...(prev[parkId] || [])] }));
    setAddingTreeFor(null);
    setParks((prev) =>
      prev.map((p) => (p.id === parkId ? { ...p, tree_count: (p.tree_count || 0) + 1 } : p))
    );
  };

  const handleDeletePark = async (parkId) => {
    if (!confirm("Delete this park and all its trees?")) return;
    try {
      await parksApi.remove(parkId);
      setParks((prev) => prev.filter((p) => p.id !== parkId));
    } catch (err) {
      alert(getErrorMessage(err, "Could not delete park."));
    }
  };

  const handleDeleteTree = async (parkId, treeId) => {
    if (!confirm("Delete this tree and its history?")) return;
    try {
      await treesApi.remove(treeId);
      setTreesByPark((prev) => ({
        ...prev,
        [parkId]: prev[parkId].filter((t) => t.id !== treeId),
      }));
      setParks((prev) =>
        prev.map((p) => (p.id === parkId ? { ...p, tree_count: Math.max(0, (p.tree_count || 1) - 1) } : p))
      );
    } catch (err) {
      alert(getErrorMessage(err, "Could not delete tree."));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="font-mono text-xs text-[color:var(--moss)]">Manage</p>
        <h1 className="mt-2 font-display text-4xl text-[color:var(--mist)]">Parks &amp; trees</h1>
        <p className="mt-3 max-w-lg text-sm text-[color:var(--mist-dim)]">
          Add parks and register individual trees so they can be scanned and tracked over time.
        </p>
      </motion.div>

      <div className="mb-8 rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-5">
        <h2 className="mb-3 font-display text-lg text-[color:var(--mist)]">Add a park</h2>
        <ParkForm onCreated={(p) => setParks((prev) => [{ ...p, tree_count: 0 }, ...prev])} />
      </div>

      {loading && <p className="text-sm text-[color:var(--mist-dim)]">Loading parks…</p>}
      {error && <p className="text-sm text-[color:var(--clay)]">{error}</p>}

      <div className="space-y-3">
        {parks.map((park) => (
          <div key={park.id} className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)]">
            <button
              onClick={() => toggleExpand(park.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[color:var(--mist-dim)]" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--mist)]">{park.name}</p>
                  <p className="text-xs text-[color:var(--mist-dim)]">{park.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-[color:var(--mist-dim)]">
                  {park.tree_count ?? 0} trees
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePark(park.id);
                  }}
                  className="rounded-lg p-1.5 text-[color:var(--mist-dim)] hover:bg-[color:var(--clay)]/10 hover:text-[color:var(--clay)]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </button>

            <AnimatePresence>
              {expanded === park.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-[color:var(--line)]"
                >
                  <div className="space-y-2 p-5">
                    {(treesByPark[park.id] || []).map((tree) => (
                      <div
                        key={tree.id}
                        className="flex items-center justify-between rounded-xl bg-[color:var(--canopy-1)] px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <TreePine size={14} className="text-[color:var(--moss)]" />
                          <span className="text-sm text-[color:var(--mist)]">{tree.label}</span>
                          {tree.species && (
                            <span className="text-xs text-[color:var(--mist-dim)]">· {tree.species}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteTree(park.id, tree.id)}
                          className="rounded-lg p-1.5 text-[color:var(--mist-dim)] hover:bg-[color:var(--clay)]/10 hover:text-[color:var(--clay)]"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {(treesByPark[park.id] || []).length === 0 && (
                      <p className="text-xs text-[color:var(--mist-dim)]">No trees added yet.</p>
                    )}

                    {addingTreeFor === park.id ? (
                      <TreeForm
                        parkId={park.id}
                        onCreated={(tree) => handleTreeCreated(park.id, tree)}
                        onCancel={() => setAddingTreeFor(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setAddingTreeFor(park.id)}
                        className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--moss)] hover:underline"
                      >
                        <Plus size={14} /> Add a tree
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {!loading && parks.length === 0 && (
          <p className="text-sm text-[color:var(--mist-dim)]">No parks yet — add one above.</p>
        )}
      </div>
    </div>
  );
}
