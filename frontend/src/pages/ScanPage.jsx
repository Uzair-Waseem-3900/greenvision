import { motion } from "framer-motion";
import ScanUploader from "../components/ScanUploader";

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 max-w-xl"
      >
        <p className="font-mono text-xs text-[color:var(--moss)]">Demo</p>
        <h1 className="mt-2 font-display text-4xl text-[color:var(--mist)]">
          Scan a tree
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--mist-dim)]">
          Upload any photo to preview the assessment experience. This demo
          runs a simulated pipeline and returns one of several sample
          results — it isn't reading your actual photo yet.
        </p>
      </motion.div>

      <ScanUploader />
    </div>
  );
}
