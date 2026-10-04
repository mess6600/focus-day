export type StudyUpdate = {
  id: string;
  createdAt: string;
  /** School day this update is meant for (YYYY-MM-DD) */
  focusDate: string;
  subject: string;
  title: string;
  /** What to study — plain text, short paragraphs OK */
  body: string;
  /** Optional upcoming test date (YYYY-MM-DD) */
  testDate?: string;
};

export type CreateUpdateInput = {
  subject: string;
  title: string;
  body: string;
  focusDate?: string;
  testDate?: string;
};
