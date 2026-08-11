'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Page } from '@/components/broadsheet/Page';
import { Kicker, SectionLabel } from '@/components/broadsheet';
import { PlateNumeral } from '@/components/broadsheet/PlateNumeral';

/**
 * TODO(api): the WalletTransaction model and User.walletBalance both exist, but
 * no route exposes either. These rows are shaped to that model — amount, type
 * ('credit' | 'debit'), description, createdAt — so a real endpoint maps
 * straight on.
 */
const BALANCE = 248;

const LEDGER = [
  {
    date: '9 Aug',
    entry: 'Referral reward — Marta S.',
    amount: 20,
    type: 'credit' as const,
    balance: 248,
  },
  {
    date: '2 Aug',
    entry: 'Refund adjustment — ALM-4388',
    amount: 144,
    type: 'credit' as const,
    balance: 228,
  },
  {
    date: '28 Jul',
    entry: 'Applied to order ALM-4402',
    amount: 60,
    type: 'debit' as const,
    balance: 84,
  },
  {
    date: '19 Jul',
    entry: 'Goodwill credit — late check-in',
    amount: 25,
    type: 'credit' as const,
    balance: 144,
  },
  {
    date: '4 Jul',
    entry: 'Referral reward — Tobias L.',
    amount: 20,
    type: 'credit' as const,
    balance: 119,
  },
];

export default function WalletPage() {
  return (
    <Page>
      <div className="grid gap-[46px] pt-[30px] md:grid-cols-[1fr_300px]">
        <div>
          <Kicker className="mb-3.5">Wallet balance</Kicker>

          <PlateNumeral className="text-[96px]">{`$${BALANCE}`}</PlateNumeral>

          <p className="mt-[22px] max-w-[44ch] text-[15px] leading-[1.5] text-ink-700">
            Credits from referrals, refunds and goodwill adjustments. Spendable
            at checkout on any product; not withdrawable.
          </p>

          <div className="mt-5 flex gap-2.5">
            <Button>Top up</Button>
            <Button variant="secondary">Statement</Button>
          </div>
        </div>

        <div>
          <SectionLabel className="mb-3">Ledger</SectionLabel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LEDGER.map((row) => (
                <TableRow key={`${row.date}-${row.entry}`}>
                  <TableCell className="whitespace-nowrap text-ink-600">
                    {row.date}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {row.entry}
                  </TableCell>
                  <TableCell
                    className={
                      row.type === 'credit'
                        ? 'text-right text-cyan-700'
                        : 'text-right text-magenta-700'
                    }
                  >
                    {row.type === 'credit' ? '+' : '−'}${row.amount}
                  </TableCell>
                  <TableCell className="text-right">${row.balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Page>
  );
}
