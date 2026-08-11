import { AuthProvider } from '@/components/providers/AuthProvider';
import { UserRole } from '@/store/authStore';
import { Masthead } from '@/components/broadsheet/Masthead';
import { Page, Colophon } from '@/components/broadsheet/Page';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider requireRole={UserRole.Admin}>
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
