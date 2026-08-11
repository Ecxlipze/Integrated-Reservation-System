'use client';

import { useRef, useState } from 'react';

const LENGTH = 6;

/**
 * The six-box one-time code field. Drawn as plain divs in the prototype because
 * it is a static reference; here they are real inputs — numeric keypad, browser
 * autofill on the first box, per-box labels, focus advancing on entry and
 * retreating on backspace.
 *
 * TODO(api): no OTP endpoint exists, so nothing is submitted yet.
 */
export function OtpBoxes({
  onComplete,
}: {
  onComplete?: (code: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (next.every((d) => d !== '')) onComplete?.(next.join(''));
    return next;
  };

  const handleChange = (index: number, raw: string) => {
    const numeric = raw.replace(/\D/g, '');
    if (!numeric) {
      setDigit(index, '');
      return;
    }

    // Pasting or autofilling the whole code fills forward from here.
    if (numeric.length > 1) {
      const next = [...digits];
      for (let i = 0; i < numeric.length && index + i < LENGTH; i++) {
        next[index + i] = numeric[i];
      }
      setDigits(next);
      const landed = Math.min(index + numeric.length, LENGTH - 1);
      inputs.current[landed]?.focus();
      if (next.every((d) => d !== '')) onComplete?.(next.join(''));
      return;
    }

    setDigit(index, numeric);
    if (index < LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, '');
      inputs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < LENGTH - 1) {
      event.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={LENGTH}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          className="h-16 w-[52px] rounded-[2px] border border-border bg-card text-center font-sans text-[30px] text-foreground caret-primary outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      ))}
    </div>
  );
}
