import { NextResponse } from "next/server";
import { QUIZ_FORMAT_EXAMPLE } from "@/lib/practice";

export const dynamic = "force-dynamic";

/**
 * Public schema Muse/agents can fetch to learn the quiz posting format.
 * GET https://todayschool.vercel.app/api/practice-format
 */
export async function GET() {
  return NextResponse.json({
    description:
      "How to post interactive practice to Focus Day. Prefer practice.kind=quiz for multiple-choice checkpoints.",
    postUrl: "/api/updates",
    auth: "Authorization: Bearer <AGENT_API_KEY>",
    requiredFields: ["kid", "subject", "title", "body"],
    kidValues: ["mohit", "amrit"],
    practiceKinds: ["quiz", "vocabulary", "flashcards", "link", "document"],
    quizQuestionFields: {
      prompt: "string (aliases: question, text, stem)",
      choices: "string[2+] (aliases: options, answers)",
      answer:
        "0-based index, 1-based index, letter A-D, or exact choice text (aliases: correct, correctAnswer, correctIndex, answerIndex, answerKey)",
      explanation: "optional string (aliases: why, rationale, feedback)",
    },
    exampleQuizPost: QUIZ_FORMAT_EXAMPLE,
    exampleVocabularyPost: {
      kid: "mohit",
      subject: "Science",
      title: "Matter vocabulary",
      body: "Tap to practice before the quiz.",
      focusDate: "2026-10-07",
      testDate: "2026-10-09",
      practice: {
        kind: "vocabulary",
        title: "Matter word list",
        documentType: "slides",
        url: "https://docs.google.com/presentation/d/example",
        words: [
          { term: "matter", definition: "Anything that has mass and takes up space" },
          { term: "solid", definition: "Fixed shape and volume" },
        ],
      },
    },
    notes: [
      "Board Due now / Coming up uses focusDate (testDate is display-only).",
      "For quiz prep due today, set focusDate to today and testDate to the real test day.",
      "You may also send questions under practice.items.",
    ],
  });
}
