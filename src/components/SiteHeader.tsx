import Link from "next/link";
import { KIDS, kidLabel, type KidId } from "@/lib/kids";

type SiteHeaderProps = {
  active?: "today" | "history";
  kid: KidId;
};

export function SiteHeader({ active = "today", kid }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link href={`/?kid=${kid}`} className="brand-mark" aria-label="Focus Day home">
        Focus Day
      </Link>
      <div className="header-controls">
        <nav className="kid-switch" aria-label="Choose student">
          {KIDS.map((entry) => (
            <Link
              key={entry.id}
              href={active === "history" ? `/history?kid=${entry.id}` : `/?kid=${entry.id}`}
              className={entry.id === kid ? "kid-chip is-active" : "kid-chip"}
            >
              {entry.label}
            </Link>
          ))}
        </nav>
        <nav className="site-nav" aria-label="Main">
          <Link
            href={`/?kid=${kid}`}
            className={active === "today" ? "nav-link is-active" : "nav-link"}
          >
            Today
          </Link>
          <Link
            href={`/history?kid=${kid}`}
            className={active === "history" ? "nav-link is-active" : "nav-link"}
          >
            Past days
          </Link>
        </nav>
      </div>
      <p className="sr-only">Showing focus for {kidLabel(kid)}</p>
    </header>
  );
}
