import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, UserPlus } from "lucide-react";
import { useAuth, getErrorMessage } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register(fullName, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="canopy-field flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm rounded-3xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-8"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--moss-deep)]/20 text-[color:var(--moss)]">
            <Leaf size={17} />
          </span>
          <span className="font-display text-xl text-[color:var(--mist)]">GreenVision</span>
        </div>

        <h1 className="font-display text-2xl text-[color:var(--mist)]">Create your account</h1>
        <p className="mt-1 text-sm text-[color:var(--mist-dim)]">
          Join the community monitoring effort.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--mist-dim)]">
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none transition-colors focus:border-[color:var(--moss)]"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--mist-dim)]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none transition-colors focus:border-[color:var(--moss)]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--mist-dim)]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none transition-colors focus:border-[color:var(--moss)]"
              placeholder="At least 8 characters"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[color:var(--clay)]/10 px-3 py-2 text-xs text-[color:var(--clay)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--moss)] px-4 py-2.5 text-sm font-semibold text-[#0b1a10] transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            <UserPlus size={15} />
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--mist-dim)]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[color:var(--moss)] hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
