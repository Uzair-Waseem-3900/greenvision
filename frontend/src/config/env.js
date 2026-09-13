/**
 * Single source of truth for environment/config values on the frontend.
 * Every other module imports `env` from here instead of touching
 * `import.meta.env` directly.
 */
const required = (key, value) => {
  if (!value) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing ${key} — check your .env file.`);
  }
  return value;
};

export const env = {
  apiBaseUrl: required("VITE_API_BASE_URL", import.meta.env.VITE_API_BASE_URL),
};
