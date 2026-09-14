import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: { Icon: CheckCircle2, color: "var(--moss)",  bg: "rgba(95,168,69,0.12)"  },
  error:   { Icon: XCircle,      color: "var(--clay)",  bg: "rgba(209,106,74,0.12)" },
  info:    { Icon: Info,         color: "var(--sky)",   bg: "rgba(111,184,201,0.12)"},
  warning: { Icon: AlertTriangle,color: "var(--amber)", bg: "rgba(227,168,87,0.12)" },
};

function Toast({ id, type = "info", title, description, onDismiss }) {
  const { Icon, color, bg } = ICONS[type] ?? ICONS.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0,   scale: 1    }}
      exit={{    opacity: 0, y: -8,  scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className="relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-4 py-3.5 shadow-2xl"
      style={{ boxShadow: `0 0 0 1px var(--line-strong), 0 8px 32px rgba(0,0,0,0.45), 0 0 24px -4px ${color}22` }}
    >
      {/* colour accent bar on left */}
      <span
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: color }}
      />

      {/* icon */}
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
        style={{ background: bg }}
      >
        <Icon size={15} style={{ color }} />
      </span>

      {/* text */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold leading-snug text-[color:var(--mist)]">{title}</p>
        )}
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-[color:var(--mist-dim)]">{description}</p>
        )}
      </div>

      {/* dismiss */}
      <button
        onClick={() => onDismiss(id)}
        className="mt-0.5 shrink-0 rounded-lg p-1 text-[color:var(--mist-dim)] transition-colors hover:bg-[color:var(--canopy-3)] hover:text-[color:var(--mist)]"
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type, title, description, duration = 4000) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Convenience methods
  toast.success = (title, description, duration) => toast("success", title, description, duration);
  toast.error   = (title, description, duration) => toast("error",   title, description, duration);
  toast.info    = (title, description, duration) => toast("info",    title, description, duration);
  toast.warning = (title, description, duration) => toast("warning", title, description, duration);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Portal-style fixed container */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2.5 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
