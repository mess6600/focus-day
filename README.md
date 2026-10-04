# Focus Day

A simple Vercel site for kids: open it and see **what to study today**. An external agent (or parent script) can post a new focus note each day. Older notes stay available under **Past days**.

## Best design (what this app does)

| Piece | Choice | Why |
| --- | --- | --- |
| Hosting | Next.js on Vercel | Free, fast, one-click deploy |
| Kid view | Homepage = newest focus only | One job: “what should I do now?” |
| History | `/history` + short teaser on home | Old material without cluttering today |
| Agent input | `POST /api/updates` + Bearer token | Any outside agent/script can post daily |
| Storage | Upstash Redis in production; local JSON in dev | Survives serverless; zero setup locally |

Flow:

1. Outside agent posts today’s subject, title, and study notes.
2. Child opens the site → hero shows that latest focus.
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
    "subject": "Math",
    "title": "Multiplication facts through 12",
    "body": "Practice the 7s and 8s for 10 minutes. Then do workbook page 18.",
    "focusDate": "2026-10-04",
    "testDate": "2026-10-10"
  }'
```

### List updates

```bash
curl http://localhost:3000/api/updates
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
  "subject": "Science",
  "title": "Review the water cycle",
  "body": "Be able to explain evaporation, condensation, precipitation.",
  "focusDate": "2026-10-04",
  "testDate": "2026-10-08"
}
```

- `subject`, `title`, `body` — required  
- `focusDate`, `testDate` — optional `YYYY-MM-DD`  
- Auth header: `Authorization: Bearer <AGENT_API_KEY>`

`GET /api/updates` — public JSON list, newest first.
