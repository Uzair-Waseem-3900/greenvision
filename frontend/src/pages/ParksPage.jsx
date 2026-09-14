import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ClipboardList, MapPin, Pencil, Plus, Search, Trash2, TreePine, X } from "lucide-react";
import { parksApi, treesApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";

// Shared modal shell
function Modal({ onClose, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(6,14,8,0.78)", backdropFilter: "blur(8px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{    opacity: 0, y: 18, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 460, damping: 36 }}
        className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] shadow-2xl`}
        style={{ boxShadow: "0 0 0 1px var(--line-strong), 0 32px 80px rgba(0,0,0,0.55), 0 0 40px -8px rgba(143,203,110,0.08)" }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--moss)]/30 to-transparent" />
        {children}
      </motion.div>
    </motion.div>
  );
}

// Park modal — create OR edit
function ParkModal({ park, onDone, onClose }) {
  const isEdit = !!park;
  const [form, setForm] = useState({ name: park?.name ?? "", address: park?.address ?? "", description: park?.description ?? "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const res = isEdit ? await parksApi.update(park.id, form) : await parksApi.create(form);
      onDone(res.data);
    } catch (err) { setError(getErrorMessage(err, isEdit ? "Could not save park." : "Could not create park.")); }
    finally { setSubmitting(false); }
  };

  const inp = "rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none transition-colors focus:border-[color:var(--moss)]";

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-[color:var(--moss)]">{isEdit ? "Edit park" : "New park"}</p>
            <h2 className="mt-1 font-display text-2xl text-[color:var(--mist)]">{isEdit ? "Update park details" : "Add a park"}</h2>
          </div>
          <button type="button" onClick={onClose} className="mt-0.5 rounded-lg p-1.5 text-[color:var(--mist-dim)] transition-colors hover:bg-[color:var(--canopy-2)] hover:text-[color:var(--mist)]"><X size={17} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[color:var(--mist-dim)]">Park name <span className="text-[color:var(--clay)]">*</span></label>
            <input ref={firstRef} required placeholder="e.g. Riverside Park" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inp} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[color:var(--mist-dim)]">Address <span className="text-[color:var(--clay)]">*</span></label>
            <input required placeholder="e.g. 123 Green St" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={inp} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[color:var(--mist-dim)]">Description</label>
            <input placeholder="Optional notes" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inp} />
          </div>
          {error && <p className="text-xs text-[color:var(--clay)]">{error}</p>}
          <div className="mt-2 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-[color:var(--mist-dim)] transition-colors hover:bg-[color:var(--canopy-2)] hover:text-[color:var(--mist)]">Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={submitting} className="flex items-center gap-1.5 rounded-xl bg-[color:var(--moss)] px-5 py-2.5 text-sm font-semibold text-[#0b1a10] disabled:opacity-60">
              {isEdit ? <Pencil size={14} /> : <Plus size={15} />}
              {submitting ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save changes" : "Add park")}
            </motion.button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// Tree modal — add OR edit
function TreeModal({ tree, parkId, onDone, onClose }) {
  const isEdit = !!tree;
  const [form, setForm] = useState({ label: tree?.label ?? "", species: tree?.species ?? "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const res = isEdit ? await treesApi.update(tree.id, form) : await treesApi.create({ ...form, park_id: parkId });
      onDone(res.data);
    } catch (err) { setError(getErrorMessage(err, isEdit ? "Could not save tree." : "Could not add tree.")); }
    finally { setSubmitting(false); }
  };

  const inp = "rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none transition-colors focus:border-[color:var(--moss)]";

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-[color:var(--moss)]">{isEdit ? "Edit tree" : "New tree"}</p>
            <h2 className="mt-1 font-display text-2xl text-[color:var(--mist)]">{isEdit ? "Update tree details" : "Add a tree"}</h2>
          </div>
          <button type="button" onClick={onClose} className="mt-0.5 rounded-lg p-1.5 text-[color:var(--mist-dim)] transition-colors hover:bg-[color:var(--canopy-2)] hover:text-[color:var(--mist)]"><X size={17} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[color:var(--mist-dim)]">Tree label <span className="text-[color:var(--clay)]">*</span></label>
            <input ref={firstRef} required placeholder="e.g. White Oak #114" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className={inp} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[color:var(--mist-dim)]">Species</label>
            <input placeholder="e.g. Quercus alba (optional)" value={form.species} onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))} className={inp} />
          </div>
          {error && <p className="text-xs text-[color:var(--clay)]">{error}</p>}
          <div className="mt-2 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-[color:var(--mist-dim)] transition-colors hover:bg-[color:var(--canopy-2)] hover:text-[color:var(--mist)]">Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={submitting} className="flex items-center gap-1.5 rounded-xl bg-[color:var(--moss)] px-5 py-2.5 text-sm font-semibold text-[#0b1a10] disabled:opacity-60">
              {isEdit ? <Pencil size={14} /> : <Plus size={15} />}
              {submitting ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save changes" : "Add tree")}
            </motion.button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// Main page
export default function ParksPage() {
  const toast = useToast();
  const [parks, setParks] = useState([]);
  const [treesByPark, setTreesByPark] = useState({});
  const [treesLoadingByPark, setTreesLoadingByPark] = useState({});
  const [treeErrorsByPark, setTreeErrorsByPark] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);
  const [parkModal, setParkModal] = useState(null); // null | "create" | park object
  const [treeModal, setTreeModal] = useState(null); // null | { parkId, tree: null|object }
  const [confirm, setConfirm] = useState(null);

  const loadParks = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await parksApi.list({ search: search || undefined, page: 1, page_size: 50 });
      setParks(res.data.items);
    } catch (err) { setError(getErrorMessage(err, "Could not load parks.")); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { loadParks(); }, [loadParks]);

  const toggleExpand = async (parkId) => {
    if (expanded === parkId) { setExpanded(null); return; }
    setExpanded(parkId);
    if (!treesByPark[parkId]) {
      setTreesLoadingByPark((p) => ({ ...p, [parkId]: true }));
      setTreeErrorsByPark((p) => ({ ...p, [parkId]: "" }));
      try {
        const res = await treesApi.list({ park_id: parkId, page: 1, page_size: 50 });
        setTreesByPark((p) => ({ ...p, [parkId]: res.data.items }));
      } catch (err) {
        setTreeErrorsByPark((p) => ({ ...p, [parkId]: getErrorMessage(err, "Could not load trees.") }));
      } finally { setTreesLoadingByPark((p) => ({ ...p, [parkId]: false })); }
    }
  };

  const handleParkDone = (saved) => {
    const isEdit = parkModal !== "create";
    if (isEdit) {
      setParks((prev) => prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p)));
      toast.success("Park updated", `"${saved.name}" has been saved.`);
    } else {
      setParks((prev) => [{ ...saved, tree_count: 0 }, ...prev]);
      toast.success("Park added", `"${saved.name}" is now in your list.`);
    }
    setParkModal(null);
  };

  const handleDeletePark = (park) => {
    setConfirm({
      title: "Delete park?",
      description: `"${park.name}" and all its trees will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete park",
      onConfirm: async () => {
        setConfirm(null);
        try {
          await parksApi.remove(park.id);
          setParks((prev) => prev.filter((p) => p.id !== park.id));
          toast.success("Park deleted", `"${park.name}" has been removed.`);
        } catch (err) { toast.error("Delete failed", getErrorMessage(err, "Could not delete park.")); }
      },
    });
  };

  const handleTreeDone = (parkId, saved) => {
    const isEdit = !!treeModal?.tree;
    if (isEdit) {
      setTreesByPark((prev) => ({ ...prev, [parkId]: (prev[parkId] || []).map((t) => (t.id === saved.id ? saved : t)) }));
      toast.success("Tree updated", `"${saved.label}" has been saved.`);
    } else {
      setTreesByPark((prev) => ({ ...prev, [parkId]: [saved, ...(prev[parkId] || [])] }));
      setParks((prev) => prev.map((p) => (p.id === parkId ? { ...p, tree_count: (p.tree_count || 0) + 1 } : p)));
      toast.success("Tree added", `"${saved.label}" has been registered.`);
    }
    setTreeModal(null);
  };

  const handleDeleteTree = (parkId, tree) => {
    setConfirm({
      title: "Delete tree?",
      description: `"${tree.label}" and its entire scan history will be permanently removed.`,
      confirmLabel: "Delete tree",
      onConfirm: async () => {
        setConfirm(null);
        try {
          await treesApi.remove(tree.id);
          setTreesByPark((prev) => ({ ...prev, [parkId]: prev[parkId].filter((t) => t.id !== tree.id) }));
          setParks((prev) => prev.map((p) => (p.id === parkId ? { ...p, tree_count: Math.max(0, (p.tree_count || 1) - 1) } : p)));
          toast.success("Tree deleted", `"${tree.label}" has been removed.`);
        } catch (err) { toast.error("Delete failed", getErrorMessage(err, "Could not delete tree.")); }
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <ConfirmDialog open={!!confirm} title={confirm?.title} description={confirm?.description} confirmLabel={confirm?.confirmLabel} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />

      <AnimatePresence>
        {parkModal && <ParkModal key="park-modal" park={parkModal === "create" ? null : parkModal} onDone={handleParkDone} onClose={() => setParkModal(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {treeModal && <TreeModal key="tree-modal" tree={treeModal.tree} parkId={treeModal.parkId} onDone={(s) => handleTreeDone(treeModal.parkId, s)} onClose={() => setTreeModal(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="font-mono text-xs text-[color:var(--moss)]">Manage</p>
        <h1 className="mt-2 font-display text-4xl text-[color:var(--mist)]">Parks &amp; trees</h1>
        <p className="mt-3 max-w-lg text-sm text-[color:var(--mist-dim)]">Add parks and register individual trees so they can be scanned and tracked over time.</p>
      </motion.div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm text-[color:var(--mist-dim)]">Manage the parks in your community.</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} type="button" onClick={() => setParkModal("create")} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[color:var(--moss)] px-4 py-2.5 text-sm font-semibold text-[#0b1a10]">
          <Plus size={15} /> Add park
        </motion.button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-3.5 py-2.5">
        <Search size={14} className="text-[color:var(--mist-dim)]" />
        <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search parks by name or address…" className="w-full bg-transparent text-sm text-[color:var(--mist)] outline-none placeholder:text-[color:var(--mist-dim)]" />
      </div>

      {loading && <p className="text-sm text-[color:var(--mist-dim)]">Loading parks…</p>}
      {error && <p className="text-sm text-[color:var(--clay)]">{error}</p>}

      <div className="space-y-3">
        {parks.map((park) => (
          <div key={park.id} className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)]">
            <div className="flex items-center justify-between px-5 py-4">
              <button onClick={() => toggleExpand(park.id)} className="flex flex-1 items-center gap-3 text-left">
                <MapPin size={16} className="text-[color:var(--mist-dim)]" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--mist)]">{park.name}</p>
                  <p className="text-xs text-[color:var(--mist-dim)]">{park.address}</p>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <span className="mr-2 font-mono text-xs text-[color:var(--mist-dim)]">{park.tree_count ?? 0} trees</span>
                <Link to={`/parks/${park.id}/reports`} title="View all trees' latest scans" className="rounded-lg p-1.5 text-[color:var(--mist-dim)] hover:bg-[color:var(--canopy-1)] hover:text-[color:var(--moss)]"><ClipboardList size={15} /></Link>
                <button onClick={() => setParkModal(park)} className="rounded-lg p-1.5 text-[color:var(--mist-dim)] hover:bg-[color:var(--canopy-1)] hover:text-[color:var(--mist)]"><Pencil size={14} /></button>
                <button onClick={() => handleDeletePark(park)} className="rounded-lg p-1.5 text-[color:var(--mist-dim)] hover:bg-[color:var(--clay)]/10 hover:text-[color:var(--clay)]"><Trash2 size={14} /></button>
              </div>
            </div>

            <AnimatePresence>
              {expanded === park.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[color:var(--line)]">
                  <div className="space-y-2 p-5">
                    {treesLoadingByPark[park.id] && <p className="text-xs text-[color:var(--mist-dim)]">Loading trees…</p>}
                    {treeErrorsByPark[park.id] && <p className="text-xs text-[color:var(--clay)]">{treeErrorsByPark[park.id]}</p>}

                    {!treesLoadingByPark[park.id] && !treeErrorsByPark[park.id] && (treesByPark[park.id] || []).map((tree) => (
                      <div key={tree.id} className="flex items-center justify-between rounded-xl bg-[color:var(--canopy-1)] px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <TreePine size={14} className="text-[color:var(--moss)]" />
                          <span className="text-sm text-[color:var(--mist)]">{tree.label}</span>
                          {tree.species && <span className="text-xs text-[color:var(--mist-dim)]">· {tree.species}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Link to={`/trees/${tree.id}/reports`} title="View reports" className="rounded-lg p-1.5 text-[color:var(--mist-dim)] hover:bg-[color:var(--canopy-2)] hover:text-[color:var(--moss)]"><ClipboardList size={13} /></Link>
                          <button onClick={() => setTreeModal({ parkId: park.id, tree })} className="rounded-lg p-1.5 text-[color:var(--mist-dim)] hover:bg-[color:var(--canopy-2)] hover:text-[color:var(--mist)]"><Pencil size={13} /></button>
                          <button onClick={() => handleDeleteTree(park.id, tree)} className="rounded-lg p-1.5 text-[color:var(--mist-dim)] hover:bg-[color:var(--clay)]/10 hover:text-[color:var(--clay)]"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}

                    {!treesLoadingByPark[park.id] && !treeErrorsByPark[park.id] && treesByPark[park.id]?.length === 0 && (
                      <p className="text-xs text-[color:var(--mist-dim)]">No trees added yet.</p>
                    )}

                    <button onClick={() => setTreeModal({ parkId: park.id, tree: null })} className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--moss)] hover:underline">
                      <Plus size={14} /> Add a tree
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {!loading && parks.length === 0 && <p className="text-sm text-[color:var(--mist-dim)]">No parks match your search.</p>}
      </div>
    </div>
  );
}
