export const PRACTICE_KINDS = [
  "quiz",
  "vocabulary",
  "flashcards",
  "link",
  "document",
] as const;

export type PracticeKind = (typeof PRACTICE_KINDS)[number];

export const DOCUMENT_TYPES = [
  "pdf",
  "gdoc",
  "slides",
  "canvas",
  "webpage",
  "image",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type QuizQuestion = {
  prompt: string;
  choices?: string[];
  /** Index into choices, or exact answer string for free response */
  answer?: string | number;
  explanation?: string;
};

export type VocabWord = {
  term: string;
  definition?: string;
};

export type PracticeContent = {
  kind: PracticeKind;
  title?: string;
  /** External resource (Canvas, Google Doc, PDF, slides, etc.) */
  url?: string;
  documentType?: DocumentType | string;
  words?: VocabWord[];
  questions?: QuizQuestion[];
  /** Optional longer study text / notes */
  notes?: string;
};

export function isPracticeKind(value: unknown): value is PracticeKind {
  return typeof value === "string" && (PRACTICE_KINDS as readonly string[]).includes(value);
}

export function hasPractice(practice?: PracticeContent | null): boolean {
  if (!practice || !isPracticeKind(practice.kind)) return false;
  if (practice.kind === "link" || practice.kind === "document") {
    return Boolean(practice.url?.trim());
  }
  if (practice.kind === "vocabulary" || practice.kind === "flashcards") {
    return Boolean(practice.words?.length || practice.url?.trim());
  }
  if (practice.kind === "quiz") {
    return Boolean(practice.questions?.length || practice.url?.trim());
  }
  return false;
}

export function practiceLabel(practice: PracticeContent): string {
  switch (practice.kind) {
    case "quiz":
      return "Practice quiz";
    case "vocabulary":
      return "Vocabulary practice";
    case "flashcards":
      return "Flashcards";
    case "document":
      return documentTypeLabel(practice.documentType) || "Open document";
    case "link":
      return documentTypeLabel(practice.documentType) || "Open resource";
    default:
      return "Start practice";
  }
}

export function documentTypeLabel(value?: string): string | null {
  switch ((value || "").toLowerCase()) {
    case "pdf":
      return "Open PDF";
    case "gdoc":
      return "Open Google Doc";
    case "slides":
      return "Open slides";
    case "canvas":
      return "Open in Canvas";
    case "webpage":
      return "Open webpage";
    case "image":
      return "Open image";
    default:
      return null;
  }
}

export function normalizePractice(raw: unknown): PracticeContent | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const input = raw as Record<string, unknown>;

  const kindRaw = typeof input.kind === "string" ? input.kind.toLowerCase() : "";
  let kind: PracticeKind | null = isPracticeKind(kindRaw) ? kindRaw : null;

  const url = typeof input.url === "string" ? input.url.trim() : undefined;
  const title = typeof input.title === "string" ? input.title.trim() : undefined;
  const notes = typeof input.notes === "string" ? input.notes.trim() : undefined;
  const documentType =
    typeof input.documentType === "string" ? input.documentType.trim().toLowerCase() : undefined;

  const words = Array.isArray(input.words)
    ? input.words
        .map((word) => {
          if (!word || typeof word !== "object") return null;
          const entry = word as Record<string, unknown>;
          const term = typeof entry.term === "string" ? entry.term.trim() : "";
          if (!term) return null;
          const definition =
            typeof entry.definition === "string" ? entry.definition.trim() : undefined;
          return { term, ...(definition ? { definition } : {}) };
        })
        .filter((word): word is VocabWord => Boolean(word))
    : undefined;

  const questions = Array.isArray(input.questions)
    ? input.questions
        .map((question) => {
          if (!question || typeof question !== "object") return null;
          const entry = question as Record<string, unknown>;
          const prompt = typeof entry.prompt === "string" ? entry.prompt.trim() : "";
          if (!prompt) return null;
          const choices = Array.isArray(entry.choices)
            ? entry.choices
                .filter((choice): choice is string => typeof choice === "string")
                .map((choice) => choice.trim())
                .filter(Boolean)
            : undefined;
          const explanation =
            typeof entry.explanation === "string" ? entry.explanation.trim() : undefined;
          const answer =
            typeof entry.answer === "string" || typeof entry.answer === "number"
              ? entry.answer
              : undefined;
          return {
            prompt,
            ...(choices?.length ? { choices } : {}),
            ...(answer !== undefined ? { answer } : {}),
            ...(explanation ? { explanation } : {}),
          };
        })
        .filter((question): question is QuizQuestion => Boolean(question))
    : undefined;

  // Convenience: if Muse only sends url, treat as link/document
  if (!kind && url) {
    kind = documentType ? "document" : "link";
  }
  if (!kind && words?.length) kind = "vocabulary";
  if (!kind && questions?.length) kind = "quiz";
  if (!kind) return undefined;

  const practice: PracticeContent = {
    kind,
    ...(title ? { title } : {}),
    ...(url ? { url } : {}),
    ...(documentType ? { documentType } : {}),
    ...(words?.length ? { words } : {}),
    ...(questions?.length ? { questions } : {}),
    ...(notes ? { notes } : {}),
  };

  return hasPractice(practice) ? practice : undefined;
}
