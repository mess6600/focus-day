import { SiteHeader } from "@/components/SiteHeader";
import { TodayFocus } from "@/components/TodayFocus";
import { HistoryTeaser } from "@/components/HistoryList";
import { listUpdates } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const updates = await listUpdates();
  const latest = updates[0] ?? null;

  return (
    <>
      <SiteHeader active="today" />
      <main>
        <TodayFocus update={latest} />
        <HistoryTeaser updates={updates} />
      </main>
    </>
  );
}
