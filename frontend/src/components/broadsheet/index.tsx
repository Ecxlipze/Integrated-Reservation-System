import { cn } from '@/lib/utils';

/**
 * Shared broadsheet furniture. Hierarchy comes from the serif scale and
 * whitespace — these are the few repeated constructions, not a box kit.
 */

/**
 * The cyan uppercase label above a page title or beside a rail. Set in
 * cyan-700, not the base cyan: at 11.5px this is small text, and #0088b0 on
 * paper only clears ~3:1.
 */
export function Kicker({
  children,
  className,
  tone = 'accent',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'accent' | 'muted';
}) {
  return (
    <div
      className={cn(
        'text-[11.5px] tracking-[0.1em] uppercase',
        tone === 'accent' ? 'text-cyan-700' : 'text-ink-600',
        className
      )}
    >
      {children}
    </div>
  );
}

/** The 13px uppercase section label that heads Rooms / Amenities / Ledger. */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        'text-[13px] font-normal tracking-[0.1em] uppercase text-ink-700',
        className
      )}
    >
      {children}
    </h3>
  );
}

/**
 * Imagery is intentionally a grey plate under the halftone dot screen — real
 * photography is still outstanding. When it lands, interface imagery keeps
 * .halftone and editorial imagery can take the four-plate .cmyk treatment.
 */
export function Plate({
  label,
  className,
  style,
}: {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn('halftone flex items-end bg-[#c9c7c2] p-2', className)}
      style={style}
      role="presentation"
    >
      {label ? (
        <span className="text-[10px] tracking-[0.08em] uppercase text-ink-700">
          {label}
        </span>
      ) : null}
    </div>
  );
}

/** A 1px hairline at 16% ink — the row rule that separates listings. */
export function Rule({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-px bg-border', className)}
      role="presentation"
    />
  );
}

/** The standfirst line beneath a page title. */
export function Standfirst({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-[15px] text-ink-700', className)}>{children}</p>
  );
}
