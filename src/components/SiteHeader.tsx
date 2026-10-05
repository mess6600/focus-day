import Link from "next/link";
import { boardHref, KIDS, kidLabel, startPageHref, type KidId } from "@/lib/kids";

type SiteHeaderProps = {
  active?: "today" | "history";
  kid: KidId;
};

export function SiteHeader({ active = "today", kid }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link href={startPageHref} className="brand-mark" aria-label="Focus Day home — choose student">
        Focus Day
      </Link>
      <div className="header-controls">
        <nav className="kid-switch" aria-label="Choose student">
          {KIDS.map((entry) => (
            <Link
              key={entry.id}
              href={active === "history" ? `/history?kid=${entry.id}` : boardHref(entry.id)}
              className={entry.id === kid ? "kid-chip is-active" : "kid-chip"}
              aria-current={entry.id === kid ? "page" : undefined}
            >
              {entry.label}
            </Link>
          ))}
        </nav>
        <nav className="site-nav" aria-label="Main">
          <Link
            href={boardHref(kid)}
            className={active === "today" ? "nav-link is-active" : "nav-link"}
          >
            Board
          </Link>
          <Link
            href={`/history?kid=${kid}`}
            className={active === "history" ? "nav-link is-active" : "nav-link"}
          >
            Past days
          </Link>
          <Link href={startPageHref} className="nav-link">
            Home
          </Link>
        </nav>
      </div>
      <p className="sr-only">Showing focus for {kidLabel(kid)}</p>
    </header>
  );
}
