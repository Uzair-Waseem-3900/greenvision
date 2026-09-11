import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, LayoutDashboard, TreePine, ArrowUpRight } from "lucide-react";
import { dashboardStats } from "../data/mockData";

const steps = [
  {
    icon: Camera,
    title: "Upload a photo",
    text: "Snap or upload a picture of any tree or plant in the park.",
  },
  {
    icon: TreePine,
    title: "AI reads the canopy",
    text: "Computer vision checks leaf color, density, and structure.",
  },
  {
    icon: LayoutDashboard,
    title: "Get a clear verdict",
    text: "See a health status, likely cause, and a suggested action.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="canopy-field grain relative overflow-hidden border-b border-[color:var(--line)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:gap-12 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="font-mono text-xs text-[color:var(--moss)]">
              Community park &amp; tree health monitor
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.08] text-[color:var(--mist)] sm:text-5xl lg:text-6xl">
              See what your
              <br />
              trees are telling you.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[color:var(--mist-dim)] sm:mt-6 sm:text-base">
              Upload a photo of a tree or plant and GreenVision reads its
              canopy for signs of stress — then tells you what's happening
              and what to do about it.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4 sm:mt-8">
              <Link
                to="/scan"
                className="group flex items-center gap-2 rounded-full bg-[color:var(--moss)] px-6 py-3 text-sm font-semibold text-[#0b1a10] transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              >
                Scan a tree
                <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-[color:var(--mist-dim)] transition-colors hover:text-[color:var(--mist)]"
              >
                View the park dashboard →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative flex h-60 w-60 items-center justify-center rounded-full border border-[color:var(--line-strong)] sm:h-80 sm:w-80">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, rgba(143,203,110,0.5) 15%, transparent 30%)",
                }}
              />
              <div className="flex h-48 w-48 flex-col items-center justify-center rounded-full bg-[color:var(--canopy-1)] text-center sm:h-64 sm:w-64">
                <span className="font-display text-3xl text-[color:var(--mist)] sm:text-4xl">
                  {Math.round((dashboardStats.healthy / dashboardStats.treesMonitored) * 100)}%
                </span>
                <span className="mt-1 max-w-[140px] text-xs text-[color:var(--mist-dim)]">
                  of monitored trees currently rated healthy
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl text-[color:var(--mist)]">How it works</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--moss-deep)]/15 text-[color:var(--moss)]">
                <s.icon size={18} />
              </div>
              <h3 className="mt-4 font-display text-lg text-[color:var(--mist)]">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--mist-dim)]">
                {s.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact strip */}
      <section className="border-y border-[color:var(--line)] bg-[color:var(--canopy-1)]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:grid-cols-4 sm:gap-8 sm:px-6 sm:py-14">
          {[
            [dashboardStats.treesMonitored, "Trees monitored"],
            [dashboardStats.imagesAnalyzed, "Images analyzed"],
            [dashboardStats.parksCovered, "Parks covered"],
            [dashboardStats.highStress, "Flagged for review"],
          ].map(([val, label], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <p className="font-display text-3xl text-[color:var(--mist)]">{val}</p>
              <p className="mt-1 text-xs text-[color:var(--mist-dim)]">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
