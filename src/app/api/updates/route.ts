import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { createUpdate, listUpdates } from "@/lib/store";
import type { CreateUpdateInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const updates = await listUpdates();
  return NextResponse.json({ updates });
}

export async function POST(request: Request) {
  if (!process.env.AGENT_API_KEY) {
    return NextResponse.json(
      { error: "AGENT_API_KEY is not configured on the server" },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateUpdateInput;
  try {
    body = (await request.json()) as CreateUpdateInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const update = await createUpdate(body);
    return NextResponse.json({ update }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
