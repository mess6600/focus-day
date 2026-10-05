import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { parseKidId } from "@/lib/kids";
import { createUpdate, listUpdates } from "@/lib/store";
import type { CreateUpdateInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kid = parseKidId(searchParams.get("kid"));
  const updates = await listUpdates(kid ?? undefined);
  return NextResponse.json({ updates, kid });
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
