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

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not register');

      if (data.token && data.user) {
        setAuth(data.token, data.user);
        router.push('/search');
      } else {
        router.push('/login');
      }
    } catch (error) {
      toast({
        title: 'Registration failed',
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
            Create an account
          </h1>
          <p className="mb-[26px] text-[15px] text-ink-700">
            Already have one?{' '}
            <Link href="/login" className="text-primary">
              Sign in
            </Link>
            .
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="First name">
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </Field>
              <Field label="Last name">
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </Field>
            </div>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Phone">
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-[22px] text-[12.5px] leading-[1.5] text-ink-600">
            We send one code to confirm your number. New devices are logged and
            unusual sign-ins are challenged.
          </p>
        </div>

        <div>
          <Kicker className="mb-3.5">Verify</Kicker>
          <p className="mb-4 max-w-[40ch] text-[15px] text-ink-700">
            Enter the six-digit code we send to your phone.
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-[5px] block text-xs text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
        {label}
      </span>
      {children}
    </label>
  );
}
