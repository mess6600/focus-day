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
  choices: string[];
  /** 0-based index into choices */
  answer: number;
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

/** Canonical example Muse (or any agent) can copy. */
export const QUIZ_FORMAT_EXAMPLE = {
  kid: "amrit",
  subject: "Science",
  title: "Science checkpoint",
  body: "Tap to take the physical vs chemical changes quiz.",
  focusDate: "2026-10-07",
  testDate: "2026-10-08",
  practice: {
    kind: "quiz",
    title: "Physical vs chemical changes",
    questions: [
      {
        prompt: "Melting butter is an example of a…",
        choices: ["Physical change", "Chemical change"],
        answer: 0,
        explanation: "Only its state changes — no new substance forms.",
      },
      {
        prompt: "Cooking pancakes is an example of a…",
        choices: ["Physical change", "Chemical change"],
        answer: 1,
        explanation: "A new substance forms when batter cooks.",
      },
    ],
  },
} as const;

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
    case "googledoc":
    case "google_doc":
      return "Open Google Doc";
    case "slides":
    case "gslides":
      return "Open slides";
    case "canvas":
      return "Open in Canvas";
    case "webpage":
    case "web":
      return "Open webpage";
    case "image":
      return "Open image";
    default:
      return null;
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeDocumentType(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "googledoc" || normalized === "google_doc" || normalized === "google-doc") {
    return "gdoc";
  }
  if (normalized === "gslides" || normalized === "google_slides") return "slides";
  if (normalized === "web") return "webpage";
  return normalized;
}

function normalizeChoices(entry: Record<string, unknown>): string[] | undefined {
  const raw =
    entry.choices ??
    entry.options ??
    entry.answers ??
    entry.choicesList ??
    entry.multipleChoice;
  if (!Array.isArray(raw)) return undefined;
  const choices = raw
    .map((choice) => {
      if (typeof choice === "string") return choice.trim();
      if (choice && typeof choice === "object") {
        const obj = choice as Record<string, unknown>;
        return asString(obj.text) || asString(obj.label) || asString(obj.value) || "";
      }
      return "";
    })
    .filter(Boolean);
  return choices.length ? choices : undefined;
}

function resolveAnswerIndex(
  entry: Record<string, unknown>,
  choices: string[],
): number | undefined {
  const raw =
    entry.answer ??
    entry.correct ??
    entry.correctAnswer ??
    entry.correctIndex ??
    entry.answerIndex ??
    entry.answerKey;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    // Accept 0-based, or 1-based if it fits and 0 would be out of range usage
    if (raw >= 0 && raw < choices.length) return raw;
    if (raw >= 1 && raw <= choices.length) return raw - 1;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    const letter = trimmed.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      const index = letter.charCodeAt(0) - 65;
      if (index >= 0 && index < choices.length) return index;
    }
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      if (num >= 0 && num < choices.length) return num;
      if (num >= 1 && num <= choices.length) return num - 1;
    }
    const byText = choices.findIndex(
      (choice) => choice.toLowerCase() === trimmed.toLowerCase(),
    );
    if (byText >= 0) return byText;
  }

  return undefined;
}

function normalizeQuestions(rawQuestions: unknown): QuizQuestion[] | undefined {
  if (!Array.isArray(rawQuestions)) return undefined;

  const questions = rawQuestions
    .map((question) => {
      if (!question || typeof question !== "object") return null;
      const entry = question as Record<string, unknown>;
      const prompt =
        asString(entry.prompt) ||
        asString(entry.question) ||
        asString(entry.text) ||
        asString(entry.stem);
      if (!prompt) return null;

      const choices = normalizeChoices(entry);
      if (!choices || choices.length < 2) return null;

      const answer = resolveAnswerIndex(entry, choices);
      if (answer === undefined) return null;

      const explanation =
        asString(entry.explanation) ||
        asString(entry.why) ||
        asString(entry.rationale) ||
        asString(entry.feedback);

      return {
        prompt,
        choices,
        answer,
        ...(explanation ? { explanation } : {}),
      };
    })
    .filter((question): question is QuizQuestion => Boolean(question));

  return questions.length ? questions : undefined;
}

function normalizeWords(rawWords: unknown): VocabWord[] | undefined {
  if (!Array.isArray(rawWords)) return undefined;
  const words = rawWords
    .map((word) => {
      if (!word || typeof word !== "object") return null;
      const entry = word as Record<string, unknown>;
      const term =
        asString(entry.term) ||
        asString(entry.word) ||
        asString(entry.front) ||
        asString(entry.prompt);
      if (!term) return null;
      const definition =
        asString(entry.definition) ||
        asString(entry.back) ||
        asString(entry.answer) ||
        asString(entry.meaning);
      return { term, ...(definition ? { definition } : {}) };
    })
    .filter((word): word is VocabWord => Boolean(word));
  return words.length ? words : undefined;
}

function resolveKind(raw: string | undefined): PracticeKind | null {
  if (!raw) return null;
  const value = raw.toLowerCase().trim();
  if (isPracticeKind(value)) return value;
  if (
    value === "multiple_choice" ||
    value === "multiple-choice" ||
    value === "mcq" ||
    value === "checkpoint" ||
    value === "test"
  ) {
    return "quiz";
  }
  if (value === "vocab" || value === "words") return "vocabulary";
  if (value === "cards" || value === "flashcard") return "flashcards";
  if (value === "doc" || value === "file") return "document";
  return null;
}

export function normalizePractice(raw: unknown): PracticeContent | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const input = raw as Record<string, unknown>;

  let kind = resolveKind(asString(input.kind) || asString(input.type));

  const url = asString(input.url) || asString(input.link) || asString(input.href);
  const title = asString(input.title);
  const notes = asString(input.notes) || asString(input.description);
  const documentType = normalizeDocumentType(
    asString(input.documentType) || asString(input.docType) || asString(input.sourceType),
  );

  const words = normalizeWords(input.words || input.cards || input.flashcards || input.terms);
  const questions = normalizeQuestions(
    input.questions || input.items || input.quiz || input.multipleChoiceQuestions,
  );

  // Convenience inference
  if (!kind && url) kind = documentType ? "document" : "link";
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
