import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";

/**
 * Premium animated confirm dialog.
 *
 * Props:
 *   open        – boolean controlling visibility
 *   title       – heading text
 *   description – body text
 *   confirmLabel  – text on the danger button  (default "Delete")
 *   cancelLabel   – text on the cancel button  (default "Cancel")
 *   variant     – "danger" | "warning"         (default "danger")
 *   onConfirm   – called when user confirms
 *   onCancel    – called when user cancels / closes
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  // Auto-focus cancel (safest default) and trap Escape
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  // Lock scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const accentColor = variant === "danger" ? "var(--clay)" : "var(--amber)";
  const accentBg    = variant === "danger" ? "rgba(209,106,74,0.12)" : "rgba(227,168,87,0.12)";
  const Icon        = variant === "danger" ? Trash2 : AlertTriangle;

  return (
    <AnimatePresence>
      {open && (
        // Backdrop
        <motion.div
          key="confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(6,14,8,0.78)", backdropFilter: "blur(8px)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          {/* Panel */}
          <motion.div
            key="confirm-panel"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.94,  y: 12 }}
            transition={{ type: "spring", stiffness: 480, damping: 36 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] shadow-2xl"
            style={{
              boxShadow: `0 0 0 1px var(--line-strong), 0 24px 64px rgba(0,0,0,0.6), 0 0 48px -8px ${accentColor}33`,
            }}
          >
            {/* Top colour wash */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)` }}
            />

            <div className="p-6">
              {/* Icon + heading */}
              <div className="mb-4 flex items-start gap-4">
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28, delay: 0.06 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: accentBg }}
                >
                  <Icon size={20} style={{ color: accentColor }} />
                </motion.span>
                <div className="pt-0.5">
                  <h2 className="font-display text-xl text-[color:var(--mist)]">{title}</h2>
                  {description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--mist-dim)]">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="mb-5 h-px bg-[color:var(--line)]" />

              {/* Actions */}
              <div className="flex justify-end gap-2.5">
                <motion.button
                  ref={cancelRef}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-2)] px-5 py-2.5 text-sm font-medium text-[color:var(--mist-dim)] transition-colors hover:border-[color:var(--mist-dim)] hover:text-[color:var(--mist)]"
                >
                  {cancelLabel}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onConfirm}
                  className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    background: accentBg,
                    border: `1px solid ${accentColor}55`,
                    color: accentColor,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = accentBg.replace("0.12", "0.22"); }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = accentBg; }}
                >
                  <Icon size={14} />
                  {confirmLabel}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
