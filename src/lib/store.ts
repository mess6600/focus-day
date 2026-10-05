import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { get, put } from "@vercel/blob";
import type { KidId } from "./kids";
import { parseKidId } from "./kids";
import { normalizePractice } from "./practice";
import type { CreateUpdateInput, StudyUpdate } from "./types";
import { isValidIsoDate, todayIso } from "./dates";

const REDIS_KEY = "focus-day:updates";
const BLOB_PATHNAME = "focus-day/updates-v2.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "updates.json");

function hasBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

function hasRedis(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function getRedis(): Redis {
  return Redis.fromEnv();
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function daysAheadIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const seedUpdates: StudyUpdate[] = [
  {
    id: "seed-mohit-matter",
    createdAt: new Date().toISOString(),
    kid: "mohit",
    focusDate: todayIso(),
    subject: "Science",
    title: "Matter vocabulary — get ready for the quiz",
    body: "Tap below to practice the Matter word list. Say each definition out loud, then check yourself.",
    testDate: daysAheadIso(2),
    practice: {
      kind: "vocabulary",
      title: "Matter word list",
      words: [
        { term: "matter", definition: "Anything that has mass and takes up space" },
        { term: "solid", definition: "State of matter with a fixed shape and volume" },
        { term: "liquid", definition: "State of matter with a fixed volume that takes the shape of its container" },
        { term: "gas", definition: "State of matter with no fixed shape or volume" },
        { term: "mass", definition: "The amount of matter in an object" },
        { term: "volume", definition: "The amount of space something takes up" },
        { term: "property", definition: "A characteristic used to describe matter" },
        { term: "texture", definition: "How a surface feels" },
        { term: "flexible", definition: "Able to bend without breaking" },
        { term: "absorb", definition: "To soak up a liquid" },
        { term: "dissolve", definition: "When a solid mixes into a liquid and seems to disappear" },
        { term: "mixture", definition: "Two or more materials combined together" },
      ],
    },
  },
  {
    id: "seed-amrit-reading",
    createdAt: new Date().toISOString(),
    kid: "amrit",
    focusDate: todayIso(),
    subject: "Reading",
    title: "Finish chapter 6 and pick a favorite scene",
    body: "Read to the end of chapter 6. Tap for a short check quiz when you’re done.",
    practice: {
      kind: "quiz",
      title: "Chapter 6 check",
      questions: [
        {
          prompt: "What is one thing a character learned in chapter 6?",
          choices: [
            "A lesson about friendship or honesty",
            "How to bake bread",
            "The capital of France",
            "Nothing changed",
          ],
          answer: 0,
          explanation: "Look for a moment where a character understands something new.",
        },
        {
          prompt: "Why did your favorite scene matter to the story?",
          choices: [
            "It moved the plot or showed character growth",
            "It was only funny",
            "It listed vocabulary words",
            "It was the cover art",
          ],
          answer: 0,
        },
      ],
    },
  },
  {
    id: "seed-mohit-math",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    kid: "mohit",
    focusDate: daysAgoIso(1),
    subject: "Math",
    title: "Practice fraction word problems",
    body: "Do pages 42–43 in your workbook. Focus on mixed numbers and simplifying answers.",
    practice: {
      kind: "quiz",
      title: "Fraction warm-up",
      questions: [
        {
          prompt: "Which fraction is equivalent to 1/2?",
          choices: ["2/4", "1/3", "3/5", "2/5"],
          answer: 0,
        },
        {
          prompt: "What should you do first on a fraction word problem?",
          choices: [
            "Estimate and note what the question asks",
            "Add every number you see",
            "Skip to the last sentence only",
            "Draw a random shape",
          ],
          answer: 0,
        },
      ],
    },
  },
  {
    id: "seed-amrit-math",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    kid: "amrit",
    focusDate: daysAgoIso(1),
    subject: "Math",
    title: "Multiplication facts through 12",
    body: "Practice the 7s and 8s for 10 minutes. Then do workbook page 18.",
    testDate: daysAheadIso(2),
    practice: {
      kind: "flashcards",
      title: "7s and 8s",
      words: [
        { term: "7 × 6", definition: "42" },
        { term: "7 × 8", definition: "56" },
        { term: "8 × 8", definition: "64" },
        { term: "8 × 9", definition: "72" },
        { term: "7 × 9", definition: "63" },
        { term: "8 × 7", definition: "56" },
      ],
    },
  },
];

function normalizeUpdate(raw: StudyUpdate & { kid?: string; practice?: unknown }): StudyUpdate | null {
  const kid = parseKidId(raw.kid);
  if (!kid) return null;
  const practice = normalizePractice(raw.practice);
  const { practice: _ignored, ...rest } = raw;
  return {
    ...rest,
    kid,
    ...(practice ? { practice } : {}),
  };
}

function normalizeUpdates(raw: StudyUpdate[]): StudyUpdate[] {
  return raw
    .map((entry) => normalizeUpdate(entry))
    .filter((entry): entry is StudyUpdate => Boolean(entry));
}

async function ensureLocalFile(): Promise<void> {
  try {
    const text = await fs.readFile(LOCAL_FILE, "utf8");
    const parsed = JSON.parse(text) as StudyUpdate[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      await fs.writeFile(LOCAL_FILE, JSON.stringify(seedUpdates, null, 2), "utf8");
    }
  } catch {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(seedUpdates, null, 2), "utf8");
  }
}

async function readFromBlob(): Promise<{ found: boolean; updates: StudyUpdate[] }> {
  const result = await get(BLOB_PATHNAME, {
    access: "private",
    useCache: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  if (!result || !result.stream) {
    return { found: false, updates: [] };
  }

  const text = await streamToText(result.stream);
  const data = JSON.parse(text) as StudyUpdate[];
  return { found: true, updates: Array.isArray(data) ? data : [] };
}

async function writeToBlob(updates: StudyUpdate[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(updates, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

async function readAll(): Promise<StudyUpdate[]> {
  if (hasBlob()) {
    const { found, updates } = await readFromBlob();
    if (found) {
      const normalized = normalizeUpdates(updates);
      // If older posts had no kid field, keep storage intact but only return valid kid posts
      if (normalized.length === 0 && updates.length > 0) {
        await writeToBlob(seedUpdates);
        return seedUpdates;
      }
      return normalized;
    }
    await writeToBlob(seedUpdates);
    return seedUpdates;
  }

  if (hasRedis()) {
    const redis = getRedis();
    const raw = await redis.get<StudyUpdate[]>(REDIS_KEY);
    if (!raw || raw.length === 0) {
      await redis.set(REDIS_KEY, seedUpdates);
      return seedUpdates;
    }
    return normalizeUpdates(raw);
  }

  await ensureLocalFile();
  const text = await fs.readFile(LOCAL_FILE, "utf8");
  return normalizeUpdates(JSON.parse(text) as StudyUpdate[]);
}

async function writeAll(updates: StudyUpdate[]): Promise<void> {
  if (hasBlob()) {
    await writeToBlob(updates);
    return;
  }

  if (hasRedis()) {
    await getRedis().set(REDIS_KEY, updates);
    return;
  }

  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(updates, null, 2), "utf8");
}

function sortUpdates(updates: StudyUpdate[]): StudyUpdate[] {
  return [...updates].sort((a, b) => {
    if (a.focusDate !== b.focusDate) {
      return a.focusDate < b.focusDate ? 1 : -1;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export async function listUpdates(kid?: KidId): Promise<StudyUpdate[]> {
  const all = sortUpdates(await readAll());
  if (!kid) return all;
  return all.filter((update) => update.kid === kid);
}

export async function getLatestUpdate(kid: KidId): Promise<StudyUpdate | null> {
  const updates = await listUpdates(kid);
  return updates[0] ?? null;
}

export async function getUpdateById(id: string): Promise<StudyUpdate | null> {
  const updates = await readAll();
  return updates.find((update) => update.id === id) ?? null;
}

export async function createUpdate(input: CreateUpdateInput): Promise<StudyUpdate> {
  const kid = parseKidId(typeof input.kid === "string" ? input.kid : undefined);
  const subject = input.subject?.trim();
  const title = input.title?.trim();
  const body = input.body?.trim();

  if (!kid) {
    throw new Error('kid is required and must be "mohit" or "amrit"');
  }

  if (!subject || !title || !body) {
    throw new Error("subject, title, and body are required");
  }

  if (input.focusDate && !isValidIsoDate(input.focusDate)) {
    throw new Error("focusDate must be YYYY-MM-DD");
  }

  if (input.testDate && !isValidIsoDate(input.testDate)) {
    throw new Error("testDate must be YYYY-MM-DD");
  }

  const shortcutUrl = (input.url || input.link || "").trim();
  const practice = normalizePractice(
    input.practice ||
      (shortcutUrl
        ? {
            kind: input.documentType ? "document" : "link",
            url: shortcutUrl,
            documentType: input.documentType,
          }
        : undefined),
  );

  const update: StudyUpdate = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    kid,
    focusDate: input.focusDate && isValidIsoDate(input.focusDate) ? input.focusDate : todayIso(),
    subject,
    title,
    body,
    ...(input.testDate ? { testDate: input.testDate } : {}),
    ...(practice ? { practice } : {}),
  };

  const existing = await readAll();
  await writeAll([update, ...existing]);
  return update;
}
