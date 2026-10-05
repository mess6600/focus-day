import Link from "next/link";
import type { KidId } from "@/lib/kids";
import type { StudyUpdate } from "@/lib/types";
import { formatFocusDate, formatShortDate } from "@/lib/dates";

type HistoryListProps = {
  updates: StudyUpdate[];
  /** Skip the newest item when showing a teaser under Today */
  skipFirst?: boolean;
  limit?: number;
};

export function HistoryList({ updates, skipFirst = false, limit }: HistoryListProps) {
  const items = updates.slice(skipFirst ? 1 : 0, limit ? (skipFirst ? 1 : 0) + limit : undefined);

  if (items.length === 0) {
    return <p className="empty-note">No older study notes yet.</p>;
  }

  return (
    <ul className="history-list">
      {items.map((update, index) => (
        <li
          key={update.id}
          className="history-item animate-fade-up"
          style={{ animationDelay: `${0.08 * index}s` }}
        >
          <article>
            <div className="history-item-top">
              <span className="subject-tag subtle">{update.subject}</span>
              <time dateTime={update.focusDate}>{formatFocusDate(update.focusDate)}</time>
            </div>
            <h3 className="history-title">{update.title}</h3>
            <p className="history-body">{update.body}</p>
            {update.testDate ? (
              <p className="history-test">
                Test: <time dateTime={update.testDate}>{formatShortDate(update.testDate)}</time>
              </p>
            ) : null}
          </article>
        </li>
      ))}
    </ul>
  );
}

type HistoryTeaserProps = {
  kid: KidId;
  updates: StudyUpdate[];
};

export function HistoryTeaser({ kid, updates }: HistoryTeaserProps) {
  const older = updates.slice(1, 4);
  if (older.length === 0) return null;

  return (
    <section className="teaser-section" aria-labelledby="recent-heading">
      <div className="section-inner">
        <h2 id="recent-heading" className="section-heading">
          Recent days
        </h2>
        <p className="section-support">A quick look at what you worked on before today.</p>
        <HistoryList updates={updates} skipFirst limit={3} />
        {updates.length > 4 ? (
          <p className="teaser-more">
            <Link href={`/history?kid=${kid}`}>Browse all past days</Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
