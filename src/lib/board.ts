import type { StudyUpdate } from "./types";
import { todayIso } from "./dates";

/**
 * Board bucketing uses focusDate (when to start / work on it).
 * testDate stays informational ("Test: …") and is only a fallback.
 */
export function dueDateFor(update: StudyUpdate): string {
  return update.focusDate || update.testDate || update.createdAt.slice(0, 10);
}

export function partitionBoard(
  updates: StudyUpdate[],
  today = todayIso(),
): { dueNow: StudyUpdate[]; comingUp: StudyUpdate[] } {
  const dueNow: StudyUpdate[] = [];
  const comingUp: StudyUpdate[] = [];

  for (const update of updates) {
    if (dueDateFor(update) <= today) {
      dueNow.push(update);
    } else {
      comingUp.push(update);
    }
  }

  // Due now: oldest/most overdue first, then by newest post as tiebreaker
  dueNow.sort((a, b) => {
    const aDue = dueDateFor(a);
    const bDue = dueDateFor(b);
    if (aDue !== bDue) return aDue < bDue ? -1 : 1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  // Coming up: soonest first
  comingUp.sort((a, b) => {
    const aDue = dueDateFor(a);
    const bDue = dueDateFor(b);
    if (aDue !== bDue) return aDue < bDue ? -1 : 1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  return { dueNow, comingUp };
}
