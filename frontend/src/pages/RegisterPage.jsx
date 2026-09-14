import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, UserPlus, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { useAuth, getErrorMessage } from "../context/AuthContext";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      // Send ONLY fullName, email, and password to backend
      await register(fullName, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 pr-10 text-sm text-[color:var(--mist)] outline-none transition-colors focus:border-[color:var(--moss)]"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--mist-dim)] hover:text-[color:var(--mist)] transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Animated Password Strength Bar */}
            <PasswordStrengthMeter password={password} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--mist-dim)]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-xl border bg-[color:var(--canopy-1)] px-3.5 py-2.5 pr-10 text-sm text-[color:var(--mist)] outline-none transition-colors focus:border-[color:var(--moss)] ${
                  passwordsMismatch
                    ? "border-[color:var(--clay)]"
                    : passwordsMatch
                    ? "border-[color:var(--moss)]"
                    : "border-[color:var(--line-strong)]"
                }`}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--mist-dim)] hover:text-[color:var(--mist)] transition-colors focus:outline-none"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-[color:var(--clay)]">
                <AlertCircle size={12} /> Passwords do not match
              </p>
            )}
            {passwordsMatch && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-[color:var(--moss)]">
                <Check size={12} /> Passwords match
              </p>
            )}
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

