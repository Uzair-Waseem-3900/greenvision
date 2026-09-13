import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const publicLinks = [{ to: "/", label: "Overview" }];

const privateLinks = [
  { to: "/", label: "Overview" },
  { to: "/parks", label: "Parks" },
  { to: "/scan", label: "Scan a Tree" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = user ? privateLinks : publicLinks;

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
              end={l.to === "/"}
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

        {user ? (
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-sm text-[color:var(--mist-dim)]">{user.full_name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-[color:var(--line-strong)] px-3.5 py-2 text-sm font-medium text-[color:var(--mist)] transition-colors hover:bg-[color:var(--canopy-2)]"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <NavLink
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-[color:var(--mist-dim)] transition-colors hover:text-[color:var(--mist)]"
            >
              Log in
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-full bg-[color:var(--moss)] px-4 py-2 text-sm font-semibold text-[#0b1a10] transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]"
            >
              Register
            </NavLink>
          </div>
        )}

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
                  end={l.to === "/"}
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
              {user ? (
                <button
                  onClick={handleLogout}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-[color:var(--line-strong)] px-3 py-2.5 text-sm font-medium text-[color:var(--mist)]"
                >
                  <LogOut size={14} /> Log out
                </button>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="rounded-xl px-3 py-2.5 text-center text-sm font-medium text-[color:var(--mist-dim)]"
                  >
                    Log in
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="mt-1 rounded-xl bg-[color:var(--moss)] px-3 py-2.5 text-center text-sm font-semibold text-[#0b1a10]"
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
