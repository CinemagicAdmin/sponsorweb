'use client';

import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'lg',
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-[#4ECDC4] text-white hover:bg-[#45b8b0] focus:ring-[#4ECDC4]':
            variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300':
            variant === 'secondary',
          'border-2 border-[#4ECDC4] text-[#4ECDC4] hover:bg-[#4ECDC4]/10 focus:ring-[#4ECDC4]':
            variant === 'outline',
          'text-gray-600 hover:bg-gray-100 focus:ring-gray-300':
            variant === 'ghost',
        },
        {
          'px-4 py-2 text-sm': size === 'sm',
          'px-5 py-2.5 text-base': size === 'md',
          'px-6 py-3.5 text-lg w-full': size === 'lg',
        },
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}
