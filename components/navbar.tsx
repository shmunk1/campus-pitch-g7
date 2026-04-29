"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Inline SVG icons matching the design
const Ico = {
  plus: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.5l1.4 3.6L13 7.5l-3.6 1.4L8 12.5l-1.4-3.6L3 7.5l3.6-1.4L8 2.5z" />
    </svg>
  ),
};

export default function Navbar() {
  const pathname = usePathname();
  const screen = pathname === "/poster" ? "post" : pathname.startsWith("/demandes") ? "chat" : "feed";

  return (
    <>
      <header className="cp-topbar cpw-topbar">
        <div className="cp-topbar-left">
          <Link href="/" className="cp-logo">
            <span className="cp-logo-mark" aria-hidden="true">
              <span className="cp-logo-mark-1" />
              <span className="cp-logo-mark-2" />
            </span>
            <span className="cp-logo-text">Campus Pitch</span>
          </Link>
          <span className="cp-topbar-sep" aria-hidden="true">/</span>
          <span className="cp-campus">
            <span className="cp-campus-dot" />
            <span>Bordeaux</span>
          </span>
        </div>

        <nav className="cpw-nav">
          <Link href="/" className={"cp-nav-link " + (screen === "feed" ? "is-on" : "")}>
            Feed
          </Link>
          <Link href="/poster" className="cp-btn cp-btn--primary cp-btn--sm">
            <span className="cp-btn-ico">{Ico.plus}</span>
            <span>Nouvelle demande</span>
          </Link>
        </nav>
      </header>

      {/* Bottom nav mobile */}
      <nav className="cpw-bottomnav" aria-hidden="true">
        <Link href="/" className={screen === "feed" ? "is-on" : ""}>
          <span className="cp-bn-ico">{Ico.spark}</span>
          <span>Feed</span>
        </Link>
        <Link href="/poster" className={screen === "post" ? "is-on" : ""}>
          <span className="cp-bn-ico">{Ico.plus}</span>
          <span>Poster</span>
        </Link>
      </nav>
    </>
  );
}
