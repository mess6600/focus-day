import Link from "next/link";
import type { StudyUpdate } from "@/lib/types";
import { formatFocusDate, formatShortDate } from "@/lib/dates";

type TodayFocusProps = {
  update: StudyUpdate | null;
};

export function TodayFocus({ update }: TodayFocusProps) {
  if (!update) {
    return (
      <section className="hero" aria-labelledby="brand-title">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-inner">
          <p className="brand-hero" id="brand-title">
            Focus Day
          </p>
          <h1 className="hero-headline">Nothing posted yet</h1>
          <p className="hero-support">
            When your study helper posts today&apos;s plan, it will show up right here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="hero" aria-labelledby="brand-title">
      <div className="hero-atmosphere" aria-hidden="true" />
      <div className="hero-inner">
        <p className="brand-hero" id="brand-title">
          Focus Day
        </p>
        <p className="hero-meta animate-fade-up">
          <span className="subject-tag">{update.subject}</span>
          <span className="meta-sep" aria-hidden="true">
            ·
          </span>
          <time dateTime={update.focusDate}>{formatFocusDate(update.focusDate)}</time>
        </p>
        <h1 className="hero-headline animate-fade-up delay-1">{update.title}</h1>
        <p className="hero-support animate-fade-up delay-2">{update.body}</p>
        {update.testDate ? (
          <p className="test-callout animate-fade-up delay-3">
            Test coming up: <time dateTime={update.testDate}>{formatShortDate(update.testDate)}</time>
          </p>
        ) : null}
        <div className="hero-actions animate-fade-up delay-3">
          <Link href="/history" className="cta-secondary">
            See past days
          </Link>
        </div>
      </div>
    </section>
  );
}
