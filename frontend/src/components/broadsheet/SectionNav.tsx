'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { href: '/search', label: 'Hotels' },
  { href: '/orders', label: 'Reservations' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/referrals', label: 'Referrals' },
  { href: '/supplier', label: 'Supplier' },
  { href: '/admin', label: 'Admin' },
];

export function SectionNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-[22px] pt-3 text-sm">
      {SECTIONS.map((section) => {
        const current = pathname.startsWith(section.href);
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'no-underline transition-colors hover:text-primary',
              current ? 'text-primary' : 'text-foreground'
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
