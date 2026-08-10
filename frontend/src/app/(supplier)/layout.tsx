import { AuthProvider } from '@/components/providers/AuthProvider';
import { UserRole } from '@/store/authStore';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider requireRole={UserRole.Supplier}>
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Supplier Panel</h2>
          </div>
        </header>
        <main className="flex-1 container py-6">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
