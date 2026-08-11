import Link from 'next/link';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SectionNav } from './SectionNav';

/**
 * The broadsheet masthead. The thick-thin rule pair around the dateline rail
 * is the system's one sanctioned use of rules — everywhere else, sections are
 * separated by whitespace.
 *
 * This is a server component so the dateline is computed at render time on the
 * server only. Doing it client-side would disagree with the server's HTML and
 * throw a hydration mismatch.
 */
export function Masthead() {
  const now = new Date();

  const date = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(now);

  // Decorative issue number — advances with the day of the year rather than
  // sitting frozen at whatever it was when the design was drawn.
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear) / 86_400_000);

  return (
    <header>
      <div className="flex flex-wrap items-end justify-between gap-4 pb-[12px]">
        <Link
          href="/"
          className="text-[34px] leading-none font-semibold tracking-[-0.01em] text-foreground no-underline"
        >
          Almanac Travel
        </Link>
        <nav className="flex items-center gap-[18px] text-sm">
          <Link href="/login" className="text-primary">
            Sign in
          </Link>
          <CartDrawer />
        </nav>
      </div>

      <div className="h-[3px] bg-foreground" role="presentation" />

      <div className="flex flex-wrap items-center justify-between gap-3 py-[7px] text-[11.5px] tracking-[0.09em] uppercase text-ink-700">
        <span>{date}</span>
        <span className="hidden sm:inline">
          Flights · Bus · Hotels · Hostels · Tours
        </span>
        <span>Est. 2026 · No. {dayOfYear}</span>
      </div>

      <div className="h-px bg-foreground" role="presentation" />

      <SectionNav />
    </header>
  );
}
