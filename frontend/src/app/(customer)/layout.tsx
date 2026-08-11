import { AuthProvider } from '@/components/providers/AuthProvider';
import { UserRole } from '@/store/authStore';
import { Masthead } from '@/components/broadsheet/Masthead';
import { Page, Colophon } from '@/components/broadsheet/Page';

// Every surface is paper — no tinted body background, no coloured role
// heading. Role is communicated by a cyan kicker above each page title.
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider requireRole={UserRole.Customer}>
      <div className="flex min-h-screen flex-col">
        <Page>
          <Masthead />
        </Page>
        <main className="flex-1">{children}</main>
        <Colophon />
      </div>
    </AuthProvider>
  );
}
