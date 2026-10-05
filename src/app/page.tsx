import { FocusBoard } from "@/components/FocusBoard";
import { KidPicker } from "@/components/KidPicker";
import { SiteHeader } from "@/components/SiteHeader";
import { partitionBoard } from "@/lib/board";
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
  const { dueNow, comingUp } = partitionBoard(updates);

  return (
    <>
      <SiteHeader active="today" kid={kid} />
      <main>
        <FocusBoard kid={kid} dueNow={dueNow} comingUp={comingUp} />
      </main>
    </>
  );
}
