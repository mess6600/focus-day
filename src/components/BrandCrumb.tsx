import Link from "next/link";
import { boardHref, kidLabel, startPageHref, type KidId } from "@/lib/kids";
import { formatFocusDate } from "@/lib/dates";

type BrandCrumbProps = {
  kid: KidId;
  subject?: string;
  focusDate?: string;
  /** Larger display brand used on practice/history heroes */
  large?: boolean;
};

export function BrandCrumb({ kid, subject, focusDate, large = false }: BrandCrumbProps) {
  return (
    <>
      <p className={large ? "brand-inline" : "brand-hero"} id="brand-title">
        <Link href={startPageHref} className="brand-link" aria-label="Go to Focus Day home">
          Focus Day
        </Link>
      </p>
      <p className="hero-meta">
        <Link href={boardHref(kid)} className="subject-tag crumb-link" aria-label={`${kidLabel(kid)}'s board`}>
          {kidLabel(kid)}
        </Link>
        {subject ? (
          <>
            <span className="meta-sep" aria-hidden="true">
              ·
            </span>
            <Link href={boardHref(kid)} className="subject-tag subtle crumb-link">
              {subject}
            </Link>
          </>
        ) : null}
        {focusDate ? (
          <>
            <span className="meta-sep" aria-hidden="true">
              ·
            </span>
            <Link href={boardHref(kid)} className="crumb-link crumb-date">
              <time dateTime={focusDate}>{formatFocusDate(focusDate)}</time>
            </Link>
          </>
        ) : null}
      </p>
    </>
  );
}
