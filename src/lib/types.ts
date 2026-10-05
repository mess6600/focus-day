import type { KidId } from "./kids";
import type { PracticeContent } from "./practice";

export type StudyUpdate = {
  id: string;
  createdAt: string;
  /** Which kid this focus note is for */
  kid: KidId;
  /** School day this update is meant for (YYYY-MM-DD) */
  focusDate: string;
  subject: string;
  title: string;
  /** What to study — plain text, short paragraphs OK */
  body: string;
  /** Optional upcoming test date (YYYY-MM-DD) */
  testDate?: string;
  /** Optional interactive practice or linked document */
  practice?: PracticeContent;
};

export type CreateUpdateInput = {
  kid: KidId | string;
  subject: string;
  title: string;
  body: string;
  focusDate?: string;
  testDate?: string;
  /** Full practice object, or pass top-level url for a simple link */
  practice?: PracticeContent | Record<string, unknown>;
  /** Convenience aliases Muse may send instead of practice.url */
  url?: string;
  link?: string;
  documentType?: string;
};
