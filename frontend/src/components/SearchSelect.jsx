import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Search, X } from "lucide-react";
import { useDebouncedValue } from "../lib/useDebouncedValue";

export default function SearchSelect({
  value,
  onChange,
  fetchOptions,
  placeholder = "Search…",
  disabled = false,
  emptyLabel = "No results",
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 300);

  // Only fire a backend search when the user has actually typed something
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setOptions([]);
      setShowDropdown(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setShowDropdown(true);
    fetchOptions(debouncedQuery)
      .then((results) => {
        if (!cancelled) setOptions(results);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, fetchOptions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setQuery("");
    setOptions([]);
    setShowDropdown(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setOptions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center gap-2 rounded-xl border bg-[color:var(--canopy-2)] px-3.5 py-2.5 transition-colors ${
          disabled
            ? "cursor-not-allowed border-[color:var(--line)] opacity-50"
            : "border-[color:var(--line-strong)] focus-within:border-[color:var(--moss)]"
        }`}
      >
        <Search size={14} className="shrink-0 text-[color:var(--mist-dim)]" />

        {/* Show selected value as a chip; otherwise show the text input */}
        {value ? (
          <span className="flex-1 truncate text-sm text-[color:var(--mist)]">{value.label}</span>
        ) : (
          <input
            ref={inputRef}
            disabled={disabled}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim() && options.length > 0) setShowDropdown(true);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-[color:var(--mist)] outline-none placeholder:text-[color:var(--mist-dim)] disabled:cursor-not-allowed"
          />
        )}

        <div className="flex shrink-0 items-center gap-1">
          {loading && <Loader2 size={13} className="animate-spin text-[color:var(--moss)]" />}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 text-[color:var(--mist-dim)] hover:text-[color:var(--mist)]"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] shadow-2xl"
          >
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
