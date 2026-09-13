// dashboardStats is illustrative marketing copy for the public landing page
// (shown to logged-out visitors) — it is not wired to the API. statusMeta is
// shared static config (label + color per health level) used across the
// real, API-backed dashboard/scan components.

export const dashboardStats = {
  treesMonitored: 214,
  imagesAnalyzed: 587,
  healthy: 132,
  mildStress: 61,
  highStress: 21,
  parksCovered: 6,
};

export const statusMeta = {
  healthy: { label: "Healthy", color: "var(--moss)", bg: "rgba(143,203,110,0.12)" },
  mild: { label: "Mild Stress", color: "var(--amber)", bg: "rgba(227,168,87,0.12)" },
  high: { label: "High Stress", color: "var(--clay)", bg: "rgba(209,106,74,0.12)" },
};
