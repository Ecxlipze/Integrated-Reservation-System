'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/broadsheet/Page';
import { Kicker } from '@/components/broadsheet';
import { OtpBoxes } from '@/components/auth/OtpBoxes';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not sign in');

      setAuth(data.token, data.user);
      router.push('/search');
    } catch (error) {
      toast({
        title: 'Sign-in failed',
        description:
          error instanceof Error ? error.message : 'Check your details.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page>
      <div className="grid items-start gap-[46px] pt-10 md:grid-cols-[1fr_300px]">
        <div className="max-w-[420px]">
          <h1 className="mb-2 text-[44px] leading-[1.02] tracking-[-0.015em]">
            Sign in
          </h1>
          <p className="mb-[26px] text-[15px] text-ink-700">
            Or{' '}
            <Link href="/register" className="text-primary">
              create an account
            </Link>{' '}
            — it takes a phone number and one code.
          </p>

          <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
            <label className="block">
              <span className="mb-[5px] block text-xs text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                Email or phone
              </span>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label className="block">
              <span className="mb-[5px] block text-xs text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                Password
              </span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>

            {/* or — hairline / label / hairline */}
            <div className="my-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" role="presentation" />
              <span className="text-[11.5px] tracking-[0.1em] uppercase text-ink-600">
                or
              </span>
              <div className="h-px flex-1 bg-border" role="presentation" />
            </div>

            <Button type="button" variant="secondary" className="w-full">
              Use a one-time code
            </Button>
            <Button type="button" variant="secondary" className="w-full">
              Sign in with a passkey
            </Button>
          </form>

          <p className="mt-[22px] text-[12.5px] leading-[1.5] text-ink-600">
            New devices are logged and unusual sign-ins are challenged. Sessions
            expire after 30 days.
          </p>
        </div>

        <div>
          <Kicker className="mb-3.5">Verify</Kicker>
          <p className="mb-4 max-w-[40ch] text-[15px] text-ink-700">
            We send a six-digit code to the number on your account.
          </p>

          <OtpBoxes />

          <div className="mt-5 flex gap-2.5">
            {/* TODO(api): no OTP endpoint exists — this panel is presentational. */}
            <Button disabled>Verify</Button>
            <Button variant="ghost" disabled>
              Resend in 0:24
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
