import Link from "next/link";
import type { KidId } from "@/lib/kids";
import { kidLabel } from "@/lib/kids";
import type { StudyUpdate } from "@/lib/types";
import { formatFocusDate, formatShortDate } from "@/lib/dates";

type TodayFocusProps = {
  kid: KidId;
  update: StudyUpdate | null;
};

export function TodayFocus({ kid, update }: TodayFocusProps) {
  if (!update) {
    return (
      <section className="hero" aria-labelledby="brand-title">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-inner">
          <p className="brand-hero" id="brand-title">
            Focus Day
          </p>
          <p className="hero-meta animate-fade-up">
            <span className="subject-tag">{kidLabel(kid)}</span>
          </p>
          <h1 className="hero-headline animate-fade-up delay-1">Nothing posted yet</h1>
          <p className="hero-support animate-fade-up delay-2">
            When your study helper posts {kidLabel(kid)}&apos;s plan, it will show up right here.
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
          <span className="subject-tag">{kidLabel(kid)}</span>
          <span className="meta-sep" aria-hidden="true">
            ·
          </span>
          <span className="subject-tag subtle">{update.subject}</span>
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
          <Link href={`/history?kid=${kid}`} className="cta-secondary">
            See past days
          </Link>
        </div>
      </div>
    </section>
  );
}
