import Link from "next/link";
import type { KidId } from "@/lib/kids";
import { hasPractice, practiceLabel } from "@/lib/practice";
import type { StudyUpdate } from "@/lib/types";
import { formatFocusDate, formatShortDate } from "@/lib/dates";

type HistoryListProps = {
  kid: KidId;
  updates: StudyUpdate[];
  /** Skip the newest item when showing a teaser under Today */
  skipFirst?: boolean;
  limit?: number;
};

export function HistoryList({ kid, updates, skipFirst = false, limit }: HistoryListProps) {
  const items = updates.slice(skipFirst ? 1 : 0, limit ? (skipFirst ? 1 : 0) + limit : undefined);

  if (items.length === 0) {
    return <p className="empty-note">No older study notes yet.</p>;
  }

  return (
    <ul className="history-list">
      {items.map((update, index) => {
        const href = `/practice/${update.id}?kid=${kid}`;
        const canPractice = hasPractice(update.practice);
        return (
          <li
            key={update.id}
            className="history-item animate-fade-up"
            style={{ animationDelay: `${0.08 * index}s` }}
          >
            {canPractice ? (
              <Link href={href} className="history-link">
                <HistoryArticle update={update} showPracticeHint />
              </Link>
            ) : (
              <article>
                <HistoryArticle update={update} />
              </article>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function HistoryArticle({
  update,
  showPracticeHint = false,
}: {
  update: StudyUpdate;
  showPracticeHint?: boolean;
}) {
  return (
    <>
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
      {showPracticeHint && update.practice ? (
        <p className="history-practice-hint">{practiceLabel(update.practice)} →</p>
      ) : null}
    </>
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
        <HistoryList kid={kid} updates={updates} skipFirst limit={3} />
        {updates.length > 4 ? (
          <p className="teaser-more">
            <Link href={`/history?kid=${kid}`}>Browse all past days</Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
