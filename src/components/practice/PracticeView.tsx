import type { PracticeContent } from "@/lib/practice";
import { documentTypeLabel, practiceLabel } from "@/lib/practice";
import { QuizPractice } from "./QuizPractice";
import { VocabPractice } from "./VocabPractice";

type PracticeViewProps = {
  practice: PracticeContent;
};

export function PracticeView({ practice }: PracticeViewProps) {
  const externalLabel =
    documentTypeLabel(practice.documentType) ||
    (practice.kind === "document" ? "Open document" : "Open resource");

  return (
    <div className="practice-stack">
      {(practice.kind === "link" || practice.kind === "document") && practice.url ? (
        <div className="practice-panel">
          <h2 className="practice-title">{practice.title || practiceLabel(practice)}</h2>
          {practice.notes ? <p className="practice-support">{practice.notes}</p> : null}
          <a
            className="cta-primary"
            href={practice.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {externalLabel}
          </a>
        </div>
      ) : null}

      {practice.kind === "quiz" && practice.questions?.length ? (
        <QuizPractice title={practice.title} questions={practice.questions} />
      ) : null}

      {(practice.kind === "vocabulary" || practice.kind === "flashcards") &&
      practice.words?.length ? (
        <VocabPractice
          title={practice.title}
          words={practice.words}
          mode={practice.kind === "flashcards" ? "flashcards" : "vocabulary"}
        />
      ) : null}

      {/* Mixed posts: interactive practice plus an attached source doc */}
      {practice.url && practice.kind !== "link" && practice.kind !== "document" ? (
        <div className="practice-panel subtle">
          <h3 className="practice-subtitle">Source material</h3>
          <a
            className="cta-secondary"
            href={practice.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {externalLabel}
          </a>
        </div>
      ) : null}

      {practice.notes && practice.kind !== "link" && practice.kind !== "document" ? (
        <div className="practice-panel subtle">
          <h3 className="practice-subtitle">Notes</h3>
          <p className="practice-support">{practice.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
