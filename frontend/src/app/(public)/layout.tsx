import { Masthead } from '@/components/broadsheet/Masthead';
import { Page, Colophon } from '@/components/broadsheet/Page';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Page>
        <Masthead />
      </Page>
      <main className="flex-1">{children}</main>
      <Colophon />
    </div>
  );
}
