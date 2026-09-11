import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Overview" },
  { to: "/scan", label: "Scan a Tree" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--canopy-0)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">
        <NavLink to="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--moss-deep)]/20 text-[color:var(--moss)] transition-transform duration-300 group-hover:rotate-12">
            <Leaf size={16} strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg tracking-tight text-[color:var(--mist)]">
            GreenVision
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-[color:var(--canopy-3)] text-[color:var(--mist)]"
                    : "text-[color:var(--mist-dim)] hover:text-[color:var(--mist)]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/scan"
          className="hidden rounded-full bg-[color:var(--moss)] px-4 py-2 text-sm font-semibold text-[#0b1a10] transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98] sm:block"
        >
          Try the demo
        </NavLink>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--mist)] transition-colors hover:bg-[color:var(--canopy-2)] sm:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-[color:var(--line)] bg-[color:var(--canopy-0)] sm:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-[color:var(--canopy-3)] text-[color:var(--mist)]"
                        : "text-[color:var(--mist-dim)] hover:text-[color:var(--mist)]"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <NavLink
                to="/scan"
                className="mt-1 rounded-xl bg-[color:var(--moss)] px-3 py-2.5 text-center text-sm font-semibold text-[#0b1a10]"
              >
                Try the demo
              </NavLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
