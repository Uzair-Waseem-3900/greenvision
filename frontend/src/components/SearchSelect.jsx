import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { useDebouncedValue } from "../lib/useDebouncedValue";

/**
 * A combobox backed by a server-side search endpoint instead of a static
 * dropdown — built for lists that can't reasonably be loaded in full
 * (parks, trees, ...). `fetchOptions(query)` is called with the debounced
 * search text and must return an array of `{ id, label, sublabel? }`.
 */
export default function SearchSelect({
  value,
  onChange,
  fetchOptions,
  placeholder = "Search…",
  disabled = false,
  emptyLabel = "No results",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetchOptions(debouncedQuery)
      .then((results) => {
        if (!cancelled) setOptions(results);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open, fetchOptions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-3.5 py-2.5 text-left text-sm text-[color:var(--mist)] outline-none transition-colors focus:border-[color:var(--moss)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={value ? "text-[color:var(--mist)]" : "text-[color:var(--mist-dim)]"}>
          {value ? value.label : placeholder}
        </span>
        <div className="flex items-center gap-1.5">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="rounded-full p-0.5 text-[color:var(--mist-dim)] hover:text-[color:var(--mist)]"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={15} className="text-[color:var(--mist-dim)]" />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-[color:var(--line)] px-3 py-2.5">
              <Search size={14} className="shrink-0 text-[color:var(--mist-dim)]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search…"
                className="w-full bg-transparent text-sm text-[color:var(--mist)] outline-none placeholder:text-[color:var(--mist-dim)]"
              />
              {loading && <Loader2 size={14} className="shrink-0 animate-spin text-[color:var(--moss)]" />}
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {!loading && options.length === 0 && (
                <p className="px-3.5 py-3 text-sm text-[color:var(--mist-dim)]">{emptyLabel}</p>
              )}
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm text-[color:var(--mist)] transition-colors hover:bg-[color:var(--canopy-2)]"
                >
                  <span>
                    {option.label}
                    {option.sublabel && (
                      <span className="ml-1.5 text-xs text-[color:var(--mist-dim)]">{option.sublabel}</span>
                    )}
                  </span>
                  {value?.id === option.id && <Check size={14} className="text-[color:var(--moss)]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
