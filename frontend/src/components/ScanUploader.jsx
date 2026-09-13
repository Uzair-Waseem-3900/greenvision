import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, ScanLine, RotateCcw, ImageIcon } from "lucide-react";
import { aiApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";
import ResultPanel from "./ResultPanel";

const STAGES = [
  "Uploading image",
  "Reading canopy & leaf structure",
  "Comparing against species baseline",
  "Scoring stress indicators",
];

const MIN_STAGE_MS = 700; // keeps the animation from flashing by too fast

export default function ScanUploader({ treeId }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [stage, setStage] = useState(-1); // -1 idle, 0..3 processing, 4 done, 5 error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const runAnalysis = useCallback(
    async (file) => {
      if (!treeId) {
        setError("Select a tree above before uploading a photo.");
        return;
      }

      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResult(null);
      setError("");
      setStage(0);

      // Advance the visual stages on a timer purely for pacing/feedback —
      // the real work happens in the API call below, in parallel.
      const stageTimers = STAGES.slice(1).map((_, i) =>
        setTimeout(() => setStage((s) => (s < i + 1 ? i + 1 : s)), MIN_STAGE_MS * (i + 1))
      );

      const startedAt = Date.now();

      try {
        const res = await aiApi.analyze(treeId, file);
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_STAGE_MS * STAGES.length - elapsed);
        await new Promise((resolve) => setTimeout(resolve, remaining));

        setResult(res.data);
        setStage(4);
      } catch (err) {
        setError(getErrorMessage(err, "Analysis failed. Please try again."));
        setStage(5);
      } finally {
        stageTimers.forEach(clearTimeout);
      }
    },
    [treeId]
  );

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    runAnalysis(file);
  };

  const reset = () => {
    setImageUrl(null);
    setStage(-1);
    setResult(null);
    setError("");
  };

  const isProcessing = stage >= 0 && stage < 4;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Upload / preview panel */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-3xl border transition-colors duration-300 sm:min-h-[420px] ${
          dragOver
            ? "border-[color:var(--moss)] bg-[color:var(--canopy-3)]/40"
            : "border-[color:var(--line-strong)] bg-[color:var(--canopy-2)]"
        }`}
      >
        {!imageUrl && (
          <div className="flex flex-col items-center px-8 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--moss-deep)]/15 text-[color:var(--moss)]">
              <UploadCloud size={26} />
            </div>
            <h3 className="font-display text-xl text-[color:var(--mist)]">
              Upload a photo of a tree or plant
            </h3>
            <p className="mt-2 max-w-xs text-sm text-[color:var(--mist-dim)]">
              Drag a JPG or PNG here, or choose a file. It'll be sent to the
              AI pipeline for a live assessment.
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-6 rounded-full bg-[color:var(--moss)] px-5 py-2.5 text-sm font-semibold text-[#0b1a10] transition-transform duration-200 hover:scale-[1.04] active:scale-95"
            >
              Choose a photo
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {error && <p className="mt-4 text-xs text-[color:var(--clay)]">{error}</p>}
          </div>
        )}

        {imageUrl && (
          <div className="relative h-full w-full">
            <img
              src={imageUrl}
              alt="Uploaded tree for analysis"
              className="h-[320px] w-full object-cover sm:h-[420px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--canopy-0)]/80 via-transparent to-transparent" />

            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[color:var(--canopy-0)]/55 backdrop-blur-[2px]"
                >
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <motion.div
                      className="absolute inset-0 rounded-full ring-scan"
                      style={{ padding: 2 }}
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                    >
                      <div className="h-full w-full rounded-full bg-[color:var(--canopy-0)]" />
                    </motion.div>
                    <ScanLine size={26} className="relative text-[color:var(--moss)]" />
                  </div>

                  <div className="mt-6 w-64">
                    {STAGES.map((s, i) => (
                      <div key={s} className="mb-2 flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                            i <= stage ? "bg-[color:var(--moss)]" : "bg-[color:var(--canopy-3)]"
                          }`}
                        />
                        <span
                          className={`font-mono text-xs transition-colors duration-300 ${
                            i <= stage ? "text-[color:var(--mist)]" : "text-[color:var(--mist-dim)]"
                          }`}
                        >
                          {s}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {(stage === 4 || stage === 5) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)]/90 px-4 py-3 backdrop-blur"
              >
                <div className="flex items-center gap-2">
                  {result && (
                    <>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background:
                            result.level === "healthy"
                              ? "var(--moss)"
                              : result.level === "mild"
                              ? "var(--amber)"
                              : "var(--clay)",
                        }}
                      />
                      <span className="text-sm font-semibold text-[color:var(--mist)]">
                        {result.status}
                      </span>
                    </>
                  )}
                  {stage === 5 && (
                    <span className="text-sm font-semibold text-[color:var(--clay)]">
                      Analysis failed
                    </span>
                  )}
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--mist-dim)] transition-colors hover:text-[color:var(--mist)]"
                >
                  <RotateCcw size={13} /> Try another
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Result / info panel */}
      <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-6">
        <AnimatePresence mode="wait">
          {!imageUrl && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[360px] flex-col items-center justify-center text-center"
            >
              <ImageIcon size={28} className="mb-3 text-[color:var(--mist-dim)]" />
              <p className="max-w-[220px] text-sm text-[color:var(--mist-dim)]">
                Your assessment will appear here once a photo is uploaded.
              </p>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[360px] flex-col justify-center gap-3"
            >
              <p className="font-mono text-xs uppercase tracking-wide text-[color:var(--moss)]">
                Running assessment
              </p>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3 w-full overflow-hidden rounded-full bg-[color:var(--canopy-3)]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--moss-deep)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${60 + i * 15}%` }}
                    transition={{ duration: 1.2 + i * 0.3, ease: "easeInOut" }}
                  />
                </div>
              ))}
            </motion.div>
          )}

          {stage === 4 && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <ResultPanel result={result} />
            </motion.div>
          )}

          {stage === 5 && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full min-h-[360px] flex-col items-center justify-center text-center"
            >
              <p className="text-sm text-[color:var(--clay)]">{error}</p>
              <button
                onClick={reset}
                className="mt-4 rounded-full border border-[color:var(--line-strong)] px-4 py-2 text-xs font-medium text-[color:var(--mist)] hover:bg-[color:var(--canopy-1)]"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
