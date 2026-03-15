'use client';

import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '@/utils/cn';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OtpInput({ length = 4, value, onChange, error }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback((index: number) => {
    inputs.current[index]?.focus();
  }, []);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const arr = value.split('');
    arr[index] = char;
    const next = arr.join('').slice(0, length);
    onChange(next);
    if (char && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    focusInput(Math.min(pasted.length, length - 1));
  };

  return (
    <div>
      <div className="flex gap-3 justify-center">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={cn(
              'w-14 h-14 text-center text-2xl font-semibold rounded-xl border-2 bg-white transition-colors focus:outline-none',
              error
                ? 'border-red-400'
                : 'border-gray-200 focus:border-[#4ECDC4]',
            )}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
    </div>
  );
}
