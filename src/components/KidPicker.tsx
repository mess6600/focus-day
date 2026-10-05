import Link from "next/link";
import { KIDS } from "@/lib/kids";

export function KidPicker() {
  return (
    <section className="hero picker-hero" aria-labelledby="brand-title">
      <div className="hero-atmosphere" aria-hidden="true" />
      <div className="hero-inner">
        <p className="brand-hero" id="brand-title">
          Focus Day
        </p>
        <h1 className="hero-headline animate-fade-up">Who&apos;s studying?</h1>
        <p className="hero-support animate-fade-up delay-1">
          Pick your name to see what to focus on today.
        </p>
        <ul className="kid-pick-list animate-fade-up delay-2">
          {KIDS.map((kid) => (
            <li key={kid.id}>
              <Link href={`/?kid=${kid.id}`} className="kid-pick-option">
                {kid.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
