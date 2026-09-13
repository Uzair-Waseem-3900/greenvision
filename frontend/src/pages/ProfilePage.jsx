import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password && password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (password && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      const payload = { full_name: fullName };
      if (password) payload.password = password;
      await usersApi.update(user.id, payload);
      await refreshUser();
      setPassword("");
      setConfirmPassword("");
      setMessage("Profile updated.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not update your profile."));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-mono text-xs text-[color:var(--moss)]">Account</p>
        <h1 className="mt-2 font-display text-3xl text-[color:var(--mist)]">Your profile</h1>
        <p className="mt-2 text-sm text-[color:var(--mist-dim)]">{user.email}</p>
      </motion.div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-[color:var(--line)] bg-[color:var(--canopy-2)] p-6"
      >
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[color:var(--mist-dim)]">
            <UserIcon size={12} /> Full name
          </label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)]"
          />
        </div>

        <div className="border-t border-[color:var(--line)] pt-5">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-[color:var(--mist-dim)]">
            <KeyRound size={12} /> Change password (optional)
          </p>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)]"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--canopy-1)] px-3.5 py-2.5 text-sm text-[color:var(--mist)] outline-none focus:border-[color:var(--moss)]"
            />
          </div>
        </div>

        {error && <p className="text-xs text-[color:var(--clay)]">{error}</p>}
        {message && <p className="text-xs text-[color:var(--moss)]">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-[color:var(--moss)] px-4 py-2.5 text-sm font-semibold text-[#0b1a10] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
