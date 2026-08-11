import { cn } from '@/lib/utils';

/**
 * The sheet every screen is printed on: 40px page padding on desktop, 18px on
 * mobile. Every surface is paper — role is communicated by a cyan kicker above
 * the page title, never by a background colour.
 */
export function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-[18px] md:px-10', className)}>{children}</div>
  );
}

/** The dateline footer that closes every page. */
export function Colophon() {
  return (
    <Page>
      <div className="mt-14 h-px bg-border" role="presentation" />
      <div className="flex flex-wrap justify-between gap-4 pt-[14px] pb-10 text-[11.5px] tracking-[0.09em] uppercase text-ink-600">
        <span>Almanac Travel</span>
        <span className="hidden sm:inline">
          Flights · Bus · Hotels · Hostels · Tours
        </span>
        <span>Support · Terms · Privacy</span>
      </div>
    </Page>
  );
}
