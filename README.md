# Focus Day

A simple Vercel site for kids: open it and see **what to study today**. An external agent (or parent script) can post a new focus note each day. Older notes stay available under **Past days**.

## Best design (what this app does)

| Piece | Choice | Why |
| --- | --- | --- |
| Hosting | Next.js on Vercel | Free, fast, one-click deploy |
| Kid view | Pick Mohit or Amrit, then newest focus for that kid | Each child only sees their own board |
| History | `/history?kid=…` + short teaser on home | Old material without cluttering today |
| Agent input | `POST /api/updates` + Bearer token | Any outside agent/script can post daily |
| Storage | Vercel Blob in production; local JSON in dev | Survives serverless |

Flow:

1. Outside agent posts today’s notes with `"kid": "mohit"` or `"kid": "amrit"`.
2. Child opens the site → picks their name → hero shows their latest focus.
3. Child taps **Past days** when they need something older.

## Quick start (local)

```bash
cp .env.example .env.local
# set AGENT_API_KEY to any secret string
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Post an update (as the agent)

```bash
curl -X POST http://localhost:3000/api/updates \
  -H "Authorization: Bearer $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "kid": "mohit",
    "subject": "Math",
    "title": "Multiplication facts through 12",
    "body": "Practice the 7s and 8s for 10 minutes. Then do workbook page 18.",
    "focusDate": "2026-10-04",
    "testDate": "2026-10-10"
  }'
```

### List updates

```bash
curl "http://localhost:3000/api/updates?kid=amrit"
```

## Deploy to Vercel

1. Push this folder to a GitHub repo and import it in Vercel.
2. Set environment variables:
   - `AGENT_API_KEY` — long random secret
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — from [Upstash](https://upstash.com) (or Vercel Marketplace → Upstash)
   - optional `FOCUS_TIMEZONE` (default `America/New_York`)
3. Deploy. Point your daily agent at `https://YOUR_DOMAIN/api/updates`.

Without Redis, Vercel’s filesystem is ephemeral — posts would not stick. Redis is required for production.

## API shape

`POST /api/updates`

```json
{
  "kid": "mohit",
  "subject": "Science",
  "title": "Matter vocabulary — get ready for the quiz",
  "body": "Tap to practice the Matter word list.",
  "testDate": "2026-10-08",
  "practice": {
    "kind": "vocabulary",
    "title": "Matter word list",
    "words": [
      { "term": "matter", "definition": "Anything that has mass and takes up space" },
      { "term": "solid", "definition": "Fixed shape and volume" }
    ],
    "url": "https://example.com/slides-or-canvas-link",
    "documentType": "slides"
  }
}
```

Practice `kind` values:
- `quiz` — `questions: [{ prompt, choices, answer, explanation }]`
- `vocabulary` — tap-to-reveal word list (`words`)
- `flashcards` — flip cards (`words` as prompt/answer)
- `link` / `document` — open Canvas, Google Doc, PDF, slides (`url`, optional `documentType`: `pdf|gdoc|slides|canvas|webpage|image`)

Shortcuts: top-level `url` / `link` (+ optional `documentType`) instead of a full `practice` object.

- `kid` — required: `"mohit"` or `"amrit"`
- `subject`, `title`, `body` — required  
- `focusDate`, `testDate`, `practice` — optional  
- Auth header: `Authorization: Bearer <AGENT_API_KEY>`

Kids tap a focus item → `/practice/[id]` for quiz/vocab/docs.

`GET /api/updates?kid=mohit` — public JSON list for that kid, newest first.
