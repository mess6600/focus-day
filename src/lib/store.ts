import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { CreateUpdateInput, StudyUpdate } from "./types";
import { isValidIsoDate, todayIso } from "./dates";

const REDIS_KEY = "focus-day:updates";
const LOCAL_FILE = path.join(process.cwd(), "data", "updates.json");

function hasRedis(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function getRedis(): Redis {
  return Redis.fromEnv();
}

const seedUpdates: StudyUpdate[] = [
  {
    id: "seed-math-fractions",
    createdAt: new Date().toISOString(),
    focusDate: todayIso(),
    subject: "Math",
    title: "Practice fraction word problems",
    body: "Do pages 42–43 in your workbook. Focus on mixed numbers and simplifying answers. Check each problem by estimating first.",
    testDate: undefined,
  },
  {
    id: "seed-science-habitats",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    focusDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })(),
    subject: "Science",
    title: "Review animal habitats",
    body: "Know desert, ocean, forest, and rainforest. For each one, name two animals and one way they survive there.",
    testDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d.toISOString().slice(0, 10);
    })(),
  },
  {
    id: "seed-reading-chapter",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    focusDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      return d.toISOString().slice(0, 10);
    })(),
    subject: "Reading",
    title: "Finish chapter 6 and pick a favorite scene",
    body: "Read to the end of chapter 6. Be ready to tell one thing a character learned and why that scene mattered.",
  },
];

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

async function readAll(): Promise<StudyUpdate[]> {
  if (hasRedis()) {
    const redis = getRedis();
    const raw = await redis.get<StudyUpdate[]>(REDIS_KEY);
    if (!raw || raw.length === 0) {
      await redis.set(REDIS_KEY, seedUpdates);
      return seedUpdates;
    }
    return raw;
  }

  await ensureLocalFile();
  const text = await fs.readFile(LOCAL_FILE, "utf8");
  return JSON.parse(text) as StudyUpdate[];
}

async function writeAll(updates: StudyUpdate[]): Promise<void> {
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

export async function listUpdates(): Promise<StudyUpdate[]> {
  return sortUpdates(await readAll());
}

export async function getLatestUpdate(): Promise<StudyUpdate | null> {
  const updates = await listUpdates();
  return updates[0] ?? null;
}

export async function createUpdate(input: CreateUpdateInput): Promise<StudyUpdate> {
  const subject = input.subject?.trim();
  const title = input.title?.trim();
  const body = input.body?.trim();

  if (!subject || !title || !body) {
    throw new Error("subject, title, and body are required");
  }

  if (input.focusDate && !isValidIsoDate(input.focusDate)) {
    throw new Error("focusDate must be YYYY-MM-DD");
  }

  if (input.testDate && !isValidIsoDate(input.testDate)) {
    throw new Error("testDate must be YYYY-MM-DD");
  }

  const update: StudyUpdate = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    focusDate: input.focusDate && isValidIsoDate(input.focusDate) ? input.focusDate : todayIso(),
    subject,
    title,
    body,
    ...(input.testDate ? { testDate: input.testDate } : {}),
  };

  const existing = await readAll();
  await writeAll([update, ...existing]);
  return update;
}
