import { TITLE_COMMON } from "@/lib/constants";
import Link from "next/link";
import InstallButton from "./InstallButton";

const Footer = () => {
  return (
    <footer className="bg-slate-900" aria-label="Site footer">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-6 py-4 text-xs">
        <p className="text-xs text-slate-300">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-slate-200">{TITLE_COMMON}</span>
        </p>

        <div className="flex items-center gap-3">
          <Link href="/about" className="text-slate-300 transition-colors hover:text-slate-200!">
            About
          </Link>
          <InstallButton />
          <a
            href="https://www.facebook.com/profile.php?id=61586585781960"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit our Facebook page"
            className="text-slate-300 transition-colors hover:text-slate-200!"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17 2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3.1l.9-4H13V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
