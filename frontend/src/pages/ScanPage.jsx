import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FileImage, Info } from "lucide-react";
import ScanUploader from "../components/ScanUploader";
import SearchSelect from "../components/SearchSelect";
import { parksApi, treesApi } from "../lib/api";

export default function ScanPage() {
  const location = useLocation();
  const [selectedPark, setSelectedPark] = useState(location.state?.presetPark || null);
  const [selectedTree, setSelectedTree] = useState(location.state?.presetTree || null);

  const fetchParks = useCallback(async (query) => {
    const res = await parksApi.list({ search: query || undefined, page: 1, page_size: 20 });
    return res.data.items.map((p) => ({ id: p.id, label: p.name, sublabel: p.address }));
  }, []);

  const fetchTrees = useCallback(
    async (query) => {
      if (!selectedPark) return [];
      const res = await treesApi.list({
        park_id: selectedPark.id,
        search: query || undefined,
        page: 1,
        page_size: 20,
      });
      return res.data.items.map((t) => ({
        id: t.id,
        label: t.label,
        sublabel: t.species || undefined,
      }));
    },
    [selectedPark]
  );

  const handleParkChange = (park) => {
    setSelectedPark(park);
    setSelectedTree(null);
  };

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
          Search for the park and tree first — every scan has to be tied to
          a specific tree so its history stays accurate.
        </p>
      </motion.div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[color:var(--mist-dim)]">
            Park <span className="text-[color:var(--clay)]">*</span>
          </label>
          <SearchSelect
            value={selectedPark}
            onChange={handleParkChange}
            fetchOptions={fetchParks}
            placeholder="Search for a park…"
            emptyLabel="No parks found — add one on the Parks page"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[color:var(--mist-dim)]">
            Tree <span className="text-[color:var(--clay)]">*</span>
          </label>
          <SearchSelect
            value={selectedTree}
            onChange={setSelectedTree}
            fetchOptions={fetchTrees}
            disabled={!selectedPark}
            placeholder={selectedPark ? "Search for a tree…" : "Select a park first"}
            emptyLabel="No trees found in this park"
          />
        </div>
      </div>

      <div className="mb-8 flex items-start gap-2.5 rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-4">
        <Info size={15} className="mt-0.5 shrink-0 text-[color:var(--sky)]" />
        <div className="text-xs leading-relaxed text-[color:var(--mist-dim)]">
          <p className="flex items-center gap-1.5 font-medium text-[color:var(--mist)]">
            <FileImage size={13} /> Photos must be .webp
          </p>
          <p className="mt-1">
            For clear, consistent results: take the photo in good daylight,
            fill the frame with the tree's canopy and leaves, and avoid
            heavy shadows or blur. If your photo isn't already a .webp file,
            search "webp converter" online — there are several free tools
            that convert JPG/PNG to WebP in seconds — then upload the
            converted file here.
          </p>
        </div>
      </div>

      <ScanUploader treeId={selectedTree?.id || null} />
    </div>
  );
}
