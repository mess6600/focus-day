import { KidPicker } from "@/components/KidPicker";
import { SiteHeader } from "@/components/SiteHeader";
import { TodayFocus } from "@/components/TodayFocus";
import { HistoryTeaser } from "@/components/HistoryList";
import { parseKidId } from "@/lib/kids";
import { listUpdates } from "@/lib/store";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ kid?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const kid = parseKidId(params.kid);

  if (!kid) {
    return (
      <main>
        <KidPicker />
      </main>
    );
  }

  const updates = await listUpdates(kid);
  const latest = updates[0] ?? null;

  return (
    <>
      <SiteHeader active="today" kid={kid} />
      <main>
        <TodayFocus kid={kid} update={latest} />
        <HistoryTeaser kid={kid} updates={updates} />
      </main>
    </>
  );
}
