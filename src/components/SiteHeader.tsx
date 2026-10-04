import Link from "next/link";

type SiteHeaderProps = {
  active?: "today" | "history";
};

export function SiteHeader({ active = "today" }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label="Focus Day home">
        Focus Day
      </Link>
      <nav className="site-nav" aria-label="Main">
        <Link href="/" className={active === "today" ? "nav-link is-active" : "nav-link"}>
          Today
        </Link>
        <Link
          href="/history"
          className={active === "history" ? "nav-link is-active" : "nav-link"}
        >
          Past days
        </Link>
      </nav>
    </header>
  );
}
