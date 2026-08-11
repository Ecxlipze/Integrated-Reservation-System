'use client';

import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';

/**
 * TODO(api): referrals have no model and no route — this screen is entirely
 * new. Code and invitations are seeded; the fraud rules in the note below are
 * copy describing §5.7 of the requirements doc, not logic implemented here.
 */
const CODE = 'ADA-8842';

type InviteStatus = 'Joined' | 'Invited' | 'Credited' | 'Expired';

const INVITATIONS: {
  who: string;
  sent: string;
  status: InviteStatus;
  reward: string;
}[] = [
  { who: 'Marta S.', sent: '2 Aug', status: 'Credited', reward: '$20' },
  { who: 'Tobias L.', sent: '28 Jul', status: 'Credited', reward: '$20' },
  { who: 'Priya R.', sent: '21 Jul', status: 'Joined', reward: 'Pending stay' },
  { who: 'Sam O.', sent: '2 Jul', status: 'Expired', reward: '—' },
];

const STATUS_VARIANT: Record<
  InviteStatus,
  'default' | 'secondary' | 'destructive'
> = {
  Credited: 'default',
  Joined: 'default',
  Invited: 'secondary',
  Expired: 'secondary',
};

export default function ReferralsPage() {
  const { toast } = useToast();

  const copyLink = async () => {
    const link = `https://almanac.travel/join?code=${CODE}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: 'Link copied',
        description: 'Send it to a friend — credit lands after their stay.',
      });
    } catch {
      toast({
        title: 'Could not copy',
        description: link,
        variant: 'destructive',
      });
    }
  };

  return (
    <Page>
      <div className="grid gap-[46px] pt-[30px] md:grid-cols-[1fr_300px]">
        <div>
          <h1 className="mb-3.5 text-[52px] leading-none tracking-[-0.02em]">
            Give $20, get $20
          </h1>
          <p className="mb-7 max-w-[46ch] text-[18px] leading-[1.55] text-pretty text-[#3c3939]">
            Send a friend your code. They take $20 off their first stay; you get
            $20 in wallet credit once they check out.
          </p>

          <Kicker tone="muted" className="mb-2.5">
            Your code
          </Kicker>
          <PlateNumeral className="text-[64px] tracking-[0.02em]">
            {CODE}
          </PlateNumeral>

          <div className="mt-[26px] flex flex-wrap gap-2.5">
            <Button onClick={copyLink}>Copy link</Button>
            <Button variant="secondary">Email invite</Button>
            <Button variant="secondary">Share</Button>
          </div>
        </div>

        <div>
          <SectionLabel className="mb-3">Invitations</SectionLabel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Friend</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVITATIONS.map((invite) => (
                <TableRow key={invite.who}>
                  <TableCell>{invite.who}</TableCell>
                  <TableCell className="text-ink-600">{invite.sent}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[invite.status]}>
                      {invite.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{invite.reward}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="mt-[18px] max-w-[44ch] text-[12.5px] leading-[1.5] text-ink-600">
            Credit is released after the referee&rsquo;s first completed stay.
            Self-referral and duplicate devices are rejected automatically.
          </p>
        </div>
      </div>
    </Page>
  );
}
