import { redirect } from "next/navigation";
import { BrandCrumb } from "@/components/BrandCrumb";
import { SiteHeader } from "@/components/SiteHeader";
import { HistoryList } from "@/components/HistoryList";
import { kidLabel, parseKidId } from "@/lib/kids";
import { listUpdates } from "@/lib/store";

export const dynamic = "force-dynamic";

type HistoryPageProps = {
  searchParams: Promise<{ kid?: string }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const kid = parseKidId(params.kid);

  if (!kid) {
    redirect("/");
  }

  const updates = await listUpdates(kid);

  return (
    <>
      <SiteHeader active="history" kid={kid} />
      <main>
        <section className="history-hero">
          <div className="section-inner">
            <BrandCrumb large kid={kid} />
            <h1 className="section-heading large">{kidLabel(kid)}&apos;s past days</h1>
            <p className="section-support">
              Everything posted for {kidLabel(kid)}, newest first. Scroll back whenever you need a
              refresher.
            </p>
          </div>
        </section>
        <section className="history-section">
          <div className="section-inner">
            <HistoryList kid={kid} updates={updates} />
          </div>
        </section>
      </main>
    </>
  );
}
