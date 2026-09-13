import { Github, Linkedin, Globe, Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--canopy-1)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Leaf size={16} className="text-[color:var(--moss)]" />
              <span className="font-display text-base text-[color:var(--mist)]">GreenVision</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--mist-dim)]">
              AI-powered tree health monitoring for community parks —
              upload a photo, get an instant assessment, and track canopy
              health across your parks over time.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-[color:var(--mist-dim)]">
              Built by
            </p>
            <p className="mt-2 font-display text-lg text-[color:var(--mist)]">
              Uzair Waseem
            </p>
            <div className="mt-3 flex items-center gap-4">
              <a
                href="https://github.com/Uzair-Waseem-390/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-[color:var(--mist-dim)] transition-colors hover:text-[color:var(--moss)]"
              >
                <Github size={15} /> GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/uzair-waseem-digital/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-[color:var(--mist-dim)] transition-colors hover:text-[color:var(--moss)]"
              >
                <Linkedin size={15} /> LinkedIn
              </a>
              <a
                href="https://uzair-waseem.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-[color:var(--mist-dim)] transition-colors hover:text-[color:var(--moss)]"
              >
                <Globe size={15} /> Portfolio
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-4 border-t border-[color:var(--line)] pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-[color:var(--mist-dim)]">
            Scan results are AI-generated assessments — use your judgment for anything urgent.
          </p>
          <p className="font-mono text-xs text-[color:var(--mist-dim)]">
            © {new Date().getFullYear()} GreenVision
          </p>
        </div>
      </div>
    </footer>
  );
}
