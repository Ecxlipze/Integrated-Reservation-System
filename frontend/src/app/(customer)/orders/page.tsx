'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/broadsheet/Page';
import { Standfirst } from '@/components/broadsheet';

type OrderStatus =
  | 'Confirmed'
  | 'Awaiting supplier'
  | 'Completed'
  | 'Refunded';

type Order = {
  ref: string;
  name: string;
  place: string;
  dates: string;
  status: OrderStatus;
  total: number;
};

/**
 * TODO(api): there is no GET /orders — only POST /orders/checkout. This list is
 * seeded and shaped to the Order/OrderItem models so a real endpoint drops in
 * without touching the markup.
 */
const ORDERS: Order[] = [
  {
    ref: 'ALM-4471',
    name: 'Casa do Alecrim',
    place: 'Alfama, Lisbon',
    dates: '14–18 September 2026',
    status: 'Confirmed',
    total: 632,
  },
  {
    ref: 'ALM-4468',
    name: 'Hotel Miramar',
    place: 'Cascais',
    dates: '2–5 October 2026',
    status: 'Awaiting supplier',
    total: 415,
  },
  {
    ref: 'ALM-4402',
    name: 'Pousada Serra Verde',
    place: 'Sintra',
    dates: '11–13 June 2026',
    status: 'Completed',
    total: 288,
  },
  {
    ref: 'ALM-4388',
    name: 'Almanac City Rooms',
    place: 'Porto',
    dates: '4–6 April 2026',
    status: 'Refunded',
    total: 0,
  },
];

// Confirmed reads cyan, refunds take the magenta second spot, everything else
// stays neutral.
const STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'secondary' | 'destructive'
> = {
  Confirmed: 'default',
  'Awaiting supplier': 'secondary',
  Completed: 'secondary',
  Refunded: 'destructive',
};

export default function OrdersPage() {
  return (
    <Page>
      <div className="pt-[30px]">
        <h1 className="mb-1 text-[48px] tracking-[-0.015em]">
          Your reservations
        </h1>
        <Standfirst className="mb-[30px]">
          Upcoming first. Vouchers are issued once the supplier confirms.
        </Standfirst>

        {ORDERS.map((order) => (
          <article
            key={order.ref}
            className="grid grid-cols-1 items-start gap-[22px] border-t border-border py-5 md:grid-cols-[90px_1fr_140px_100px_200px]"
          >
            <div className="font-mono text-xs text-ink-600">{order.ref}</div>

            <div>
              <div className="text-[22px] leading-[1.15] font-semibold">
                {order.name}
              </div>
              <div className="text-[14.5px] italic text-ink-700">
                {order.place} · {order.dates}
              </div>
            </div>

            <div>
              <Badge variant={STATUS_VARIANT[order.status]}>
                {order.status}
              </Badge>
            </div>

            <div className="text-[20px] font-semibold md:text-right">
              ${order.total}
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button variant="secondary" size="sm">
                Voucher
              </Button>
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </div>
          </article>
        ))}

        <div className="h-px bg-border" role="presentation" />
      </div>
    </Page>
  );
}
