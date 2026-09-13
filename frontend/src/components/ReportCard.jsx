import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Gauge, ImageOff, MapPin, ScanLine } from "lucide-react";
import { statusMeta } from "../data/mockData";

const STATUS_LABEL = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

/**
 * Renders scan details immediately regardless of image load state — the
 * photo fades in over its own `<img onLoad>` once the browser has it, so
 * the card never blocks on network for the picture.
 */
function ScanPhoto({ imageUrl, alt }) {
  const [loaded, setLoaded] = useState(false);

  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[color:var(--canopy-1)]">
        <ImageOff size={22} className="text-[color:var(--mist-dim)]" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[color:var(--canopy-1)]">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-[color:var(--canopy-3)]/40" />}
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default function ReportCard({
  imageUrl,
  title,
  severity,
  status,
  confidence,
  notes,
  actionTaken,
  treeLabel,
  parkName,
  timestamp,
  neverScanned = false,
  onScanNow,
  onClick,
}) {
  const meta = severity ? statusMeta[severity] : null;
  const Icon = severity === "healthy" ? CheckCircle2 : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      onClick={onClick}
      className={`flex overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] ${
        onClick ? "cursor-pointer transition-colors hover:border-[color:var(--line-strong)]" : ""
      }`}
    >
      <div className="w-32 shrink-0 sm:w-44">
        <ScanPhoto imageUrl={imageUrl} alt={treeLabel || "Tree scan"} />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {treeLabel && (
            <span className="text-sm font-semibold text-[color:var(--mist)]">{treeLabel}</span>
          )}
          {parkName && (
            <span className="flex items-center gap-1 text-xs text-[color:var(--mist-dim)]">
              <MapPin size={11} /> {parkName}
            </span>
          )}
        </div>

        {neverScanned ? (
          <>
            <p className="text-sm text-[color:var(--mist-dim)]">Not scanned yet</p>
            {onScanNow && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScanNow();
                }}
                className="mt-1.5 flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--moss)] px-3.5 py-1.5 text-xs font-semibold text-[#0b1a10] transition-transform hover:scale-[1.03] active:scale-95"
              >
                <ScanLine size={12} /> Scan now
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {meta && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <Icon size={11} />
                  {meta.label}
                </span>
              )}
              {status && (
                <span className="rounded-full bg-[color:var(--canopy-1)] px-2.5 py-1 text-xs text-[color:var(--mist-dim)]">
                  {STATUS_LABEL[status] || status}
                </span>
              )}
              {typeof confidence === "number" && (
                <span className="flex items-center gap-1 text-xs text-[color:var(--mist-dim)]">
                  <Gauge size={11} /> {confidence}%
                </span>
              )}
            </div>

            {title && <p className="text-sm font-medium text-[color:var(--mist)]">{title}</p>}
            {notes && (
              <p className="line-clamp-2 text-xs leading-relaxed text-[color:var(--mist-dim)]">{notes}</p>
            )}
            {actionTaken && (
              <p className="text-xs text-[color:var(--sky)]">
                <span className="font-medium">Action: </span>
                {actionTaken}
              </p>
            )}
            {timestamp && (
              <p className="mt-0.5 font-mono text-[11px] text-[color:var(--mist-dim)]">{timestamp}</p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
