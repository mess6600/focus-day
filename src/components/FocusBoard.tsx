import Link from "next/link";
import type { KidId } from "@/lib/kids";
import { kidLabel } from "@/lib/kids";
import { dueDateFor } from "@/lib/board";
import { formatFocusDate, formatShortDate, todayIso } from "@/lib/dates";
import { hasPractice, practiceLabel } from "@/lib/practice";
import type { StudyUpdate } from "@/lib/types";

type FocusBoardProps = {
  kid: KidId;
  dueNow: StudyUpdate[];
  comingUp: StudyUpdate[];
};

export function FocusBoard({ kid, dueNow, comingUp }: FocusBoardProps) {
  const empty = dueNow.length === 0 && comingUp.length === 0;

  return (
    <>
      <section className="board-hero" aria-labelledby="brand-title">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="section-inner board-hero-inner">
          <p className="brand-hero" id="brand-title">
            Focus Day
          </p>
          <p className="hero-meta animate-fade-up">
            <span className="subject-tag">{kidLabel(kid)}</span>
          </p>
          <h1 className="board-headline animate-fade-up delay-1">
            {empty ? "Nothing on the board yet" : "What needs attention"}
          </h1>
          <p className="section-support animate-fade-up delay-2">
            {empty
              ? `When your study helper posts for ${kidLabel(kid)}, it will show up in Due now or Coming up.`
              : "Due now is today or earlier. Coming up is everything still ahead."}
          </p>
        </div>
      </section>

      <BoardSection
        kid={kid}
        id="due-now"
        title="Due now"
        support="Today or earlier — start here."
        updates={dueNow}
        emptyText="Nothing due right now."
      />

      <BoardSection
        kid={kid}
        id="coming-up"
        title="Coming up"
        support="Future items, soonest first."
        updates={comingUp}
        emptyText="Nothing scheduled ahead yet."
      />

      <section className="board-footer">
        <div className="section-inner">
          <Link href={`/history?kid=${kid}`} className="cta-secondary">
            See past days
          </Link>
        </div>
      </section>
    </>
  );
}

type BoardSectionProps = {
  kid: KidId;
  id: string;
  title: string;
  support: string;
  updates: StudyUpdate[];
  emptyText: string;
};

function BoardSection({ kid, id, title, support, updates, emptyText }: BoardSectionProps) {
  return (
    <section className="board-section" aria-labelledby={id}>
      <div className="section-inner">
        <h2 id={id} className="section-heading">
          {title}
        </h2>
        <p className="section-support">{support}</p>
        {updates.length === 0 ? (
          <p className="empty-note">{emptyText}</p>
        ) : (
          <ul className="board-list">
            {updates.map((update, index) => (
              <li
                key={update.id}
                className="board-item animate-fade-up"
                style={{ animationDelay: `${0.06 * index}s` }}
              >
                <BoardItem kid={kid} update={update} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function BoardItem({ kid, update }: { kid: KidId; update: StudyUpdate }) {
  const href = `/practice/${update.id}?kid=${kid}`;
  const canPractice = hasPractice(update.practice);
  const due = dueDateFor(update);
  const today = todayIso();
  const isOverdue = due < today;
  const isToday = due === today;

  const content = (
    <>
      <div className="board-item-top">
        <span className="subject-tag subtle">{update.subject}</span>
        <span className="board-due">
          {isOverdue ? "Overdue · " : isToday ? "Today · " : "Due · "}
          <time dateTime={due}>{isToday ? "today" : formatShortDate(due)}</time>
        </span>
      </div>
      <h3 className="board-item-title">{update.title}</h3>
      <p className="board-item-body">{update.body}</p>
      {update.testDate ? (
        <p className="history-test">
          Test: <time dateTime={update.testDate}>{formatFocusDate(update.testDate)}</time>
        </p>
      ) : null}
      {canPractice ? (
        <p className="history-practice-hint">{practiceLabel(update.practice!)} →</p>
      ) : null}
    </>
  );

  if (canPractice) {
    return (
      <Link href={href} className="board-item-link">
        {content}
      </Link>
    );
  }

  return <article>{content}</article>;
}
