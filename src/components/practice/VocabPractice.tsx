"use client";

import { useState } from "react";
import type { VocabWord } from "@/lib/practice";

type VocabPracticeProps = {
  title?: string;
  words: VocabWord[];
  mode?: "vocabulary" | "flashcards";
};

export function VocabPractice({ title, words, mode = "vocabulary" }: VocabPracticeProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[index];
  if (!word) return null;

  function go(next: number) {
    setIndex((next + words.length) % words.length);
    setFlipped(false);
  }

  if (mode === "flashcards") {
    return (
      <div className="practice-panel">
        {title ? <h2 className="practice-title">{title}</h2> : null}
        <p className="practice-progress">
          Card {index + 1} of {words.length}
        </p>
        <button
          type="button"
          className={`flash-card${flipped ? " is-flipped" : ""}`}
          onClick={() => setFlipped((value) => !value)}
        >
          <span className="flash-card-label">{flipped ? "Answer" : "Prompt"}</span>
          <span className="flash-card-text">{flipped ? word.definition || "—" : word.term}</span>
          <span className="flash-card-hint">Tap to flip</span>
        </button>
        <div className="practice-nav-row">
          <button type="button" className="cta-secondary" onClick={() => go(index - 1)}>
            Back
          </button>
          <button type="button" className="cta-primary" onClick={() => go(index + 1)}>
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-panel">
      {title ? <h2 className="practice-title">{title}</h2> : null}
      <p className="practice-support">Tap a word to show or hide its meaning.</p>
      <ul className="vocab-list">
        {words.map((entry) => (
          <VocabRow key={entry.term} word={entry} />
        ))}
      </ul>
    </div>
  );
}

function VocabRow({ word }: { word: VocabWord }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button type="button" className="vocab-row" onClick={() => setOpen((value) => !value)}>
        <span className="vocab-term">{word.term}</span>
        <span className="vocab-toggle">{open ? "Hide" : "Show"}</span>
      </button>
      {open && word.definition ? <p className="vocab-definition">{word.definition}</p> : null}
    </li>
  );
}
