import { cn } from '@/lib/utils';

/**
 * A display figure set as misregistered process plates — the catalogue's cover
 * grammar, used for the wallet balance, the referral code and the admin KPIs.
 *
 * Three plates (C, M, Y), no black: the dark core is the C x M x Y multiply
 * overlap and the fringes are registration drift. Only the paper span is in
 * the accessibility tree; the plates are aria-hidden repeats of the same text.
 *
 * Offsets are em-scaled, so pass any font size. The pointer-lean vars
 * (--press-nx/--press-ny) come from the design system's print-plates.js, which
 * this app does not ship — they default to 0 and the plates render statically,
 * which is the intended fallback.
 */
export function PlateNumeral({
  children,
  className,
  style,
}: {
  children: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn('cmyk-num inline-block font-semibold', className)}
      style={style}
    >
      <span className="paper">{children}</span>
      <span className="plate plate-c" aria-hidden="true">
        {children}
      </span>
      <span className="plate plate-m" aria-hidden="true">
        {children}
      </span>
      <span className="plate plate-y" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
