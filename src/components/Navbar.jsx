import { NavLink } from "react-router-dom";
import { Leaf } from "lucide-react";

const links = [
  { to: "/", label: "Overview" },
  { to: "/scan", label: "Scan a Tree" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--canopy-0)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--moss-deep)]/20 text-[color:var(--moss)] transition-transform duration-300 group-hover:rotate-12">
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
          className="rounded-full bg-[color:var(--moss)] px-4 py-2 text-sm font-semibold text-[#0b1a10] transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98] sm:block hidden"
        >
          Try the demo
        </NavLink>
      </div>
    </header>
  );
}
