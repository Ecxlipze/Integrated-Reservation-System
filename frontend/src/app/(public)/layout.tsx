import { CartDrawer } from '@/components/cart/CartDrawer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="font-bold text-xl tracking-tight">Antigravity Travel</div>
          <nav className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium hover:underline underline-offset-4">Sign In</a>
            <CartDrawer />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
