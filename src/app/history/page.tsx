import { SiteHeader } from "@/components/SiteHeader";
import { HistoryList } from "@/components/HistoryList";
import { listUpdates } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const updates = await listUpdates();

  return (
    <>
      <SiteHeader active="history" />
      <main>
        <section className="history-hero">
          <div className="section-inner">
            <p className="brand-inline">Focus Day</p>
            <h1 className="section-heading large">Past days</h1>
            <p className="section-support">
              Everything that has been posted, newest first. Scroll back whenever you need a
              refresher.
            </p>
          </div>
        </section>
        <section className="history-section">
          <div className="section-inner">
            <HistoryList updates={updates} />
          </div>
        </section>
      </main>
    </>
  );
}
