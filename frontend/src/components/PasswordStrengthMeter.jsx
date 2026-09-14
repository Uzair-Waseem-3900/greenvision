import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "bg-gray-700", percentage: 0 };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  if (checks.length) score++;
  if (checks.hasUpper && checks.hasLower) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecial) score++;

  // Determine strength level
  let label = "Very Weak";
  let color = "#ef4444"; // red
  let percentage = 20;

  if (score === 1) {
    label = "Weak";
    color = "#f97316"; // orange
    percentage = 25;
  } else if (score === 2) {
    label = "Fair";
    color = "#eab308"; // yellow
    percentage = 50;
  } else if (score === 3) {
    label = "Good";
    color = "#84cc16"; // lime
    percentage = 75;
  } else if (score >= 4) {
    label = "Strong";
    color = "#10b981"; // emerald / moss
    percentage = 100;
  }

  return { score, label, color, percentage, checks };
}

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const { label, color, percentage, checks } = getPasswordStrength(password);

  const criteria = [
    { label: "At least 8 characters", valid: checks.length },
    { label: "Upper & lowercase letters", valid: checks.hasUpper && checks.hasLower },
    { label: "At least one number", valid: checks.hasNumber },
    { label: "Special character (!@#$...)", valid: checks.hasSpecial },
  ];

  return (
    <div className="mt-2 space-y-2">
      {/* Strength label and animated bar container */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[color:var(--mist-dim)] font-medium">Password strength:</span>
        <span className="font-semibold transition-colors duration-300" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Progress Bar Background */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--canopy-1)] border border-[color:var(--line-strong)]">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
        {criteria.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
            {item.valid ? (
              <Check size={12} className="text-[color:var(--moss)] shrink-0" />
            ) : (
              <X size={12} className="text-[color:var(--mist-dim)]/40 shrink-0" />
            )}
            <span className={item.valid ? "text-[color:var(--mist)]" : "text-[color:var(--mist-dim)]/60"}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
