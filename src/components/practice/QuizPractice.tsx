"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/practice";

type QuizPracticeProps = {
  title?: string;
  questions: QuizQuestion[];
};

export function QuizPractice({ title, questions }: QuizPracticeProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[index];
  if (!question) return null;

  const correctIndex =
    typeof question.answer === "number"
      ? question.answer
      : typeof question.answer === "string" && question.choices
        ? question.choices.findIndex(
            (choice) => choice.toLowerCase() === question.answer?.toString().toLowerCase(),
          )
        : -1;

  function onChoose(choiceIndex: number) {
    if (revealed) return;
    setSelected(choiceIndex);
    setRevealed(true);
    if (choiceIndex === correctIndex) setScore((value) => value + 1);
  }

  function onNext() {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setRevealed(false);
  }

  if (done) {
    return (
      <div className="practice-panel">
        <h2 className="practice-title">{title || "Quiz complete"}</h2>
        <p className="practice-score">
          You got {score} of {questions.length} right.
        </p>
        <button
          type="button"
          className="cta-primary"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setRevealed(false);
            setScore(0);
            setDone(false);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="practice-panel">
      <p className="practice-progress">
        Question {index + 1} of {questions.length}
      </p>
      {title ? <h2 className="practice-title">{title}</h2> : null}
      <p className="practice-prompt">{question.prompt}</p>
      {question.choices?.length ? (
        <ul className="practice-choices">
          {question.choices.map((choice, choiceIndex) => {
            const isCorrect = revealed && choiceIndex === correctIndex;
            const isWrong = revealed && selected === choiceIndex && choiceIndex !== correctIndex;
            return (
              <li key={`${choice}-${choiceIndex}`}>
                <button
                  type="button"
                  className={`choice-btn${isCorrect ? " is-correct" : ""}${isWrong ? " is-wrong" : ""}`}
                  onClick={() => onChoose(choiceIndex)}
                >
                  {choice}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {revealed && question.explanation ? (
        <p className="practice-explanation">{question.explanation}</p>
      ) : null}
      {revealed ? (
        <button type="button" className="cta-primary" onClick={onNext}>
          {index + 1 >= questions.length ? "See score" : "Next question"}
        </button>
      ) : null}
    </div>
  );
}
