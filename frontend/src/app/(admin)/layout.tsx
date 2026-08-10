import { AuthProvider } from '@/components/providers/AuthProvider';
import { UserRole } from '@/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider requireRole={UserRole.Admin}>
      <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <h2 className="text-lg font-semibold text-primary">Admin Console</h2>
          </div>
        </header>
        <main className="flex-1 container py-6">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
