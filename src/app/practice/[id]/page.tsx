import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BrandCrumb } from "@/components/BrandCrumb";
import { SiteHeader } from "@/components/SiteHeader";
import { PracticeView } from "@/components/practice/PracticeView";
import { boardHref } from "@/lib/kids";
import { parseKidId } from "@/lib/kids";
import { hasPractice, practiceLabel } from "@/lib/practice";
import { getUpdateById } from "@/lib/store";

export const dynamic = "force-dynamic";

type PracticePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kid?: string }>;
};

export default async function PracticePage({ params, searchParams }: PracticePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const update = await getUpdateById(id);
  if (!update) notFound();

  const kid = parseKidId(query.kid) ?? update.kid;
  if (kid !== update.kid) {
    redirect(`/practice/${id}?kid=${update.kid}`);
  }

  return (
    <>
      <SiteHeader active="today" kid={kid} />
      <main>
        <section className="practice-hero">
          <div className="section-inner">
            <BrandCrumb
              large
              kid={kid}
              subject={update.subject}
              focusDate={update.focusDate}
            />
            <h1 className="section-heading large">{update.title}</h1>
            <p className="section-support">{update.body}</p>
            {hasPractice(update.practice) ? (
              <p className="practice-kicker">{practiceLabel(update.practice!)}</p>
            ) : (
              <p className="section-support">No practice attached to this focus yet.</p>
            )}
          </div>
        </section>

        {hasPractice(update.practice) ? (
          <section className="practice-section">
            <div className="section-inner">
              <PracticeView practice={update.practice!} />
            </div>
          </section>
        ) : null}

        <section className="practice-section">
          <div className="section-inner practice-footer-links">
            <Link href={boardHref(kid)} className="cta-secondary">
              Back to board
            </Link>
            <Link href={`/history?kid=${kid}`} className="text-link">
              Past days
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
